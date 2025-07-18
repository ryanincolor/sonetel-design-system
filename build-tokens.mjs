#!/usr/bin/env node

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import fs from "fs";
import path from "path";

// Register the tokens-studio transforms
register(StyleDictionary);

console.log("🏗️  Building design tokens...");

// Configuration for mode-independent tokens (spacing only)
const spacingConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Spacing.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-spacing.css",
          format: "css/variables",
          filter: function (token) {
            // Only include webapp spacing tokens, not core tokens
            return token.filePath.includes("Webapp/Spacing");
          },
          options: {
            showFileHeader: true,
            selector: ":root",
          },
        },
      ],
    },
  },
};

// Configuration for light theme (default)
const lightConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Color/Light.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-light.css",
          format: "css/variables",
          filter: function (token) {
            // Only include webapp light theme tokens, not core tokens
            return token.filePath.includes("Webapp/Color/Light");
          },
          options: {
            showFileHeader: true,
            selector: ":root",
          },
        },
      ],
    },
  },
};

// Configuration for dark theme webapp tokens
const darkConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Color/Dark.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-dark.css",
          format: "css/variables",
          filter: function (token) {
            // Only include webapp color tokens, not core tokens
            return token.filePath.includes("Webapp/Color/Dark");
          },
          options: {
            showFileHeader: true,
            selector: '[data-theme="dark"]',
          },
        },
      ],
    },
  },
};

// Build spacing tokens (mode-independent)
console.log("📏 Building spacing tokens (mode-independent)...");
const spacingSd = new StyleDictionary(spacingConfig);
await spacingSd.buildAllPlatforms();

// Build light theme tokens (default)
console.log("☀️  Building light theme tokens (default)...");
const lightSd = new StyleDictionary(lightConfig);
await lightSd.buildAllPlatforms();

// Build dark theme tokens
console.log("🌙 Building dark theme tokens...");
const darkSd = new StyleDictionary(darkConfig);
await darkSd.buildAllPlatforms();

// Also build other platforms with full config for completeness
console.log("📱 Building other platforms...");
const fullConfig = {
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    ios: {
      transformGroup: "ios",
      buildPath: "dist/ios/",
      files: [
        {
          destination: "SonetelTokens.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "SonetelTokens",
            showFileHeader: true,
          },
        },
      ],
    },
    android: {
      transformGroup: "android",
      buildPath: "dist/android/",
      files: [
        {
          destination: "colors.xml",
          format: "android/resources",
          filter: {
            type: "color",
          },
          options: {
            showFileHeader: true,
          },
        },
        {
          destination: "dimens.xml",
          format: "android/resources",
          filter: {
            type: "dimension",
          },
          options: {
            showFileHeader: true,
          },
        },
      ],
    },
    "web-other": {
      transformGroup: "tokens-studio",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
          options: {
            showFileHeader: true,
          },
        },
        {
          destination: "tokens.json",
          format: "json/nested",
          options: {
            showFileHeader: false,
          },
        },
      ],
    },
  },
};

const fullSd = new StyleDictionary(fullConfig);
await fullSd.buildAllPlatforms();

console.log("🔄 Combining CSS files...");

// Read the separate CSS files
const distPath = "dist/web/";
let spacingCss = "";
let lightCss = "";
let darkCss = "";

// Read spacing tokens file (mode-independent)
const spacingPath = path.join(distPath, "tokens-spacing.css");
if (fs.existsSync(spacingPath)) {
  spacingCss = fs.readFileSync(spacingPath, "utf8");
}

// Read light theme file (default)
const lightPath = path.join(distPath, "tokens-light.css");
if (fs.existsSync(lightPath)) {
  lightCss = fs.readFileSync(lightPath, "utf8");
}

// Read dark theme file
const darkPath = path.join(distPath, "tokens-dark.css");
if (fs.existsSync(darkPath)) {
  darkCss = fs.readFileSync(darkPath, "utf8");
}

// Combine them into one file with proper swa prefix
let combinedCss = spacingCss;
if (lightCss) {
  combinedCss += `\n\n${lightCss}`;
}
if (darkCss) {
  combinedCss += `\n\n${darkCss}`;
}

// Convert variable names to use --swa- prefix and kebab-case
combinedCss = combinedCss
  .replace(/--elevation/g, "--swa-elevation")
  .replace(/--onSurface/g, "--swa-on-surface")
  .replace(/--status/g, "--swa-status")
  .replace(/--brand/g, "--swa-brand")
  .replace(/--spacing/g, "--swa-spacing")
  // Convert camelCase to kebab-case for better matching
  .replace(/--swa-elevationSolid/g, "--swa-elevation-solid")
  .replace(/--swa-elevationAlpha/g, "--swa-elevation-alpha")
  .replace(/--swa-on-surfaceInverse/g, "--swa-on-surface-inverse")
  .replace(/--swa-on-surfaceSeconday/g, "--swa-on-surface-seconday")
  .replace(/--swa-on-surfaceTertiary/g, "--swa-on-surface-tertiary")
  .replace(/--swa-on-surfacePrimary/g, "--swa-on-surface-primary")
  .replace(/--swa-on-surfaceOnDark/g, "--swa-on-surface-on-dark")
  .replace(/--swa-on-surfaceOnLight/g, "--swa-on-surface-on-light")
  .replace(/--swa-statusCritical/g, "--swa-status-critical")
  .replace(/--swa-brandYellow/g, "--swa-brand-yellow")
  // Add hyphens before numbers
  .replace(/--swa-elevation-solid(\d)/g, "--swa-elevation-solid-$1")
  .replace(/--swa-elevation-alpha(\d)/g, "--swa-elevation-alpha-$1")
  .replace(/--swa-spacing(\d)/g, "--swa-spacing-$1")
  // Fix spacing variable names to use consistent hyphen formatting
  .replace(/--swa-spacingXs/g, "--swa-spacing-xs")
  .replace(/--swa-spacingSm/g, "--swa-spacing-sm")
  .replace(/--swa-spacingMd/g, "--swa-spacing-md")
  .replace(/--swa-spacingLg/g, "--swa-spacing-lg")
  .replace(/--swa-spacingXl/g, "--swa-spacing-xl");

// Write the combined file
fs.writeFileSync(path.join(distPath, "tokens.css"), combinedCss);

// Generate custom JavaScript exports for webapp tokens
console.log("🔧 Generating JavaScript exports...");
await generateJavaScriptTokens();

// Clean up the separate files
if (fs.existsSync(spacingPath)) {
  fs.unlinkSync(spacingPath);
}
if (fs.existsSync(lightPath)) {
  fs.unlinkSync(lightPath);
}
if (fs.existsSync(darkPath)) {
  fs.unlinkSync(darkPath);
}

// Function to generate JavaScript exports for webapp tokens
async function generateJavaScriptTokens() {
  const lightConfig = {
    source: [
      "tokens/Core/**/*.json",
      "tokens/Webapp/Color/Light.json",
      "tokens/Webapp/Spacing.json",
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      js: {
        transformGroup: "tokens-studio",
        buildPath: "dist/web/",
        files: [
          {
            destination: "tokens-light.json",
            format: "json/flat",
            filter: function (token) {
              return token.filePath.includes("Webapp/");
            },
          },
        ],
      },
    },
  };

  const darkConfig = {
    source: [
      "tokens/Core/**/*.json",
      "tokens/Webapp/Color/Dark.json",
      "tokens/Webapp/Spacing.json",
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      js: {
        transformGroup: "tokens-studio",
        buildPath: "dist/web/",
        files: [
          {
            destination: "tokens-dark.json",
            format: "json/flat",
            filter: function (token) {
              return token.filePath.includes("Webapp/");
            },
          },
        ],
      },
    },
  };

  // Build light and dark tokens for JS
  const lightJsSd = new StyleDictionary(lightConfig);
  const darkJsSd = new StyleDictionary(darkConfig);

  await lightJsSd.buildAllPlatforms();
  await darkJsSd.buildAllPlatforms();

  // Read the generated JSON files
  const lightTokensPath = path.join(distPath, "tokens-light.json");
  const darkTokensPath = path.join(distPath, "tokens-dark.json");

  let lightTokens = {};
  let darkTokens = {};

  if (fs.existsSync(lightTokensPath)) {
    lightTokens = JSON.parse(fs.readFileSync(lightTokensPath, "utf8"));
  }

  if (fs.existsSync(darkTokensPath)) {
    darkTokens = JSON.parse(fs.readFileSync(darkTokensPath, "utf8"));
  }

  // Convert to JavaScript exports
  let jsContent = `/**
 * Do not edit directly, this file was auto-generated.
 */

// Light theme tokens (default)
`;

  // Add light theme exports
  for (const [key, value] of Object.entries(lightTokens)) {
    const camelCaseKey = key
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/-/g, "");
    jsContent += `export const swa${camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1)} = "${value}";\n`;
  }

  jsContent += `\n// Dark theme tokens\n`;

  // Add dark theme exports
  for (const [key, value] of Object.entries(darkTokens)) {
    const camelCaseKey = key
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/-/g, "");
    jsContent += `export const swa${camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1)}Dark = "${value}";\n`;
  }

  // Write the JavaScript file
  fs.writeFileSync(path.join(distPath, "tokens.js"), jsContent);

  // Clean up temporary files
  if (fs.existsSync(lightTokensPath)) {
    fs.unlinkSync(lightTokensPath);
  }
  if (fs.existsSync(darkTokensPath)) {
    fs.unlinkSync(darkTokensPath);
  }
}

console.log("✅ Design tokens built successfully!");
console.log("📝 Generated files:");
console.log("   - dist/web/tokens.css (webapp only with --swa- prefix)");
console.log("   - dist/web/tokens.js (webapp only with swa prefix)");
console.log("   - dist/web/tokens.json");
console.log("   - dist/android/colors.xml");
console.log("   - dist/android/dimens.xml");
console.log("   - dist/ios/SonetelTokens.swift");
