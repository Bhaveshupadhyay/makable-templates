import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'
import { getAllTemplates, getChangedTemplates } from '../scripts/changed'

describe('changed template detection', () => {
  const templatesDir = join(import.meta.dir, '..', 'templates')

  it('lists all templates when no baseRef is passed', async () => {
    const templates = await getAllTemplates(templatesDir)
    expect(templates.length).toBeGreaterThanOrEqual(2)
    const ids = templates.map((t) => t.id)
    expect(ids).toContain('portfolio')
    expect(ids).toContain('paper')
  })

  it('falls back safely to all templates when baseRef is invalid or undefined', async () => {
    const templates = await getChangedTemplates(templatesDir, undefined)
    expect(templates.length).toBeGreaterThanOrEqual(2)
  })
})
