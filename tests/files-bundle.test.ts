import { describe, expect, it } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { bundleSource } from '../scripts/bundle'

describe('files.json source bundling', () => {
  it('bundles source files and applies exclusion rules', async () => {
    const tmpDir = join(import.meta.dir, '__tmp_bundle_test__')
    await rm(tmpDir, { recursive: true, force: true })
    await mkdir(join(tmpDir, 'src'), { recursive: true })
    await mkdir(join(tmpDir, 'node_modules', 'pkg'), { recursive: true })
    await mkdir(join(tmpDir, 'dist'), { recursive: true })
    await mkdir(join(tmpDir, 'assets'), { recursive: true })

    // Source files to include
    await writeFile(join(tmpDir, 'src', 'App.tsx'), 'export const App = () => <div>Hello</div>')
    await writeFile(join(tmpDir, 'package.json'), '{"name": "test"}')

    // Files that MUST be excluded
    await writeFile(join(tmpDir, 'template.json'), '{"id": "test"}')
    await writeFile(join(tmpDir, 'bun.lock'), 'mock lockfile')
    await writeFile(join(tmpDir, 'package-lock.json'), 'mock lockfile')
    await writeFile(join(tmpDir, 'node_modules', 'pkg', 'index.js'), 'export default 1')
    await writeFile(join(tmpDir, 'dist', 'bundle.js'), 'compiled code')

    // Binary file to test base64 separation
    const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0x02])
    await writeFile(join(tmpDir, 'assets', 'icon.png'), binaryData)

    const bundle = await bundleSource(tmpDir)

    // Included files
    expect(bundle['src/App.tsx']).toBe('export const App = () => <div>Hello</div>')
    expect(bundle['package.json']).toBe('{"name": "test"}')

    // Excluded files
    expect(bundle['template.json']).toBeUndefined()
    expect(bundle['bun.lock']).toBeUndefined()
    expect(bundle['package-lock.json']).toBeUndefined()
    expect(bundle['node_modules/pkg/index.js']).toBeUndefined()
    expect(bundle['dist/bundle.js']).toBeUndefined()

    // Binary file in separate key
    expect(bundle['assets/icon.png']).toBeUndefined()
    expect(bundle.binary).toBeDefined()
    expect(bundle.binary?.['assets/icon.png']).toBe(binaryData.toString('base64'))

    await rm(tmpDir, { recursive: true, force: true })
  })
})
