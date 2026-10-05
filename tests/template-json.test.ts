import { describe, expect, it } from 'bun:test'
import { templateSchema } from '../scripts/types'

describe('template.json validation', () => {
  it('accepts a valid react template.json', () => {
    const valid = {
      id: 'neon-dev',
      category: 'dev-portfolio',
      name: 'Neon Dev',
      description: 'Dark, glowing developer portfolio',
      kind: 'react',
      version: 1,
      tags: ['dark', 'minimal'],
      contentPath: 'src/content/portfolio.ts',
      themes: ['minimal', 'terminal'],
    }
    const result = templateSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts a valid static template.json', () => {
    const valid = {
      id: 'paper',
      category: 'dev-portfolio',
      name: 'Paper',
      description: 'Plain HTML, CSS and JS. No build step.',
      kind: 'static',
      version: 1,
      tags: ['static', 'html'],
      contentPath: 'content/portfolio.js',
    }
    const result = templateSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects non-kebab-case id', () => {
    const invalid = {
      id: 'NeonDev',
      category: 'dev-portfolio',
      name: 'Neon Dev',
      description: 'Test',
      kind: 'react',
      version: 1,
      contentPath: 'src/content/portfolio.ts',
    }
    const result = templateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects non-kebab-case category', () => {
    const invalid = {
      id: 'neon-dev',
      category: 'Dev Portfolio',
      name: 'Neon Dev',
      description: 'Test',
      kind: 'react',
      version: 1,
      contentPath: 'src/content/portfolio.ts',
    }
    const result = templateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects non-positive version numbers', () => {
    const invalid = {
      id: 'neon-dev',
      category: 'dev-portfolio',
      name: 'Neon Dev',
      description: 'Test',
      kind: 'react',
      version: 0,
      contentPath: 'src/content/portfolio.ts',
    }
    const result = templateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects missing contentPath', () => {
    const invalid = {
      id: 'neon-dev',
      category: 'dev-portfolio',
      name: 'Neon Dev',
      description: 'Test',
      kind: 'react',
      version: 1,
    }
    const result = templateSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
