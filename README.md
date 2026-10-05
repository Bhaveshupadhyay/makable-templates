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
| `bun --bun scripts/build.ts --all` | Validate, build, and bundle all templates (fast local build, skips screenshots) |
| `bun --bun scripts/build.ts --all --screenshots` | Run full build including local Playwright screenshots |
| `bun --bun scripts/build.ts --changed <ref>` | Build only templates changed since `<ref>` |

---

## Automated CI/CD Publishing & Screenshots

When a new template is committed and pushed to `main`:
1. **GitHub Actions Workflow** (`.github/workflows/publish.yml`) runs automatically.
2. It detects the added or changed template.
3. It builds the template and runs Playwright Chromium in the runner to capture the 1280×800 screenshot (`thumb.webp` / `thumb-<theme>.webp`).
4. It updates the published catalog config (`catalog.json` and `<category>/catalog.json`) with the live thumbnail URL.
5. It commits and publishes the demos, screenshots, and catalogs to the `gh-pages` branch, instantly hosting them via GitHub Pages.

---

## How to Remove a Template

There are two ways to remove a template:

### 1. Via GitHub Actions (Recommended)
1. Navigate to the **Actions** tab in GitHub and select **Remove Template**.
2. Click **Run workflow**, enter the category ID (e.g. `dev-portfolio`) and template ID (e.g. `clean-dev`).
3. The workflow removes the template from `main`, deletes its published assets from `gh-pages`, updates the catalogs, and commits both branches.

### 2. Locally via CLI
```bash
bun --bun scripts/remove.ts --category dev-portfolio --id clean-dev
```

