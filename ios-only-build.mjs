#!/usr/bin/env node

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

// Register transforms
register(StyleDictionary, { expand: true });

// Register SMA transform
StyleDictionary.registerTransform({
  name: "name/sma/camel",
  type: "name",
  transform: (token) => {
    const camelCased = token.path
      .map((segment, index) =>
        index === 0
          ? segment
          : segment.charAt(0).toUpperCase() + segment.slice(1)
      )
      .join("");
    return `sma${camelCased.charAt(0).toUpperCase()}${camelCased.slice(1)}`;
  },
});

// iOS-specific transforms
StyleDictionary.registerTransform({
  name: 'color/UIColor',
  type: 'value',
  filter: token => token.type === 'color',
  transform: token => {
    const hex = token.value;
    if (hex && hex.startsWith('#')) {
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;
      return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: 1.0)`;
    }
    return hex;
  }
});

StyleDictionary.registerTransform({
  name: 'size/ios-points',
  type: 'value',
  filter: token => token.type === 'dimension' || token.type === 'spacing' || token.type === 'fontSizes',
  transform: token => {
    const value = parseFloat(token.value);
    return isNaN(value) ? token.value : value;
  }
});

// iOS transform group
StyleDictionary.registerTransformGroup({
  name: "ios-sma",
  transforms: [
    "attribute/cti",
    "name/sma/camel",
    "size/ios-points", 
    "color/UIColor"
  ],
});

// iOS-only config
const iosConfig = {
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  platforms: {
    ios: {
      transformGroup: "ios-sma",
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
            const isMobile = token.filePath && token.filePath.includes("Mobile/");
            const isTypographyObject = token.type === 'typography' && typeof token.value === 'object';
            return isMobile && !isTypographyObject;
          }
        },
      ],
    },
  },
};

console.log("📱 Building iOS tokens only...");
const sd = new StyleDictionary(iosConfig);
await sd.buildPlatform("ios");

console.log("✅ iOS tokens built!");
