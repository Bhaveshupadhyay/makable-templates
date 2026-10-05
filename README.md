# makable-templates

Public repository and build pipeline for [makable](https://github.com/Bhaveshupadhyay/makable) site templates.

Templates are never bundled directly into the builder app. Instead, this repository compiles, validates, bundles, and publishes them as static assets to GitHub Pages (`https://bhaveshupadhyay.github.io/makable-templates`). The builder fetches template catalogs and sources over HTTP.

---

## Repository Structure

```
makable-templates/
├── categories/
│   └── <category-id>/
│       ├── category.json       # Category metadata & schemaVersion
│       ├── schema.ts           # Zod content schema
│       └── sample-content.ts   # Realistic sample content for demo/screenshots
├── templates/
│   └── <category-id>/
│       └── <template-id>/
│           ├── template.json   # Template metadata & configuration
│           └── ...             # Source code (React+Vite or static HTML/CSS/JS)
├── scripts/                    # Build, bundle, and verification tooling
├── tests/                      # Unit tests
└── out/                        # Built artifacts published to gh-pages branch
```

---

## How to Add a New Template

1. Choose a category (e.g., `dev-portfolio`).
2. Create a new directory under `templates/<category-id>/<template-id>/`.
3. Create `template.json`:
   ```json
   {
     "id": "my-template",
     "category": "dev-portfolio",
     "name": "My Template",
     "description": "Clean, responsive developer portfolio",
     "kind": "react",
     "version": 1,
     "tags": ["minimal", "dark"],
     "contentPath": "src/content/portfolio.ts"
   }
   ```
4. Build the template following the **Editable Contract**:
   * All copy must come from the single file at `contentPath`.
   * Every element that displays content must include a `data-content="<path>"` attribute (e.g., `data-content="profile.name"`, `data-content="projects.0.name"`).
   * For React templates: Use React + Vite + TS + Tailwind v4. Themes must be plain CSS variables under `[data-theme="…"]` (no `@theme` directives). Allowed runtime dependencies: `react`, `react-dom`, `lucide-react`, `framer-motion`.
   * For Static templates: Plain HTML/CSS/JS modules. DOM elements must be populated using `textContent` (never `innerHTML`).
5. Run tests and build:
   ```bash
   bun test
   bun --bun scripts/build.ts --all
   ```

---

## How to Add a New Category

1. Create a directory under `categories/<category-id>/`.
2. Add `category.json`:
   ```json
   {
     "id": "designer-portfolio",
     "name": "Designer Portfolio",
     "description": "Portfolios tailored for UI/UX, product, and graphic designers",
     "schemaVersion": 1
   }
   ```
3. Add `schema.ts`: Define the Zod schema representing the content contract for that category.
4. Add `sample-content.ts`: Realistic sample data matching the schema, used for demos and automated screenshot generation.
5. Create templates under `templates/<category-id>/<template-id>/`.

---

## Development Commands

| Command | Action |
|---|---|
| `bun install` | Install all dependencies across workspaces |
| `bun test` | Run unit tests |
| `bun --bun scripts/build.ts --all` | Validate, build, and screenshot all templates |
| `bun --bun scripts/build.ts --changed <ref>` | Build only templates changed since `<ref>` |
