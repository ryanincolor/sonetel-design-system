#!/usr/bin/env node

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import fs from "fs";

// ✅ Register all built-in Token Studio transforms with expand
register(StyleDictionary, {
  expand: true
});

console.log("🏗️  Building minimal design tokens for dev server...");

// Create output directory
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}
if (!fs.existsSync("dist/web")) {
  fs.mkdirSync("dist/web");
}

// Create a simple CSS file with basic tokens to get the server running
const basicCss = `
/* Basic Design Tokens - Generated for development */
:root {
  /* Colors */
  --swa-color-white: #fff;
  --swa-color-black: #000;
  --swa-color-primary: #0066cc;
  
  /* Spacing */
  --swa-spacing-sm: 8px;
  --swa-spacing-md: 16px;
  --swa-spacing-lg: 24px;
  --swa-spacing-xl: 32px;
  
  /* Typography */
  --swa-font-family: 'Inter', sans-serif;
  --swa-font-size-sm: 12px;
  --swa-font-size-md: 14px;
  --swa-font-size-lg: 16px;
  --swa-font-size-xl: 20px;
  --swa-font-weight-normal: 400;
  --swa-font-weight-medium: 500;
  --swa-font-weight-bold: 600;
}
`;

fs.writeFileSync("dist/web/tokens.css", basicCss);

console.log("✅ Minimal tokens generated successfully!");
console.log("📝 Generated files:");
console.log("   - dist/web/tokens.css (basic tokens for development)");
console.log("");
console.log("💡 Note: This is a minimal build to get the dev server running.");
console.log("   The reference errors in the full build need to be resolved separately.");
