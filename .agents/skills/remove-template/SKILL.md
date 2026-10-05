---
name: remove-template
description: Remove any site template from the makable catalog, source code (main), and GitHub Pages hosting (gh-pages).
---

# Remove Template Skill

Use this skill whenever asked to remove or delete a template from `makable-templates`.

## Target Repository
- Repository: `Bhaveshupadhyay/makable-templates`
- Base URL: `https://bhaveshupadhyay.github.io/makable-templates`

---

## Method 1: GitHub Actions (Recommended)

Trigger the `remove-template.yml` workflow via GitHub CLI. This deletes the template from `main`, deletes published files from `gh-pages`, updates `catalog.json`, and commits both branches.

### 1. Trigger Command
```bash
gh workflow run remove-template.yml -f category=<category-id> -f id=<template-id> --repo Bhaveshupadhyay/makable-templates
```
*Example:*
```bash
gh workflow run remove-template.yml -f category=dev-portfolio -f id=clean-dev --repo Bhaveshupadhyay/makable-templates
```

### 2. Monitor Run
```bash
# Get latest run ID
gh run list --workflow="remove-template.yml" --repo Bhaveshupadhyay/makable-templates --limit 1

# Watch run to completion
gh run watch $(gh run list --workflow="remove-template.yml" --repo Bhaveshupadhyay/makable-templates --limit 1 --json databaseId --jq '.[0].databaseId') --repo Bhaveshupadhyay/makable-templates
```

---

## Method 2: Local CLI Script

Run directly inside the `makable-templates` repository root.

```bash
cd /path/to/makable-templates
bun --bun scripts/remove.ts --category <category-id> --id <template-id>
```

This will:
1. Delete `templates/<category-id>/<template-id>/`
2. Delete `out/<category-id>/<template-id>/` (if `out/` exists)
3. Regenerate `out/catalog.json` and `out/<category-id>/catalog.json`

Then push the changes:
```bash
git add templates/
git commit -m "chore(templates): remove <category-id>/<template-id>"
git push origin main
```

---

## Verification

After removing, verify that the template is unlisted:

### 1. Check Live Catalog
```bash
curl -s https://raw.githubusercontent.com/Bhaveshupadhyay/makable-templates/gh-pages/catalog.json | jq '.templates[] | select(.id == "<template-id>")'
```
*Expected output:* Empty (no matching entry).

### 2. Verify 404 on Demo
```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://bhaveshupadhyay.github.io/makable-templates/<category-id>/<template-id>/1/demo/"
```
*Expected output:* `404`
