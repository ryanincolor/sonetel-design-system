# Sonetel Design System

This repository contains the design tokens and Style Dictionary configuration for the Sonetel Design System.

## Structure

```
├── tokens/           # Design tokens (Token Studio format)
├── dist/            # Generated files (auto-generated)
│   ├── web/         # CSS, SCSS, JS files
│   ├── ios/         # Swift files
│   └── android/     # XML resource files
├── style-dictionary.config.js  # Style Dictionary configuration
└── package.json     # Dependencies and scripts
```

## Usage

### Install Dependencies
```bash
npm install
```

### Build Tokens
```bash
npm run build-tokens
```

This will generate platform-specific files in the `dist/` directory:

- **Web**: CSS custom properties, SCSS variables, JavaScript tokens
- **iOS**: Swift constants and UIColor extensions  
- **Android**: XML resource files for colors and dimensions

### Automatic Builds

GitHub Actions automatically builds tokens when:
- Changes are pushed to `tokens/` directory
- Pull requests modify token files
- Manual workflow trigger

## Integration

### React/Web Apps
Import the generated CSS file:
```css
@import url('./dist/web/tokens.css');
```

Or use the JavaScript tokens:
```javascript
import tokens from './dist/web/tokens.js';
```

### iOS Apps
Import the Swift file:
```swift
import SonetelTokens

let primaryColor = SonetelTokens.colorPrimary500
```

### Android Apps
Reference in your XML:
```xml
android:textColor="@color/color_primary_500"
```

## Token Studio Integration

This repository is designed to work with [Token Studio](https://tokens.studio/) Figma plugin:

1. Export tokens from Figma using Token Studio
2. Commit token JSON files to the `tokens/` directory
3. GitHub Actions automatically builds platform files
4. Import generated files into your projects

## Contributing

1. Update tokens in Figma using Token Studio
2. Export and commit token files
3. Automated build will generate platform files
4. Use generated files in your applications
