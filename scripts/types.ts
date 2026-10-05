import { z } from 'zod'

export const themeMetaSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export const templateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Template id must be kebab-case'),
  category: z.string().regex(/^[a-z0-9-]+$/, 'Category must be kebab-case'),
  name: z.string().min(1),
  description: z.string().min(1),
  kind: z.enum(['react', 'static']),
  version: z.number().int().positive(),
  tags: z.array(z.string()).default([]),
  contentPath: z.string().min(1),
  themes: z.array(z.string()).optional(),
  themeMeta: z.record(z.string(), themeMetaSchema).optional(),
})
export type TemplateJson = z.infer<typeof templateSchema>

export const categorySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Category id must be kebab-case'),
  name: z.string().min(1),
  description: z.string().min(1),
  schemaVersion: z.number().int().positive(),
})
export type CategoryJson = z.infer<typeof categorySchema>

export type CatalogEntry = {
  id: string
  category: string
  name: string
  description: string
  kind: 'react' | 'static'
  version: number
  tags: string[]
  theme?: string
  contentPath: string
  thumbnailUrl: string
  demoUrl: string
  filesUrl: string
}

export type CatalogCategory = {
  id: string
  name: string
  description: string
  count: number
}

export type Catalog = {
  generatedAt: string
  baseUrl: string
  categories: CatalogCategory[]
  templates: CatalogEntry[]
}

export type CategoryCatalog = {
  generatedAt: string
  baseUrl: string
  category: CatalogCategory
  templates: CatalogEntry[]
}
