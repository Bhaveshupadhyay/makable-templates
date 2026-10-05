# makable-templates

Public repository and build pipeline for makable site templates. Templates are published as static assets to GitHub Pages (`https://bhaveshupadhyay.github.io/makable-templates`) and fetched dynamically by the builder.

## Commands

All commands run from the repository root with Bun. Always use `bun --bun ...`, never Node.

| Command | Purpose |
|---|---|
| `bun install` | Install all workspaces and dependencies |
| `bun test` | Run unit tests |
| `bun --bun scripts/build.ts --all` | Validate, build, bundle, and screenshot all templates |
| `bun --bun scripts/build.ts --changed <ref>` | Build only templates changed since `<ref>` (e.g. `HEAD~1`) |

## Repo Layout

```
makable-templates/
package.json         Bun workspace root (workspaces: templates/*/*)
categories/          Category definitions, schemas, and sample content
  <category>/
    category.json    { id, name, description, schemaVersion }
    schema.ts        Zod content schema for this category
    sample-content.ts Realistic sample content used for demos and screenshots
templates/           Template implementations
  <category>/
    <template-id>/
      template.json  { id, category, name, description, kind, version, tags, contentPath, themes? }
      ...            Template source (React+Vite or static HTML/CSS/JS)
scripts/             Build tooling (TypeScript)
tests/               Unit tests
out/                 Build output published to gh-pages branch
.github/workflows/   CI workflow to publish to gh-pages
```

## The Editable Contract

Templates must strictly follow the editable contract. Violations fail `bun --bun scripts/build.ts`:

1. **Content Isolation**: All copy must reside in the single file specified by `contentPath`. No hard-coded personal details or placeholder text in markup.
2. **Visual Editing Hooks**: Every element displaying content carries `data-content="<path>"` (e.g. `data-content="profile.name"`, `data-content="projects.0.name"`).
3. **React Templates**:
   - Stack: React + Vite + TS + Tailwind v4.
   - Themes are plain CSS variables under `[data-theme="…"]`. No `@theme` or Tailwind-only directives.
   - Allowed runtime dependencies: `react`, `react-dom`, `lucide-react`, `framer-motion`.
4. **Static Templates**:
   - Plain HTML/CSS/JS ES modules with no npm dependencies.
   - DOM must be populated via `textContent` (never `innerHTML`).
5. **URL Safety**: All content URLs must use `http(s)` protocols only.
6. **Immutable Versions**: Once a template version is published to `out/<category>/<id>/<version>/`, its `files.json` is immutable. If the source changes, increment `version` in `template.json`.

## Code Style

- No semicolons, single quotes, 2-space indentation.
- Kebab-case filenames, named exports.
- Sparse comments explaining *why*, not *what*.
