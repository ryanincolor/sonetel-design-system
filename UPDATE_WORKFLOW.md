# Design Token Update Workflow

## Automatic Updates After Token Studio Changes

When tokens are updated via Token Studio and pushed to the repository, follow these steps to update your local UI:

### Method 1: Automatic Update (Recommended)

```bash
npm run update
```

This will:

1. Pull latest changes from remote repository
2. Rebuild all token files (CSS, SCSS, JS, JSON, iOS, Android)
3. Update the design system UI

### Method 2: Manual Steps

```bash
# Pull latest token changes
git pull

# Rebuild tokens
npm run build

# Restart dev server
npm run dev
```

### Method 3: Quick Rebuild (if you already have latest tokens)

```bash
npm run build
```

## Automatic Git Hooks

The repository includes a `post-merge` Git hook that will automatically rebuild tokens when:

- You pull changes that include token updates
- You merge branches that modify the `tokens/` directory

## Development Server

After rebuilding tokens, restart your dev server to see the changes:

```bash
npm run dev
```

The UI will then reflect the latest token changes from Token Studio.

## Files Updated on Token Rebuild

- `dist/web/tokens.css` - CSS custom properties
- `dist/web/tokens.scss` - Sass variables
- `dist/web/tokens.js` - JavaScript ES6 module
- `dist/web/tokens.json` - JSON token data
- `dist/ios/SonetelTokens.swift` - iOS Swift constants
- `dist/android/colors.xml` - Android color resources
- `dist/android/dimens.xml` - Android dimension resources
- `dist/index.html` - Updated design system UI
