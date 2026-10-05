import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export type TemplateRef = {
  category: string
  id: string
  dir: string
}

/** Lists all templates existing under templatesDir. */
export async function getAllTemplates(templatesDir: string): Promise<TemplateRef[]> {
  const result: TemplateRef[] = []
  const catEntries = await readdir(templatesDir, { withFileTypes: true })

  for (const catEntry of catEntries) {
    if (!catEntry.isDirectory()) continue
    const catDir = join(templatesDir, catEntry.name)
    const tplEntries = await readdir(catDir, { withFileTypes: true })

    for (const tplEntry of tplEntries) {
      if (!tplEntry.isDirectory()) continue
      result.push({
        category: catEntry.name,
        id: tplEntry.name,
        dir: join(catDir, tplEntry.name),
      })
    }
  }

  return result
}

/**
 * Detects which templates changed based on a git diff against baseRef.
 * If scripts or categories changed, returns all templates for safety.
 */
export async function getChangedTemplates(
  templatesDir: string,
  baseRef?: string,
): Promise<TemplateRef[]> {
  const all = await getAllTemplates(templatesDir)
  if (!baseRef) return all

  try {
    const proc = Bun.spawn(['git', 'diff', '--name-only', baseRef], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const output = await new Response(proc.stdout).text()
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      console.warn(`git diff against ${baseRef} failed, falling back to all templates`)
      return all
    }

    const changedFiles = output.trim().split('\n').filter(Boolean)
    if (changedFiles.length === 0) return []

    // If core scripts or categories changed, rebuild all templates
    const coreChange = changedFiles.some(
      (f) => f.startsWith('scripts/') || f.startsWith('categories/') || f === 'package.json',
    )
    if (coreChange) {
      console.log('Core scripts or schemas changed: rebuilding all templates')
      return all
    }

    // Match templates/<category>/<id>/...
    const changedKeys = new Set<string>()
    for (const file of changedFiles) {
      const parts = file.split('/')
      if (parts[0] === 'templates' && parts.length >= 3) {
        changedKeys.add(`${parts[1]}/${parts[2]}`)
      }
    }

    return all.filter((tpl) => changedKeys.has(`${tpl.category}/${tpl.id}`))
  } catch (err) {
    console.warn(`Error running git diff: ${String(err)}, falling back to all templates`)
    return all
  }
}
