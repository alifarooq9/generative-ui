# Dark App Template

Quick-start template for new React Native apps with Dark design system.

## Features

- ✅ **Design System**: `@darkresearch/design-system` pre-configured
- ✅ **Generative UI Ready**: `galerie-rn` + `streamdown-rn` available
- ✅ **Squircles**: Modern iOS-style rounded corners
- ✅ **Dark Branding**: #EEEDED + #262626 color system
- ✅ **NativeWind**: Tailwind CSS for React Native
- ✅ **Cross-platform**: iOS, Android, Web

## Quick Start

**⚠️ Important**: This template must be copied OUTSIDE the monorepo to work properly.

```bash
# From monorepo root
cp -r apps/starter ../my-new-app
cd ../my-new-app

# Replace workspace dependencies with actual packages
# Edit package.json and change:
# "@darkresearch/design-system": "workspace:*" 
# to
# "@darkresearch/design-system": "file:../generative-ui/packages/design-system"
# (or use published npm versions when available)

# Install dependencies
bun install

# Run on iOS
npx expo prebuild
npx expo run:ios

# Run on web
bun run web
```

## Testing

This template includes Storybook stories (`App.stories.tsx`) as reference examples following our `.cursor/rules/testing.mdc` guidelines.

**Visual testing**:
```bash
npm run storybook # Visual component gallery
```

**Note**: Automated testing infrastructure will be added in a future update.

## Using Design System Components

```tsx
import { FAB, Squircle } from '@darkresearch/design-system';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Settings01Icon } from '@hugeicons/core-free-icons';

function MyScreen() {
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

## Adding More Components

The design system uses React Native Reusables under the hood. To add new components:

```bash
cd ../design-system
npx @react-native-reusables/cli add button card dialog
```

All components automatically use Dark branding (configured in `tailwind.config.js`).

## Project Structure

```
my-new-app/
├── App.tsx              # Main app entry
├── components/          # Your app components
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Available Packages

- `@darkresearch/design-system` - UI components
- `@darkresearch/streamdown-rn` - Streaming markdown renderer
- `@darkresearch/galerie-rn` - Generative UI canvas

## Learn More

- [Design System Documentation](../../design-system/README.md)
- [Cursor AI Rules](.cursor/rules/)
- [AGENTS.md](../../AGENTS.md) - AI development workflow

