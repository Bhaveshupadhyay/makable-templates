import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { bundleSource } from './bundle'
import {
  buildCatalogEntries,
  buildCategoryCatalog,
  buildFullCatalog,
  loadCategories,
  loadTemplates,
} from './catalog'
import { getAllTemplates, getChangedTemplates, type TemplateRef } from './changed'
import { runPlaywrightContractAndScreenshots, runStaticContractChecks } from './contract'
import { templateSchema, type TemplateJson } from './types'

const REPO_ROOT = join(import.meta.dir, '..')
const CATEGORIES_DIR = join(REPO_ROOT, 'categories')
const TEMPLATES_DIR = join(REPO_ROOT, 'templates')
const OUT_DIR = join(REPO_ROOT, 'out')

function parseArgs() {
  const args = process.argv.slice(2)
  let all = false
  let changedBase: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') {
      all = true
    } else if (args[i] === '--changed') {
      changedBase = args[++i]
    }
  }

  return { all: all || !changedBase, changedBase }
}

async function loadSampleContent(category: string): Promise<string> {
  const sampleModulePath = join(CATEGORIES_DIR, category, 'sample-content.ts')
  const mod = await import(sampleModulePath)
  const data = mod.samplePortfolio ?? mod.default ?? mod.sampleContent
  if (!data) {
    throw new Error(`No sample content exported from ${sampleModulePath}`)
  }
  return JSON.stringify(data, null, 2)
}

function areBundlesEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function buildTemplate(ref: TemplateRef) {
  const templateDir = ref.dir
  const tplJsonPath = join(templateDir, 'template.json')

  if (!existsSync(tplJsonPath)) {
    throw new Error(`Missing template.json in ${templateDir}`)
  }

  const rawJson = await readFile(tplJsonPath, 'utf-8')
  const tpl: TemplateJson = templateSchema.parse(JSON.parse(rawJson))

  if (tpl.category !== ref.category || tpl.id !== ref.id) {
    throw new Error(
      `template.json mismatch: expected category "${ref.category}" and id "${ref.id}", got "${tpl.category}" and "${tpl.id}"`,
    )
  }

  console.log(`\n▶ Building template: ${tpl.category}/${tpl.id} (v${tpl.version})`)

  const outVersionDir = join(OUT_DIR, tpl.category, tpl.id, String(tpl.version))
  const demoDir = join(outVersionDir, 'demo')
  const filesJsonPath = join(outVersionDir, 'files.json')

  // 1. Bundle original source
  const sourceBundle = await bundleSource(templateDir)

  // 2. Check immutable version: if files.json exists on disk, compare contents
  if (existsSync(filesJsonPath)) {
    const existingRaw = await readFile(filesJsonPath, 'utf-8')
    const existingBundle = JSON.parse(existingRaw)
    if (!areBundlesEqual(sourceBundle, existingBundle)) {
      throw new Error(
        `Immutable version check failed: ${tpl.category}/${tpl.id} v${tpl.version} is already published with different contents. Bump version in template.json.`,
      )
    }
    console.log(`  Version ${tpl.version} already published with identical files; rebuilding demo and assets.`)
  }

  // 3. Static contract checks
  await runStaticContractChecks(templateDir, tpl)

  // 4. Temporarily inject sample content for demo build
  const contentFullPath = join(templateDir, tpl.contentPath)
  const originalContent = await readFile(contentFullPath, 'utf-8')
  const sampleJson = await loadSampleContent(tpl.category)

  let injectedContent = ''
  if (tpl.contentPath.endsWith('.ts')) {
    injectedContent = `// Generated sample content for demo\nexport const portfolio = ${sampleJson} as const\n`
  } else {
    injectedContent = `// Generated sample content for demo\nexport const portfolio = ${sampleJson}\n`
  }

  await writeFile(contentFullPath, injectedContent, 'utf-8')

  const basePath = `/makable-templates/${tpl.category}/${tpl.id}/${tpl.version}/demo/`

  try {
    await mkdir(demoDir, { recursive: true })

    if (tpl.kind === 'react') {
      console.log('  Running Vite build...')
      const proc = Bun.spawn(
        ['bun', '--bun', 'vite', 'build', `--base=${basePath}`, `--outDir=${demoDir}`, '--emptyOutDir'],
        {
          cwd: templateDir,
          stdout: 'inherit',
          stderr: 'inherit',
        },
      )
      const code = await proc.exited
      if (code !== 0) {
        throw new Error(`Vite build failed for ${tpl.id} with exit code ${code}`)
      }
    } else {
      console.log('  Copying static files to demo...')
      // Copy template directory contents to demoDir, excluding unwanted files
      await cp(templateDir, demoDir, {
        recursive: true,
        filter: (src) => {
          const name = src.split('/').pop() || ''
          return !['template.json', 'node_modules', '.git', 'bun.lock'].includes(name)
        },
      })
    }

    // 5. Playwright contract verification and screenshots
    console.log('  Verifying editable contract and capturing thumbnails with Playwright...')
    await runPlaywrightContractAndScreenshots(tpl, demoDir, outVersionDir, basePath)

    // 6. Write files.json
    await writeFile(filesJsonPath, JSON.stringify(sourceBundle, null, 2), 'utf-8')
    console.log(`  ✔ Built and verified ${tpl.id} (v${tpl.version})`)
  } finally {
    // Restore original content file
    await writeFile(contentFullPath, originalContent, 'utf-8')
  }
}

async function regenerateCatalogs() {
  console.log('\n▶ Regenerating catalogs...')
  const categories = await loadCategories(CATEGORIES_DIR)
  const templates = await loadTemplates(TEMPLATES_DIR)
  const entries = buildCatalogEntries(templates)

  await mkdir(OUT_DIR, { recursive: true })

  // 1. Global catalog
  const fullCatalog = buildFullCatalog(categories, entries)
  const fullPath = join(OUT_DIR, 'catalog.json')
  await writeFile(fullPath, JSON.stringify(fullCatalog, null, 2), 'utf-8')
  console.log(`  ✔ Global catalog: ${fullPath} (${entries.length} template entries)`)

  // 2. Per-category catalogs
  for (const [id, cat] of categories) {
    const catOutDir = join(OUT_DIR, id)
    await mkdir(catOutDir, { recursive: true })
    const catCatalog = buildCategoryCatalog(cat, entries)
    const catPath = join(catOutDir, 'catalog.json')
    await writeFile(catPath, JSON.stringify(catCatalog, null, 2), 'utf-8')
    console.log(`  ✔ Category catalog: ${catPath} (${catCatalog.templates.length} entries)`)
  }
}

async function main() {
  const { all, changedBase } = parseArgs()

  let selected: TemplateRef[] = []
  if (all) {
    console.log('Targeting ALL templates')
    selected = await getAllTemplates(TEMPLATES_DIR)
  } else {
    console.log(`Targeting CHANGED templates against base ref "${changedBase}"`)
    selected = await getChangedTemplates(TEMPLATES_DIR, changedBase)
  }

  console.log(`Found ${selected.length} template(s) to build.`)

  for (const ref of selected) {
    await buildTemplate(ref)
  }

  // Always regenerate catalogs from all templates
  await regenerateCatalogs()

  console.log('\n✨ Build complete!\n')
}

main().catch((err) => {
  console.error('\n❌ Build failed:', err)
  process.exit(1)
})
