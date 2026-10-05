import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.git', '.next', 'build'])
const EXCLUDED_FILES = new Set([
  'template.json',
  'bun.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.DS_Store',
])

const BINARY_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.pdf',
  '.mp4',
  '.webm',
])

export type BundledFiles = {
  [path: string]: string
  binary?: Record<string, string>
}

function isBinary(filePath: string, buffer: Buffer): boolean {
  for (const ext of BINARY_EXTS) {
    if (filePath.endsWith(ext)) return true
  }
  // Check first 512 bytes for null byte
  const len = Math.min(buffer.length, 512)
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true
  }
  return false
}

/** Recursively lists all eligible files within a template directory. */
async function getFiles(dir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relPath = relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      files.push(...(await getFiles(fullPath, baseDir)))
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name)) continue
      files.push(relPath)
    }
  }

  return files.sort()
}

/**
 * Bundles the template's source files into a clean JSON-serializable object.
 * Excludes node_modules, dist, lockfiles, template.json, and stores binaries in `binary`.
 */
export async function bundleSource(templateDir: string): Promise<BundledFiles> {
  const relPaths = await getFiles(templateDir, templateDir)
  const result: BundledFiles = {}
  let binaryMap: Record<string, string> | undefined

  for (const relPath of relPaths) {
    const fullPath = join(templateDir, relPath)
    const buffer = await readFile(fullPath)

    if (isBinary(relPath, buffer)) {
      if (!binaryMap) binaryMap = {}
      binaryMap[relPath] = buffer.toString('base64')
    } else {
      result[relPath] = buffer.toString('utf-8')
    }
  }

  if (binaryMap && Object.keys(binaryMap).length > 0) {
    result.binary = binaryMap
  }

  return result
}
