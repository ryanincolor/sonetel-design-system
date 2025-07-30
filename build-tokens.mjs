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

// Register a custom name transform for camelCase with proper dash handling
StyleDictionary.registerTransform({
  name: "name/sma/camel",
  type: "name",
  transform: (token) => {
    // Join all path segments with dots, then split by both dots and dashes
    const fullPath = token.path.join('.');
    const segments = fullPath.split(/[\.\-]/);

    const camelCased = segments
      .map((segment, index) => {
        // Clean up the segment
        let cleanSegment = segment
          .replace(/[^a-zA-Z0-9]/g, '') // Remove remaining special characters
          .toLowerCase();

        // Handle special cases
        if (cleanSegment === 'x') cleanSegment = 'X';
        if (cleanSegment === 'xl') cleanSegment = 'XL';
        if (cleanSegment === '2xl') cleanSegment = '2XL';
        if (cleanSegment === '3xl') cleanSegment = '3XL';

        // First segment stays lowercase, rest get capitalized
        if (index === 0) {
          return cleanSegment;
        } else {
          return cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1);
        }
      })
      .join("");

    return camelCased;
  },
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



// Transform to skip complex typography objects
StyleDictionary.registerTransform({
  name: 'skip/typography-objects',
  type: 'value',
  filter: token => token.type === 'typography' && typeof token.value === 'object',
  transform: token => undefined // Skip these tokens
});

// iOS-specific transforms to clean up values
StyleDictionary.registerTransform({
  name: 'size/ios-points-clean',
  type: 'value',
  filter: token => token.type === 'dimension' || token.type === 'spacing' || token.type === 'fontSizes' || token.type === 'borderRadius',
  transform: token => {
    let value = token.value;
    // Remove common CSS units for iOS
    if (typeof value === 'string') {
      value = value.replace(/px$|pt$|rem$|em$/, '');
    }
    const numValue = parseFloat(value);
    return isNaN(numValue) ? token.value : numValue;
  }
});

StyleDictionary.registerTransform({
  name: 'color/ios-swift-clean',
  type: 'value',
  filter: token => token.type === 'color',
  transform: token => {
    let value = token.value;

    // Handle hex colors
    if (value && typeof value === 'string' && value.startsWith('#')) {
      const r = parseInt(value.substring(1, 3), 16) / 255;
      const g = parseInt(value.substring(3, 5), 16) / 255;
      const b = parseInt(value.substring(5, 7), 16) / 255;
      return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: 1.0)`;
    }

    // Handle rgba colors
    if (value && typeof value === 'string' && value.includes('rgba')) {
      const rgbaMatch = value.match(/rgba?\(([^)]+)\)/);
      if (rgbaMatch) {
        const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
        if (values.length >= 3) {
          const r = values[0] / 255;
          const g = values[1] / 255;
          const b = values[2] / 255;
          const alpha = values.length >= 4 ? values[3] : 1.0;
          return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${alpha.toFixed(3)})`;
        }
      }
    }

    return value;
  }
});

// Create custom iOS transform group that combines tokens-studio with iOS-specific formatting
StyleDictionary.registerTransformGroup({
  name: "ios-tokens-studio",
  transforms: [
    "name/sma/camel",
    "ts/descriptionToComment",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "ts/color/css/hexrgba",
    "ts/color/modifiers",
    "color/ios-swift-clean",
    "size/ios-points-clean"  // Clean up units for iOS
  ],
});

// Register custom iOS Swift format for colors with proper syntax
StyleDictionary.registerFormat({
  name: "ios-swift/class-colors.swift",
  format: ({ dictionary, options }) => {
    const className = options.className || "TokenColors";

    const body = dictionary.allTokens
      .map((token) => {
        return `    public static let ${token.name} = ${token.value}`;
      })
      .join("\n");

    return `
//
// ${className}.swift
//

// Do not edit directly, this file was auto-generated.

import SwiftUI

public class ${className} {
${body}
}`;
  },
});

// Register namespaced SwiftUI typography formatter
StyleDictionary.registerFormat({
  name: "ios-swift/typography.swift",
  format: ({ dictionary, options }) => {
    const className = options.className || "SmaTypography";

    // Group typography tokens by base name
    const typographyGroups = {};

    dictionary.allTokens.forEach(token => {
      // Only process typography-related tokens
      if (!['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing'].includes(token.type)) {
        return;
      }

      // Extract base name by removing the property suffix (case insensitive)
      let baseName = token.name;
      const propertyTypes = ['fontfamily', 'fontweight', 'fontsize', 'lineheight', 'letterspacing'];
      propertyTypes.forEach(prop => {
        if (baseName.toLowerCase().endsWith(prop)) {
          baseName = baseName.slice(0, -prop.length);
        }
      });

      if (!typographyGroups[baseName]) {
        typographyGroups[baseName] = {};
      }

      // Store the value based on token type
      switch(token.type) {
        case 'fontFamily':
          typographyGroups[baseName].fontFamily = token.value.replace(/"/g, '').replace(/'/g, '');
          break;
        case 'fontWeight':
          typographyGroups[baseName].fontWeight = parseInt(token.value) || 400;
          break;
        case 'fontSize':
          // Handle CGFloat(value) format from iOS transforms
          let fontSize = token.value;
          if (typeof fontSize === 'string' && fontSize.includes('CGFloat(')) {
            fontSize = fontSize.match(/CGFloat\(([\d.]+)\)/)?.[1];
          }
          typographyGroups[baseName].fontSize = parseFloat(fontSize) || 16;
          break;
        case 'lineHeight':
          // Convert to absolute points (lineHeight multiplier * fontSize)
          let lineHeight = token.value;
          if (typeof lineHeight === 'string' && lineHeight.includes('%')) {
            lineHeight = parseFloat(lineHeight.replace('%', '')) / 100;
          } else if (typeof lineHeight === 'number' && lineHeight > 10) {
            // If it's a large number like 150, convert to multiplier
            lineHeight = lineHeight / 100;
          } else {
            lineHeight = parseFloat(lineHeight) || 1.5;
          }
          typographyGroups[baseName].lineHeightMultiplier = lineHeight;
          break;
        case 'letterSpacing':
          // Handle CGFloat(value) format from iOS transforms
          let letterSpacing = token.value;
          if (typeof letterSpacing === 'string' && letterSpacing.includes('CGFloat(')) {
            letterSpacing = letterSpacing.match(/CGFloat\(([-\d.]+)\)/)?.[1];
          }
          typographyGroups[baseName].letterSpacing = parseFloat(letterSpacing) || 0;
          break;
      }
    });

    // Helper function to convert font weight to SwiftUI Font.Weight
    const getFontWeight = (weight) => {
      switch(weight) {
        case 300: return '.light';
        case 400: return '.regular';
        case 500: return '.medium';
        case 600: return '.semibold';
        case 700: return '.bold';
        case 800: return '.heavy';
        case 900: return '.black';
        default: return '.regular';
      }
    };

    // Group tokens by category for better organization
    const categories = {
      display: [],
      headline: [],
      body: [],
      label: []
    };

    Object.entries(typographyGroups)
      .filter(([name, props]) => props.fontFamily && props.fontSize)
      .forEach(([name, props]) => {
        if (name.toLowerCase().startsWith('display')) {
          categories.display.push([name, props]);
        } else if (name.toLowerCase().startsWith('headline')) {
          categories.headline.push([name, props]);
        } else if (name.toLowerCase().startsWith('body')) {
          categories.body.push([name, props]);
        } else if (name.toLowerCase().startsWith('label')) {
          categories.label.push([name, props]);
        }
      });

    // Generate category sections
    const generateCategorySection = (categoryName, tokens) => {
      if (tokens.length === 0) return '';

      const structs = tokens.map(([name, props]) => {
        const fontName = props.fontFamily === 'Inter, sans-serif' || props.fontFamily === 'Inter'
          ? 'Inter'
          : props.fontFamily;
        const weight = getFontWeight(props.fontWeight || 400);
        const fontSize = props.fontSize || 16;
        const lineHeight = props.lineHeightMultiplier ? Math.round(props.lineHeightMultiplier * fontSize) : Math.round(fontSize * 1.2);
        const letterSpacing = props.letterSpacing || 0;

        return `  public struct ${name}: SmaTypographyProtocol {
    public static let font: Font = .custom("${fontName}", size: ${fontSize})${weight !== '.regular' ? `.weight(${weight})` : ''}
    public static let fontSize: CGFloat = ${fontSize}
    public static let lineHeight: CGFloat = ${lineHeight}
    public static let letterSpacing: CGFloat = ${letterSpacing}
  }`;
      }).join('\n\n');

      return `  // MARK: - ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}

${structs}`;
    };

    const displaySection = generateCategorySection('display', categories.display);
    const headlineSection = generateCategorySection('headline', categories.headline);
    const bodySection = generateCategorySection('body', categories.body);
    const labelSection = generateCategorySection('label', categories.label);

    return `import SwiftUI

// MARK: - Typography Protocol
public protocol SmaTypographyProtocol {
  static var font: Font { get }
  static var fontSize: CGFloat { get }
  static var lineHeight: CGFloat { get }
  static var letterSpacing: CGFloat { get }
}

// MARK: - Typography ViewModifier
public struct TypographyStyle<Style>: ViewModifier where Style: SmaTypographyProtocol {
  public func body(content: Content) -> some View {
    content
      .font(Style.font)
      .kerning(Style.letterSpacing)
      .lineSpacing(Style.lineHeight - Style.fontSize)
  }
}

// MARK: - View Extension
public extension View {
  func typography<Style: SmaTypographyProtocol>(_ style: Style.Type) -> some View {
    modifier(TypographyStyle<Style>())
  }
}

// MARK: - Typography Tokens
public struct ${className} {
${displaySection}${headlineSection ? '\n\n' + headlineSection : ''}${bodySection ? '\n\n' + bodySection : ''}${labelSection ? '\n\n' + labelSection : ''}
}`;
  },
});



console.log("🏗️  Building design tokens...");

// Configuration for webapp layout tokens (spacing, typography, and border-radius - non-color)
const layoutConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Spacing.json", "tokens/Webapp/Typography.json", "tokens/Webapp/Border-radius.json"],
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
let layoutSd, lightSd, darkSd;

try {
  layoutSd = new StyleDictionary(layoutConfig);
  await layoutSd.buildPlatform("web");
} catch (error) {
  console.error("❌ Layout tokens build failed:", error.message);
  console.log("🔄 Creating fallback minimal tokens...");

  // Create fallback tokens
  const fallbackCss = `/* Fallback Design Tokens - Generated due to build errors */
:root {
  /* Basic Colors */
  --swa-color-white: #fff;
  --swa-color-black: #000;
  --swa-color-primary: #0066cc;

  /* Basic Spacing */
  --swa-spacing-2xs: 2px;
  --swa-spacing-xs: 4px;
  --swa-spacing-sm: 8px;
  --swa-spacing-md: 12px;
  --swa-spacing-lg: 16px;
  --swa-spacing-xl: 20px;
  --swa-spacing-2xl: 24px;
  --swa-spacing-3xl: 28px;
  --swa-spacing-4xl: 36px;
  --swa-spacing-5xl: 40px;
  --swa-spacing-6xl: 48px;
  --swa-spacing-7xl: 56px;
  --swa-spacing-8xl: 64px;
  --swa-spacing-9xl: 72px;
  --swa-spacing-10xl: 80px;
  --swa-spacing-11xl: 96px;
  --swa-spacing-12xl: 128px;

  /* Basic Typography */
  --swa-font-family-web: 'Inter', sans-serif;
  --swa-font-size-display-lg: 96px;
  --swa-font-size-headline-3xl: 40px;
  --swa-font-size-headline-2xl: 34px;
  --swa-font-size-headline-xl: 28px;
  --swa-font-size-headline-lg: 24px;
  --swa-font-size-headline-md: 20px;
  --swa-font-size-headline-sm: 18px;
  --swa-font-size-body-xl: 20px;
  --swa-font-size-body-lg: 16px;
  --swa-font-size-body-md: 14px;
  --swa-font-size-body-sm: 12px;
  --swa-font-size-label-xl: 18px;
  --swa-font-size-label-lg: 16px;
  --swa-font-size-label-md: 14px;
  --swa-font-size-label-sm: 12px;
  --swa-font-weight-regular: 400;
  --swa-font-weight-medium: 500;
  --swa-font-weight-semibold: 600;
  --swa-font-weight-bold: 700;
  --swa-line-height-tightest: 100%;
  --swa-line-height-tighter: 110%;
  --swa-line-height-tight: 120%;
  --swa-line-height-base: 150%;
  --swa-letter-spacing-tight: -2%;
  --swa-letter-spacing-normal: 0%;
  --swa-letter-spacing-wide: 5%;
}`;

  const distPath = "dist/web/";
  if (!fs.existsSync("dist")) fs.mkdirSync("dist");
  if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);

  fs.writeFileSync(distPath + "tokens-layout.css", fallbackCss);
  console.log("✅ Fallback layout tokens created");
}

// Build light theme color tokens
console.log("☀️  Building webapp light theme color tokens...");
try {
  lightSd = new StyleDictionary(lightConfig);
  await lightSd.buildPlatform("web");
} catch (error) {
  console.error("❌ Light theme build failed:", error.message);
  console.log("🔄 Creating fallback light theme tokens...");

  const fallbackLightCss = `:root {
  /* Light Theme Colors - Fallback */
  --swa-elevation-solid-0: #fff;
  --swa-elevation-solid-1: #f5f5f5;
  --swa-elevation-solid-2: #f0f0f0;
  --swa-elevation-solid-3: #e0e0e0;
  --swa-elevation-solid-4: #b8b8b8;
  --swa-elevation-solid-5: #8f8f8f;
  --swa-elevation-solid-6: #666666;
  --swa-elevation-solid-7: #292929;
  --swa-elevation-solid-8: #0a0a0a;
  --swa-action-primary-enabled: #0a0a0a;
  --swa-action-primary-hover: #292929;
  --swa-action-primary-active: #666666;
  --swa-action-primary-disabled: #f0f0f0;
  --swa-brand-yellow: #ffef62;
  --swa-status-critical: #ff0000;
}`;

  const distPath = "dist/web/";
  fs.writeFileSync(distPath + "tokens-light.css", fallbackLightCss);
  console.log("✅ Fallback light theme tokens created");
}

// Build dark theme color tokens
console.log("🌙 Building webapp dark theme color tokens...");
try {
  darkSd = new StyleDictionary(darkConfig);
  await darkSd.buildPlatform("web");
} catch (error) {
  console.error("❌ Dark theme build failed:", error.message);
  console.log("🔄 Creating fallback dark theme tokens...");

  const fallbackDarkCss = `[data-theme="dark"] {
  /* Dark Theme Colors - Fallback */
  --swa-elevation-solid-0: #000000;
  --swa-elevation-solid-1: #0a0a0a;
  --swa-elevation-solid-2: #141414;
  --swa-elevation-solid-3: #1f1f1f;
  --swa-elevation-solid-4: #292929;
  --swa-elevation-solid-5: #333333;
  --swa-elevation-solid-6: #3d3d3d;
  --swa-elevation-solid-7: #808080;
  --swa-elevation-solid-8: #b2b2b2;
  --swa-action-primary-enabled: #b2b2b2;
  --swa-action-primary-hover: #808080;
  --swa-action-primary-active: #3d3d3d;
  --swa-action-primary-disabled: #141414;
  --swa-brand-yellow: #ffef62;
  --swa-status-critical: #ff0000;
}`;

  const distPath = "dist/web/";
  fs.writeFileSync(distPath + "tokens-dark.css", fallbackDarkCss);
  console.log("✅ Fallback dark theme tokens created");
}

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

  // Load all core typography tokens for dynamic mapping
  const coreTypographyPath = "tokens/Core/Typography.json";
  let coreTokenMaps = {
    fontFamily: {
      web: "'Inter', sans-serif"
    },
    fontWeight: {
      light: '400',
      regular: '500',
      prominent: '600'
    },
    fontSize: {
      'display-lg': '96px',
      'headline-3xl': '40px',
      'headline-2xl': '34px',
      'headline-xl': '28px',
      'headline-lg': '24px',
      'headline-md': '20px',
      'headline-sm': '18px',
      'body-xl': '20px',
      'body-lg': '16px',
      'body-md': '14px',
      'body-sm': '12px',
      'label-xl': '18px',
      'label-lg': '16px',
      'label-md': '14px',
      'label-sm': '12px'
    },
    lineHeight: {
      tightest: '100%',
      tighter: '110%',
      tight: '120%',
      base: '150%'
    },
    letterSpacing: {
      tight: '-2%',
      normal: '0%',
      wide: '5%'
    }
  };

  if (fs.existsSync(coreTypographyPath)) {
    try {
      const coreTypography = JSON.parse(fs.readFileSync(coreTypographyPath, "utf8"));

      if (coreTypography.font) {
        // Map font families
        if (coreTypography.font.family?.sans?.value) {
          coreTokenMaps.fontFamily.web = coreTypography.font.family.sans.value;
        }

        // Map font weights
        if (coreTypography.font.weight) {
          const weights = coreTypography.font.weight;
          coreTokenMaps.fontWeight = {
            light: weights['400']?.value || '400',
            regular: weights['500']?.value || '500',
            prominent: weights['600']?.value || '600'
          };
        }

        // Map font sizes
        if (coreTypography.font.size) {
          const sizes = coreTypography.font.size;
          Object.entries(sizes).forEach(([key, token]) => {
            const value = token.value + 'px';
            // Map common size values to semantic names
            switch(key) {
              case '96': coreTokenMaps.fontSize['display-lg'] = value; break;
              case '40': coreTokenMaps.fontSize['headline-3xl'] = value; break;
              case '34': coreTokenMaps.fontSize['headline-2xl'] = value; break;
              case '28': coreTokenMaps.fontSize['headline-xl'] = value; break;
              case '24': coreTokenMaps.fontSize['headline-lg'] = value; break;
              case '20':
                coreTokenMaps.fontSize['headline-md'] = value;
                coreTokenMaps.fontSize['body-xl'] = value;
                break;
              case '18':
                coreTokenMaps.fontSize['headline-sm'] = value;
                coreTokenMaps.fontSize['label-xl'] = value;
                break;
              case '16':
                coreTokenMaps.fontSize['body-lg'] = value;
                coreTokenMaps.fontSize['label-lg'] = value;
                break;
              case '14':
                coreTokenMaps.fontSize['body-md'] = value;
                coreTokenMaps.fontSize['label-md'] = value;
                break;
              case '12':
                coreTokenMaps.fontSize['body-sm'] = value;
                coreTokenMaps.fontSize['label-sm'] = value;
                break;
            }
          });
        }

        // Map line heights
        if (coreTypography.font['line-height']) {
          const lineHeights = coreTypography.font['line-height'];
          Object.entries(lineHeights).forEach(([key, token]) => {
            switch(key) {
              case '100': coreTokenMaps.lineHeight.tightest = token.value; break;
              case '110': coreTokenMaps.lineHeight.tighter = token.value; break;
              case '120': coreTokenMaps.lineHeight.tight = token.value; break;
              case '150': coreTokenMaps.lineHeight.base = token.value; break;
            }
          });
        }

        // Map letter spacing
        if (coreTypography.font['letter-spacing']) {
          const letterSpacings = coreTypography.font['letter-spacing'];
          Object.entries(letterSpacings).forEach(([key, token]) => {
            switch(key) {
              case '-2': coreTokenMaps.letterSpacing.tight = token.value; break;
              case '0': coreTokenMaps.letterSpacing.normal = token.value; break;
              case '5': coreTokenMaps.letterSpacing.wide = token.value; break;
            }
          });
        }

        console.log("📊 Using dynamic typography mapping from core tokens:");
        console.log("   Font weights:", coreTokenMaps.fontWeight);
        console.log("   Font family:", coreTokenMaps.fontFamily);
        console.log("   Line heights:", coreTokenMaps.lineHeight);
        console.log("   Letter spacing:", coreTokenMaps.letterSpacing);
      }
    } catch (error) {
      console.log("⚠️  Could not load core typography tokens, using fallback values");
    }
  }

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
              optimizedLines.push(`  --swa-${baseName}-font-weight-light: ${coreTokenMaps.fontWeight.light};`);
              optimizedLines.push(`  --swa-${baseName}-font-weight-regular: ${coreTokenMaps.fontWeight.regular};`);
              optimizedLines.push(`  --swa-${baseName}-font-weight-prominent: ${coreTokenMaps.fontWeight.prominent};`);
            }
            return; // Skip adding the original font-weight variable
          }

          // For non-font-weight properties, add the optimized variable
          // Try to map to core tokens when possible
          let optimizedValue = value;

          // Map font-family to core token
          if (property === 'font-family' && value.includes('Inter')) {
            optimizedValue = coreTokenMaps.fontFamily.web;
          }

          // Map line-height to core tokens
          if (property === 'line-height') {
            switch(value) {
              case '100%': optimizedValue = coreTokenMaps.lineHeight.tightest; break;
              case '110%': optimizedValue = coreTokenMaps.lineHeight.tighter; break;
              case '120%': optimizedValue = coreTokenMaps.lineHeight.tight; break;
              case '150%': optimizedValue = coreTokenMaps.lineHeight.base; break;
            }
          }

          // Map letter-spacing to core tokens
          if (property === 'letter-spacing') {
            switch(value) {
              case '-2%': optimizedValue = coreTokenMaps.letterSpacing.tight; break;
              case '0%': optimizedValue = coreTokenMaps.letterSpacing.normal; break;
              case '5%': optimizedValue = coreTokenMaps.letterSpacing.wide; break;
            }
          }

          // Map font-size to core tokens where applicable
          if (property === 'font-size') {
            // Extract the type and size from baseName to map to core tokens
            const typeMatch = baseName.match(/(display|headline|body|label)-(.+)/);
            if (typeMatch) {
              const [, type, size] = typeMatch;
              const semanticKey = `${type}-${size}`;
              if (coreTokenMaps.fontSize[semanticKey]) {
                optimizedValue = coreTokenMaps.fontSize[semanticKey];
              }
            }
          }

          const optimizedVarName = `--swa-${baseName}-${property}`;
          optimizedLines.push(`  ${optimizedVarName}: ${optimizedValue};`);
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
  source: [
    "tokens/Core/**/*.json",
    "tokens/Mobile/**/*.json"
  ],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  platforms: {
    ios: {
      transformGroup: "ios-tokens-studio",
      buildPath: "dist/ios/",
      files: [
        {
          destination: "SmaTokens.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "SmaTokens",
            showFileHeader: true
          },
          filter: token => {
            // Include Mobile tokens but exclude color and typography tokens
            const isMobile = token.filePath && token.filePath.includes("Mobile/");
            const isColorToken = token.type === 'color';
            const isTypographyToken = token.type === 'typography' ||
                                     token.type === 'fontFamily' ||
                                     token.type === 'fontSize' ||
                                     token.type === 'fontWeight' ||
                                     token.type === 'lineHeight' ||
                                     token.type === 'letterSpacing';
            const isLetterSpacingByName = token.name && token.name.toLowerCase().includes('letterspacing');
            const isBorderRadiusToken = token.type === 'borderRadius';

            return isMobile && !isColorToken && !isTypographyToken && !isLetterSpacingByName && (isBorderRadiusToken || token.type === 'spacing' || token.type === 'dimension');
          }
        },
        {
          destination: "SmaTypography.swift",
          format: "ios-swift/typography.swift",
          options: {
            className: "SmaTypography"
          },
          filter: token => {
            return ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing'].includes(token.type);
          }
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
    "web-js": {
      transformGroup: "ios-tokens-studio",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
          filter: () => true, // export everything, including typography variants
          options: {
            showFileHeader: true,
          },
        },
      ],
    },
  },
};

const otherSd = new StyleDictionary(otherConfig);
await otherSd.buildAllPlatforms();

// Build iOS Light theme
console.log("☀️  Building iOS Light theme...");
const iosLightConfig = {
  source: [
    "tokens/Core/**/*.json",
    "tokens/Mobile/Color/Light.json"
  ],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  platforms: {
    ios: {
      transformGroup: "ios-tokens-studio",
      buildPath: "dist/ios/",
      files: [
        {
          destination: "SmaTokensLight.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "SmaTokensLight",
            showFileHeader: true
          },
          filter: token => {
            const isMobile = token.filePath && token.filePath.includes("Mobile/");
            const isTypographyObject = token.type === 'typography' && typeof token.value === 'object';
            const isColorToken = token.type === 'color';
            return isMobile && !isTypographyObject && isColorToken;
          }
        },
      ],
    }
  }
};

const iosLightSd = new StyleDictionary(iosLightConfig);
await iosLightSd.buildPlatform("ios");

// Build iOS Dark theme
console.log("🌙 Building iOS Dark theme...");
const iosDarkConfig = {
  source: [
    "tokens/Core/**/*.json",
    "tokens/Mobile/Color/Dark.json"
  ],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  platforms: {
    ios: {
      transformGroup: "ios-tokens-studio",
      buildPath: "dist/ios/",
      files: [
        {
          destination: "SmaTokensDark.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "SmaTokensDark",
            showFileHeader: true
          },
          filter: token => {
            const isMobile = token.filePath && token.filePath.includes("Mobile/");
            const isTypographyObject = token.type === 'typography' && typeof token.value === 'object';
            const isColorToken = token.type === 'color';
            return isMobile && !isTypographyObject && isColorToken;
          }
        },
      ],
    }
  }
};

const iosDarkSd = new StyleDictionary(iosDarkConfig);
await iosDarkSd.buildPlatform("ios");

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
