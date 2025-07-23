#!/usr/bin/env node

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import fs from "fs";
import path from "path";

// ✅ Register all built-in Token Studio transforms with expand
register(StyleDictionary, {
  expand: true
});

// Register a custom name transform for kebab-case with SWA prefix
StyleDictionary.registerTransform({
  name: 'name/swa/kebab',
  type: 'name',
  transform: function(token, options) {
    // Convert the token path to kebab-case with swa prefix
    let kebabName = token.path.join('-').toLowerCase().replace(/\s+/g, '-');
    
    // Fix compound words (fontFamily -> font-family, fontSize -> font-size, etc.)
    kebabName = kebabName
      .replace(/fontfamily/g, 'font-family')
      .replace(/fontsize/g, 'font-size')
      .replace(/fontweight/g, 'font-weight')
      .replace(/lineheight/g, 'line-height')
      .replace(/letterspacing/g, 'letter-spacing');
    
    return `swa-${kebabName}`;
  }
});

// For now, let's focus on post-processing optimization
// The token pipeline is complex, so we'll optimize after generation

// Register a custom transform to keep letter spacing as percentages
StyleDictionary.registerTransform({
  name: 'size/letterspacing-percent',
  type: 'value',
  filter: function(token) {
    return token.type === 'letterSpacing' ||
           (token.attributes && token.attributes.category === 'letter-spacing') ||
           token.path.includes('letter-spacing') ||
           token.path.includes('letterSpacing');
  },
  transform: function(token, options) {
    // Keep letter spacing as percentages, don't convert
    if (typeof token.value === 'string' && token.value.includes('%')) {
      // Mark as transformed to prevent further processing
      token._letterSpacingTransformed = true;
      return token.value; // Keep as percentage
    }
    return token.value;
  }
});

// Register a custom ts/size/px transform that excludes letter spacing
StyleDictionary.registerTransform({
  name: 'ts/size/px-no-letterspacing',
  type: 'value',
  filter: function(token) {
    // Apply ts/size/px logic but exclude letterSpacing and already transformed tokens
    return !token._letterSpacingTransformed &&
           token.type !== 'letterSpacing' &&
           !token.path.includes('letter-spacing') &&
           !token.path.includes('letterSpacing') &&
           (token.type === 'dimension' ||
            token.type === 'fontSizes' ||
            token.type === 'spacing' ||
            token.path.includes('font-size') ||
            token.path.includes('fontSize') ||
            token.name.includes('font-size') ||
            token.name.includes('fontSize') ||
            (token.attributes && (token.attributes.category === 'size' || token.attributes.type === 'fontSizes')) ||
            (typeof token.value === 'number' && !token.value.toString().includes('%')));
  },
  transform: function(token, options) {
    const value = parseFloat(token.value);
    if (isNaN(value)) return token.value;
    return value + 'px';
  }
});

// ✅ Format: Output flattened CSS variables (handles longform typography)
StyleDictionary.registerFormat({
  name: 'css/variables/combined',
  format: function ({ dictionary }) {
    const lines = [':root {'];
    dictionary.allTokens.forEach(token => {
      if (typeof token.value === 'object') {
        Object.entries(token.value).forEach(([varName, value]) => {
          lines.push(`  ${varName}: ${value};`);
        });
      } else {
        lines.push(`  --${token.name}: ${token.value};`);
      }
    });
    lines.push('}');
    return lines.join('\n');
  }
});

// Create custom transform group - only our custom transforms, tokens-studio handles the rest
StyleDictionary.registerTransformGroup({
  name: 'tokens-studio-swa',
  transforms: [
    'name/swa/kebab',                 // Our custom SWA namespace transform
    'size/letterspacing-percent',     // Keep letter spacing as % FIRST
    'ts/size/px-no-letterspacing',    // Custom ts/size/px that excludes letter spacing
  ]
});

console.log("🏗️  Building design tokens...");

// Configuration for webapp layout tokens (spacing and typography - non-color)
const layoutConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Spacing.json", "tokens/Webapp/Typography.json"],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  platforms: {
    web: {
      transformGroup: "tokens-studio-swa",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-layout.css",
          format: "css/variables",
          filter: function(token) {
            // Only include webapp tokens, exclude core tokens
            return token.filePath.includes("Webapp/");
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

// Configuration for light theme webapp color tokens
const lightConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Color/Light.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio-swa",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-light.css",
          format: "css/variables",
          filter: function(token) {
            // Only include webapp color tokens
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

// Configuration for dark theme webapp color tokens
const darkConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Color/Dark.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio-swa",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens-dark.css",
          format: "css/variables",
          filter: function(token) {
            // Only include webapp color tokens
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

// Build webapp layout tokens (spacing, typography - non-mode specific)
console.log("📏 Building webapp layout tokens (spacing, typography)...");
const layoutSd = new StyleDictionary(layoutConfig);
await layoutSd.buildPlatform("web");

// Build light theme color tokens
console.log("☀️  Building webapp light theme color tokens...");
const lightSd = new StyleDictionary(lightConfig);
await lightSd.buildPlatform("web");

// Build dark theme color tokens
console.log("🌙 Building webapp dark theme color tokens...");
const darkSd = new StyleDictionary(darkConfig);
await darkSd.buildPlatform("web");

// Combine all CSS files into single tokens.css
console.log("🔄 Combining webapp tokens into single CSS file...");
const distPath = "dist/web/";
const layoutPath = path.join(distPath, "tokens-layout.css");
const lightPath = path.join(distPath, "tokens-light.css");
const darkPath = path.join(distPath, "tokens-dark.css");

let combinedCss = "";

// Add webapp layout tokens (non-mode specific) with optimization
if (fs.existsSync(layoutPath)) {
  let layoutCss = fs.readFileSync(layoutPath, "utf8");

  // Optimize typography tokens - remove Light and Prominent variants, keep only Regular
  console.log("🎯 Optimizing typography tokens - removing duplicate variants...");

  // Extract Regular typography tokens and convert to optimized format
  const typographyOptimizations = new Map();
  const lines = layoutCss.split('\n');
  const optimizedLines = [];

  lines.forEach(line => {
    const trimmed = line.trim();

    // Check if this is a typography token line
    if (trimmed.startsWith('--swa-') && (
      trimmed.includes('headline-') ||
      trimmed.includes('body-') ||
      trimmed.includes('label-') ||
      trimmed.includes('display-')
    )) {

      // If it's a Light or Prominent variant, skip it
      if (trimmed.includes('-light-') || trimmed.includes('-prominent-')) {
        console.log(`Removing duplicate: ${trimmed.split(':')[0]}`);
        return; // Skip this line
      }

      // If it's a Regular variant, convert to optimized format
      if (trimmed.includes('-regular-')) {
        const match = trimmed.match(/--swa-(.+?)-regular-(.+?):\s*(.+?);/);
        if (match) {
          const [, baseName, property, value] = match;

          // Add font-weight variants for this base instead of the original font-weight
          if (property === 'font-weight') {
            if (!typographyOptimizations.has(baseName)) {
              typographyOptimizations.set(baseName, true);
              optimizedLines.push(`  --swa-${baseName}-font-weight-light: 400;`);
              optimizedLines.push(`  --swa-${baseName}-font-weight-regular: 500;`);
              optimizedLines.push(`  --swa-${baseName}-font-weight-prominent: 600;`);
            }
            return; // Skip adding the original font-weight variable
          }

          // For non-font-weight properties, add the optimized variable
          const optimizedVarName = `--swa-${baseName}-${property}`;
          optimizedLines.push(`  ${optimizedVarName}: ${value};`);
          return;
        }
      }
    }

    // Keep all non-typography lines as-is
    optimizedLines.push(line);
  });

  combinedCss = optimizedLines.join('\n');
  console.log(`✅ Typography optimization complete - removed ${lines.length - optimizedLines.length} duplicate variables`);
}

// Add light theme color tokens (as second :root)
if (fs.existsSync(lightPath)) {
  const lightCss = fs.readFileSync(lightPath, "utf8");
  combinedCss += `\n\n${lightCss}`;
}

// Add dark theme color tokens
if (fs.existsSync(darkPath)) {
  const darkCss = fs.readFileSync(darkPath, "utf8");
  combinedCss += `\n\n${darkCss}`;
}

// Write combined CSS file
fs.writeFileSync(path.join(distPath, "tokens.css"), combinedCss);

// Clean up separate files
[layoutPath, lightPath, darkPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

// Build other platforms
console.log("📱 Building other platforms...");
const otherConfig = {
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
    "web-json": {
      transformGroup: "tokens-studio-swa",
      buildPath: "dist/web/",
      files: [
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

const otherSd = new StyleDictionary(otherConfig);
await otherSd.buildAllPlatforms();

console.log("✅ Design tokens built successfully!");
console.log("📝 Generated files:");
console.log("   - dist/web/tokens.css (webapp tokens only - no core tokens)");
console.log("   - dist/web/tokens.json");
console.log("   - dist/android/colors.xml");
console.log("   - dist/android/dimens.xml");
console.log("   - dist/ios/SonetelTokens.swift");
console.log("");
console.log("📋 CSS structure (webapp tokens only):");
console.log("   - :root { /* webapp spacing + typography */ }");
console.log("   - :root { /* webapp light theme colors */ }");
console.log("   - [data-theme=\"dark\"] { /* webapp dark theme colors */ }");
