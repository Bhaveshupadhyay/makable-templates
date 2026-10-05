import { describe, expect, it } from 'bun:test'
import {
  buildCatalogEntries,
  buildCategoryCatalog,
  buildFullCatalog,
  DEFAULT_BASE_URL,
} from '../scripts/catalog'
import type { CategoryJson, TemplateJson } from '../scripts/types'

describe('catalog generation', () => {
  const mockCategories = new Map<string, CategoryJson>([
    [
      'dev-portfolio',
      {
        id: 'dev-portfolio',
        name: 'Developer Portfolio',
        description: 'Test category',
        schemaVersion: 1,
      },
    ],
  ])

  const mockTemplates: TemplateJson[] = [
    {
      id: 'portfolio',
      category: 'dev-portfolio',
      name: 'Developer Portfolio',
      description: 'Multi-theme template',
      kind: 'react',
      version: 1,
      tags: ['portfolio'],
      contentPath: 'src/content/portfolio.ts',
      themes: ['minimal', 'terminal', 'bento', 'editorial'],
      themeMeta: {
        minimal: { name: 'Minimal', description: 'Clean minimal', tags: ['light'] },
        terminal: { name: 'Terminal', description: 'Dark terminal', tags: ['dark'] },
      },
    },
    {
      id: 'paper',
      category: 'dev-portfolio',
      name: 'Paper',
      description: 'Static paper portfolio',
      kind: 'static',
      version: 1,
      tags: ['html', 'clean'],
      contentPath: 'content/portfolio.js',
    },
  ]

  it('expands multi-theme templates into discrete catalog entries with exact ids', () => {
    const entries = buildCatalogEntries(mockTemplates, DEFAULT_BASE_URL)
    // 4 themes + 1 static = 5 entries
    expect(entries.length).toBe(5)

    const minimal = entries.find((e) => e.id === 'minimal')
    expect(minimal).toBeDefined()
    expect(minimal?.name).toBe('Minimal')
    expect(minimal?.description).toBe('Clean minimal')
    expect(minimal?.demoUrl).toBe(
      'https://bhaveshupadhyay.github.io/makable-templates/dev-portfolio/portfolio/1/demo/?theme=minimal',
    )
    expect(minimal?.thumbnailUrl).toBe(
      'https://bhaveshupadhyay.github.io/makable-templates/dev-portfolio/portfolio/1/thumb-minimal.webp',
    )
    expect(minimal?.filesUrl).toBe(
      'https://bhaveshupadhyay.github.io/makable-templates/dev-portfolio/portfolio/1/files.json',
    )

    const paper = entries.find((e) => e.id === 'paper')
    expect(paper).toBeDefined()
    expect(paper?.demoUrl).toBe(
      'https://bhaveshupadhyay.github.io/makable-templates/dev-portfolio/paper/1/demo/',
    )
  })

  it('builds a complete global catalog with category count', () => {
    const entries = buildCatalogEntries(mockTemplates, DEFAULT_BASE_URL)
    const catalog = buildFullCatalog(mockCategories, entries, DEFAULT_BASE_URL)

    expect(catalog.baseUrl).toBe(DEFAULT_BASE_URL)
    expect(catalog.categories.length).toBe(1)
    expect(catalog.categories[0].id).toBe('dev-portfolio')
    expect(catalog.categories[0].count).toBe(5)
    expect(catalog.templates.length).toBe(5)
  })

  it('builds a single category catalog', () => {
    const entries = buildCatalogEntries(mockTemplates, DEFAULT_BASE_URL)
    const cat = mockCategories.get('dev-portfolio')!
    const catCatalog = buildCategoryCatalog(cat, entries, DEFAULT_BASE_URL)

    expect(catCatalog.category.id).toBe('dev-portfolio')
    expect(catCatalog.category.count).toBe(5)
    expect(catCatalog.templates.length).toBe(5)
  })
})
