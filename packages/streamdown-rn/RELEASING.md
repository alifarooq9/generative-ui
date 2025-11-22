# Release process with Changesets

streamdown-rn uses [Changesets](https://github.com/changesets/changesets) for version management and publishing - the same system Vercel uses for Streamdown.

## How It Works

1. **Contributors add changesets** - Describe what changed and the version bump type
2. **Automated PR** - GitHub Actions creates a "Version Packages" PR aggregating all changes
3. **Merge to publish** - When you merge the Version Packages PR, it automatically publishes to npm

## For Contributors

When you make a change that should be published, add a changeset:

```bash
bun run changeset
```

This will prompt you:

1. **Which packages changed?** - Select `streamdown-rn`
2. **What kind of change?** - Choose:
   - `patch` - Bug fixes (0.1.0 → 0.1.1)
   - `minor` - New features (0.1.0 → 0.2.0)
   - `major` - Breaking changes (0.1.0 → 1.0.0)
3. **Summary** - Describe what changed (will appear in CHANGELOG)

This creates a file in `.changeset/` that you commit with your PR.

### Example Workflow

```bash
# Make your changes
git checkout -b feature/add-tables

# ... make changes ...

# Add a changeset
bun run changeset
# Choose: patch
# Summary: "Add support for markdown tables"

# Commit everything
git add .
git commit -m "Add markdown table support"

# Push and create PR
git push origin feature/add-tables
```

## For maintainers

### The automated flow

1. **PRs get merged** with changesets
2. **GitHub Actions** automatically creates/updates a "Version Packages" PR
3. **Review the Version Packages PR** - Check:
   - Version bump is correct
   - CHANGELOG looks good
   - All changes are included
4. **Merge the Version Packages PR** - This triggers:
   - Version bump in package.json
   - CHANGELOG.md update
   - Git tag creation
   - npm publish (with provenance)

### Manual Version Bump (if needed)

If you need to publish without changesets:

```bash
# Create a changeset manually
bun run changeset

# Version (updates package.json and CHANGELOG)
bun run version

# Publish
bun run release
```

## Benefits

✅ **Automated versioning** - No manual version bumps  
✅ **Automatic CHANGELOG** - Generated from changeset descriptions  
✅ **Aggregated releases** - Multiple PRs = one version bump  
✅ **Clear change tracking** - Know exactly what's in each version  
✅ **Same as Vercel** - Industry-standard workflow
