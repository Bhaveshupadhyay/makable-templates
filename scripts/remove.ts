import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { cleanOrphanOutputs, loadCategories, writeCatalogs } from './catalog'

export interface RemoveTemplateOptions {
  category: string
  id: string
  repoRoot?: string
}

export async function removeTemplate(options: RemoveTemplateOptions) {
  const { category, id, repoRoot = join(import.meta.dir, '..') } = options

  if (!category || !id) {
    throw new Error('Both category and id are required to remove a template.')
  }

  const templatesDir = join(repoRoot, 'templates')
  const categoriesDir = join(repoRoot, 'categories')
  const outDir = join(repoRoot, 'out')

  const templateDir = join(templatesDir, category, id)
  const outTemplateDir = join(outDir, category, id)

  let removedSource = false
  let removedOutput = false

  if (existsSync(templateDir)) {
    console.log(`Removing source directory: ${templateDir}`)
    await rm(templateDir, { recursive: true, force: true })
    removedSource = true
    console.log(`  ✔ Removed source template: templates/${category}/${id}`)
  } else {
    console.log(`  ℹ Source template not found: templates/${category}/${id}`)
  }

  if (existsSync(outTemplateDir)) {
    console.log(`Removing published output: ${outTemplateDir}`)
    await rm(outTemplateDir, { recursive: true, force: true })
    removedOutput = true
    console.log(`  ✔ Removed published output: out/${category}/${id}`)
  } else {
    console.log(`  ℹ Published output not found: out/${category}/${id}`)
  }

  // Also clean any orphan outputs and regenerate catalogs if out/ exists
  if (existsSync(outDir)) {
    console.log('\n▶ Regenerating catalogs...')
    const categories = await loadCategories(categoriesDir)
    await cleanOrphanOutputs(templatesDir, outDir, categories)
    await writeCatalogs(outDir, categoriesDir, templatesDir)
    console.log('  ✔ Catalogs successfully updated')
  }

  return { removedSource, removedOutput }
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2)
  let category = ''
  let id = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      category = args[++i]
    } else if (args[i] === '--id' && args[i + 1]) {
      id = args[++i]
    } else if (!args[i].startsWith('-')) {
      if (!category) category = args[i]
      else if (!id) id = args[i]
    }
  }

  if (!category || !id) {
    console.error('Usage: bun --bun scripts/remove.ts --category <category> --id <id>')
    console.error('Example: bun --bun scripts/remove.ts --category dev-portfolio --id clean-dev')
    process.exit(1)
  }

  try {
    const res = await removeTemplate({ category, id })
    console.log(`\n✨ Successfully processed template removal: ${category}/${id}`)
    console.log(`   Source removed: ${res.removedSource}, Published output removed: ${res.removedOutput}\n`)
  } catch (err) {
    console.error(`\n❌ Failed to remove template:`, err)
    process.exit(1)
  }
}
