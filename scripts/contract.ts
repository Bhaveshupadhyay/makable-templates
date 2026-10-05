import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, type Browser } from 'playwright'
import type { TemplateJson } from './types'

const ALLOWED_RUNTIME_DEPS = new Set(['react', 'react-dom', 'lucide-react', 'framer-motion'])

const REQUIRED_DATA_CONTENT_PATHS = [
  'profile.name',
  'profile.headline',
  'profile.bio',
  'projects.0.name',
  'projects.0.description',
]

/**
 * Static checks on template source code to verify contract rules.
 */
export async function runStaticContractChecks(templateDir: string, tpl: TemplateJson) {
  // Check React template rules
  if (tpl.kind === 'react') {
    const pkgPath = join(templateDir, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
      const deps = Object.keys(pkg.dependencies ?? {})
      for (const dep of deps) {
        if (!ALLOWED_RUNTIME_DEPS.has(dep)) {
          throw new Error(
            `Contract violation in ${tpl.id}: dependency "${dep}" is not allowed. Allowed: ${[...ALLOWED_RUNTIME_DEPS].join(', ')}`,
          )
        }
      }
    }

    // Check CSS files for @theme directives
    const files = await readdir(join(templateDir, 'src'), { recursive: true })
    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.css')) {
        const rawContent = await readFile(join(templateDir, 'src', file), 'utf-8')
        // Strip block comments before checking directives
        const content = rawContent.replace(/\/\*[\s\S]*?\*\//g, '')
        if (/@theme\b/.test(content)) {
          throw new Error(
            `Contract violation in ${tpl.id}: @theme directive found in ${file}. Use plain CSS variables under [data-theme="…"] instead.`,
          )
        }
      }
    }
  }

  // Check static template rules
  if (tpl.kind === 'static') {
    const files = await readdir(templateDir, { recursive: true })
    for (const file of files) {
      if (typeof file === 'string' && (file.endsWith('.js') || file.endsWith('.html'))) {
        const content = await readFile(join(templateDir, file), 'utf-8')
        if (/\.innerHTML\s*=/.test(content)) {
          throw new Error(
            `Contract violation in ${tpl.id}: innerHTML assignment found in ${file}. Use textContent or DOM methods.`,
          )
        }
      }
    }
  }
}

/**
 * Runs Playwright to verify data-content attributes and capture 1280x800 thumbnails.
 */
export async function runPlaywrightContractAndScreenshots(
  tpl: TemplateJson,
  demoDir: string,
  outVersionDir: string,
  basePath: string,
) {
  // Start a local static server for demoDir
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      let pathname = decodeURIComponent(url.pathname)

      if (pathname.startsWith(basePath)) {
        pathname = pathname.slice(basePath.length)
      }
      if (pathname.startsWith('/')) {
        pathname = pathname.slice(1)
      }

      let filePath = join(demoDir, pathname)
      let file = Bun.file(filePath)

      if (await file.exists()) {
        const stat = await file.stat()
        if (stat?.isDirectory()) {
          filePath = join(filePath, 'index.html')
          file = Bun.file(filePath)
        }
      } else {
        const indexCandidate = join(filePath, 'index.html')
        const indexFile = Bun.file(indexCandidate)
        if (await indexFile.exists()) {
          file = indexFile
        }
      }

      if (await file.exists()) {
        return new Response(file)
      }
      return new Response('Not found', { status: 404 })
    },
  })

  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    })

    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    const origin = `http://localhost:${server.port}`
    const demoUrl = `${origin}${basePath}`

    // Verify contract on default demo URL
    await page.goto(demoUrl, { waitUntil: 'networkidle' })

    if (errors.length > 0) {
      throw new Error(`Runtime errors during demo load of ${tpl.id}:\n${errors.join('\n')}`)
    }

    // Assert required data-content tags exist
    for (const requiredPath of REQUIRED_DATA_CONTENT_PATHS) {
      const el = page.locator(`[data-content="${requiredPath}"]`).first()
      const count = await el.count()
      if (count === 0) {
        throw new Error(
          `Contract violation in ${tpl.id}: missing required data-content attribute "${requiredPath}"`,
        )
      }
    }

    // Screenshots
    if (tpl.themes && tpl.themes.length > 0) {
      for (const theme of tpl.themes) {
        const themeUrl = `${demoUrl}?theme=${theme}`
        await page.goto(themeUrl, { waitUntil: 'networkidle' })
        const thumbPath = join(outVersionDir, `thumb-${theme}.webp`)
        await page.screenshot({ path: thumbPath, type: 'webp', quality: 85 })
      }
      // Also save default thumb.webp from the first theme
      const firstThemeThumb = join(outVersionDir, `thumb-${tpl.themes[0]}.webp`)
      const defaultThumb = join(outVersionDir, 'thumb.webp')
      await Bun.write(defaultThumb, await Bun.file(firstThemeThumb).arrayBuffer())
    } else {
      const thumbPath = join(outVersionDir, 'thumb.webp')
      await page.screenshot({ path: thumbPath, type: 'webp', quality: 85 })
    }
  } finally {
    if (browser) await browser.close()
    server.stop()
  }
}
