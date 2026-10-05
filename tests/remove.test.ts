import { describe, expect, it, afterEach } from 'bun:test'
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { cleanOrphanOutputs } from '../scripts/catalog'
import { removeTemplate } from '../scripts/remove'
import type { CategoryJson } from '../scripts/types'

describe('template removal and orphan cleanup', () => {
  const testRoot = join(tmpdir(), `makable-test-remove-${Date.now()}`)

  afterEach(async () => {
    if (existsSync(testRoot)) {
      await rm(testRoot, { recursive: true, force: true })
    }
  })

  it('removes template from templates/ and out/ and regenerates catalog', async () => {
    const categoriesDir = join(testRoot, 'categories', 'dev-portfolio')
    const tpl1Dir = join(testRoot, 'templates', 'dev-portfolio', 'tpl-keep')
    const tpl2Dir = join(testRoot, 'templates', 'dev-portfolio', 'tpl-del')
    const outTpl1Dir = join(testRoot, 'out', 'dev-portfolio', 'tpl-keep')
    const outTpl2Dir = join(testRoot, 'out', 'dev-portfolio', 'tpl-del')

    await mkdir(categoriesDir, { recursive: true })
    await mkdir(tpl1Dir, { recursive: true })
    await mkdir(tpl2Dir, { recursive: true })
    await mkdir(outTpl1Dir, { recursive: true })
    await mkdir(outTpl2Dir, { recursive: true })

    const catJson = {
      id: 'dev-portfolio',
      name: 'Developer Portfolio',
      description: 'Dev portfolios',
      schemaVersion: 1,
    }
    await writeFile(join(categoriesDir, 'category.json'), JSON.stringify(catJson, null, 2))

    const keepJson = {
      id: 'tpl-keep',
      category: 'dev-portfolio',
      name: 'Keep Me',
      description: 'Keeper',
      kind: 'static',
      version: 1,
      tags: ['test'],
      contentPath: 'content/portfolio.js',
    }
    const delJson = {
      id: 'tpl-del',
      category: 'dev-portfolio',
      name: 'Delete Me',
      description: 'To be deleted',
      kind: 'static',
      version: 1,
      tags: ['test'],
      contentPath: 'content/portfolio.js',
    }

    await writeFile(join(tpl1Dir, 'template.json'), JSON.stringify(keepJson, null, 2))
    await writeFile(join(tpl2Dir, 'template.json'), JSON.stringify(delJson, null, 2))

    const result = await removeTemplate({
      category: 'dev-portfolio',
      id: 'tpl-del',
      repoRoot: testRoot,
    })

    expect(result.removedSource).toBe(true)
    expect(result.removedOutput).toBe(true)

    // Verify folder existence
    expect(existsSync(tpl1Dir)).toBe(true)
    expect(existsSync(tpl2Dir)).toBe(false)
    expect(existsSync(outTpl1Dir)).toBe(true)
    expect(existsSync(outTpl2Dir)).toBe(false)

    // Verify catalog contents
    const catalogRaw = await readFile(join(testRoot, 'out', 'catalog.json'), 'utf-8')
    const catalog = JSON.parse(catalogRaw)
    expect(catalog.templates.length).toBe(1)
    expect(catalog.templates[0].id).toBe('tpl-keep')
    expect(catalog.categories[0].count).toBe(1)
  })

  it('cleanOrphanOutputs cleans stale published outputs when source does not exist', async () => {
    const templatesDir = join(testRoot, 'templates')
    const outDir = join(testRoot, 'out')
    const catKeepDir = join(templatesDir, 'dev-portfolio', 'live-tpl')
    const outKeepDir = join(outDir, 'dev-portfolio', 'live-tpl')
    const outStaleDir = join(outDir, 'dev-portfolio', 'stale-tpl')

    await mkdir(catKeepDir, { recursive: true })
    await mkdir(outKeepDir, { recursive: true })
    await mkdir(outStaleDir, { recursive: true })

    const mockCategories = new Map<string, CategoryJson>([
      [
        'dev-portfolio',
        {
          id: 'dev-portfolio',
          name: 'Developer Portfolio',
          description: 'Dev portfolios',
          schemaVersion: 1,
        },
      ],
    ])

    const removed = await cleanOrphanOutputs(templatesDir, outDir, mockCategories)
    expect(removed).toEqual(['dev-portfolio/stale-tpl'])
    expect(existsSync(outKeepDir)).toBe(true)
    expect(existsSync(outStaleDir)).toBe(false)
  })
})
