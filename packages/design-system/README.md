# @darkresearch/design-system

UI component library for Dark Research internal apps.

## Philosophy

**Minimal colors, maximum flexibility**:
- Background: `#EEEDED`
- Foreground: `#262626`
- Everything else: Opacity modifiers

**Squircles everywhere**:
- `cornerSmoothing: 0.6` on all rounded elements
- Native performance via `react-native-fast-squircle`

## Installation

This package is part of the generative-ui monorepo and uses workspace linking:

```json
{
  "dependencies": {
    "@darkresearch/design-system": "workspace:*"
  }
}
```

## Usage

```tsx
import { FAB, Squircle } from '@darkresearch/design-system';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Settings01Icon } from '@hugeicons/core-free-icons';

function MyApp() {
  return (
    <FAB
      icon={
        <HugeiconsIcon
          icon={Settings01Icon}
          size={20}
          color="#EEEDED"
        />
      }
      onPress={() => console.log('Pressed')}
    />
  );
}
```

## Components

### Current
- `<FAB />` - Floating Action Button with squircles
- `<Squircle />` - Wrapper for any content with squircle shape

### Adding More Components

This package is built on React Native Reusables. To add components:

```bash
cd packages/design-system
npx @react-native-reusables/cli add button card dialog sheet
```

All components automatically use Dark branding (configured in `tailwind.config.js`).

**See [ADDING_COMPONENTS.md](./ADDING_COMPONENTS.md) for detailed guide.**

## Color System

```tsx
import { colors } from '@darkresearch/design-system';

// Available colors:
colors.bg        // #EEEDED
colors.fg        // #262626  
colors.border    // #262626 at 10% opacity
colors.muted     // #262626 at 40% opacity
colors.secondary // #262626 at 60% opacity
```

## Development

### Run Tests
```bash
bun test
bun run test:watch
```

### View Components
```bash
bun run storybook
```

## Guidelines

See `.cursor/rules/design-system.mdc` for component creation guidelines.

All components should:
- ✅ Use squircles (cornerSmoothing: 0.6)
- ✅ Follow color system (#EEEDED + #262626 + opacity)
- ✅ Include tests + stories
- ✅ Be accessible (touch targets ≥44px)
- ✅ Be performant (React.memo when needed)

