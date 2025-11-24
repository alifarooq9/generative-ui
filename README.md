# Generative UI

React Native components and tools for building generative UI applications.

## Packages

### Core Libraries
- **[@darkresearch/streamdown-rn](./packages/streamdown-rn)** - Streaming markdown parser/renderer with dynamic component injection of Progressive React Native Components
- **[@darkresearch/galerie-rn](./packages/galerie-rn)** - Generative UI canvas management  
- **[@darkresearch/design-system](./packages/design-system)** - UI component library

### Apps
- **[apps/starter](./apps/starter)** - Starter template app

## Design System

Our design system uses a simplified color palette:
- **Background**: `#EEEDED` (light gray)
- **Foreground**: `#262626` (dark gray)
- **Everything else**: Opacity variants (10%, 40%, 60%)

### Key Features
- 🎨 **Squircle shapes** - Modern iOS-style rounded corners (cornerSmoothing: 0.6)
- 🎯 **Native performance** - Uses react-native-fast-squircle
- 🎭 **React Native Reusables** - Pre-configured with Dark branding
- 🎨 **NativeWind** - Tailwind CSS for styling

## Quick Start (New App)

### Using the Template

The `apps/starter/` shows the minimal setup. To start a new app:

```bash
# Copy the template (must be outside monorepo)
cp -r apps/starter ../my-new-app
cd ../my-new-app

# Update package.json to use published packages
# (For now, use file:../generative-ui/packages/design-system)

# Install & run
bun install
npx expo prebuild
npx expo run:ios
```

### Running the Template App

```bash
cd apps/starter
bun run ios    # iOS
bun run web    # Web
```

Your apps will have:
- ✅ Design system components
- ✅ Squircle aesthetic  
- ✅ Dark branding
- ✅ Generative UI ready (galerie + streamdown available)

## Development

### Install Dependencies
```bash
bun install
```

### Build All Packages
```bash
bun run build
```

### Run Template App
```bash
cd apps/starter
bun run ios    # iOS
bun run web    # Web
```

## AI-Assisted Development

This monorepo is optimized for AI-assisted development. See:
- **[AGENTS.md](./AGENTS.md)** - AI development workflow (all AI tools)
- **[.cursor/rules/](./.cursor/rules/)** - Cursor-specific guidelines

When AI creates components, it automatically generates:
- Component implementation (.tsx)
- Tests (.test.tsx)  
- Storybook stories (.stories.tsx)

## Architecture

```
generative-ui/
├── apps/                   # Expo applications
│   └── starter/            # Starter template
├── packages/               # Publishable packages
│   ├── streamdown-rn/      # Parse/render streaming markdown
│   ├── galerie-rn/         # Generative UI canvas (uses streamdown)
│   └── design-system/      # UI components for apps
├── dev-archive/            # Archived dev playground (for reference)
├── .cursor/rules/          # AI coding rules
├── AGENTS.md               # AI workflow docs
├── tailwind.config.js      # Design system colors
└── global.css              # Tailwind directives
```

**How they work together**:
- Apps import `@darkresearch/design-system` for UI
- Apps import `@darkresearch/galerie-rn` for generative canvas
- Galerie uses `@darkresearch/streamdown-rn` for parsing
- All share the same design language

## Contributing

This repo uses AI-first development workflows. Follow the guidelines in:
- `.cursor/rules/design-system.mdc` - Component creation
- `.cursor/rules/testing.mdc` - Test requirements  
- `.cursor/rules/performance.mdc` - Performance budgets
- `.cursor/rules/react-native.mdc` - Platform best practices

----

Built with ❤️ by [Dark](https://darkresearch.ai)
