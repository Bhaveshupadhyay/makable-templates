import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  categorySchema,
  templateSchema,
  type Catalog,
  type CatalogCategory,
  type CatalogEntry,
  type CategoryCatalog,
  type CategoryJson,
  type TemplateJson,
} from './types'

export const DEFAULT_BASE_URL = 'https://bhaveshupadhyay.github.io/makable-templates'

export async function loadCategories(categoriesDir: string): Promise<Map<string, CategoryJson>> {
  const result = new Map<string, CategoryJson>()
  const entries = await readdir(categoriesDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const jsonPath = join(categoriesDir, entry.name, 'category.json')
    try {
      const raw = await readFile(jsonPath, 'utf-8')
      const parsed = categorySchema.parse(JSON.parse(raw))
      if (parsed.id !== entry.name) {
        throw new Error(`Category id "${parsed.id}" does not match folder name "${entry.name}"`)
      }
      result.set(parsed.id, parsed)
    } catch (err) {
      throw new Error(`Invalid category at ${jsonPath}: ${String(err)}`)
    }
  }

  return result
}

export async function loadTemplates(templatesDir: string): Promise<TemplateJson[]> {
  const templates: TemplateJson[] = []
  const catEntries = await readdir(templatesDir, { withFileTypes: true })

  for (const catEntry of catEntries) {
    if (!catEntry.isDirectory()) continue
    const catDir = join(templatesDir, catEntry.name)
    const tplEntries = await readdir(catDir, { withFileTypes: true })

    for (const tplEntry of tplEntries) {
      if (!tplEntry.isDirectory()) continue
      const jsonPath = join(catDir, tplEntry.name, 'template.json')
      try {
        const raw = await readFile(jsonPath, 'utf-8')
        const parsed = templateSchema.parse(JSON.parse(raw))
        if (parsed.category !== catEntry.name) {
          throw new Error(`Template category "${parsed.category}" does not match folder "${catEntry.name}"`)
        }
        if (parsed.id !== tplEntry.name) {
          throw new Error(`Template id "${parsed.id}" does not match folder "${tplEntry.name}"`)
        }
        templates.push(parsed)
      } catch (err) {
        throw new Error(`Invalid template at ${jsonPath}: ${String(err)}`)
      }
    }
  }

  return templates
}

export function buildCatalogEntries(templates: TemplateJson[], baseUrl = DEFAULT_BASE_URL): CatalogEntry[] {
  const entries: CatalogEntry[] = []

  for (const tpl of templates) {
    const basePath = `${baseUrl}/${tpl.category}/${tpl.id}/${tpl.version}`
    const filesUrl = `${basePath}/files.json`

    if (tpl.themes && tpl.themes.length > 0) {
      for (const theme of tpl.themes) {
        const meta = tpl.themeMeta?.[theme]
        entries.push({
          id: theme,
          category: tpl.category,
          name: meta?.name ?? `${tpl.name} (${theme})`,
          description: meta?.description ?? tpl.description,
          kind: tpl.kind,
          version: tpl.version,
          tags: meta?.tags ?? tpl.tags,
          theme,
          contentPath: tpl.contentPath,
          thumbnailUrl: `${basePath}/thumb-${theme}.webp`,
          demoUrl: `${basePath}/demo/?theme=${theme}`,
          filesUrl,
        })
      }
    } else {
      entries.push({
        id: tpl.id,
        category: tpl.category,
        name: tpl.name,
        description: tpl.description,
        kind: tpl.kind,
        version: tpl.version,
        tags: tpl.tags,
        contentPath: tpl.contentPath,
        thumbnailUrl: `${basePath}/thumb.webp`,
        demoUrl: `${basePath}/demo/`,
        filesUrl,
      })
    }
  }

  return entries
}

export function buildFullCatalog(
  categories: Map<string, CategoryJson>,
  entries: CatalogEntry[],
  baseUrl = DEFAULT_BASE_URL,
): Catalog {
  const categoryCounts = new Map<string, number>()
  for (const entry of entries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1)
  }

  const catalogCategories: CatalogCategory[] = []
  for (const [id, cat] of categories) {
    catalogCategories.push({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      count: categoryCounts.get(id) ?? 0,
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    categories: catalogCategories,
    templates: entries,
  }
}

export function buildCategoryCatalog(
  category: CategoryJson,
  entries: CatalogEntry[],
  baseUrl = DEFAULT_BASE_URL,
): CategoryCatalog {
  const filtered = entries.filter((e) => e.category === category.id)
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
      count: filtered.length,
    },
    templates: filtered,
  }
}
