#!/usr/bin/env node

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

// Register all built-in Token Studio transforms with expand
register(StyleDictionary, {
  expand: true
});

console.log("🔍 Simple build to identify remaining reference error...");

// Configuration for webapp layout tokens (spacing and typography - non-color)
const layoutConfig = {
  source: ["tokens/Core/**/*.json", "tokens/Webapp/Spacing.json", "tokens/Webapp/Typography.json"],
  preprocessors: ["tokens-studio"],
  expand: {
    typesMap: {
      typography: 'expand'
    }
  },
  log: {
    verbosity: "verbose"
  },
  platforms: {
    web: {
      transformGroup: "tokens-studio",
      buildPath: "debug/",
      files: [
        {
          destination: "simple-test.css",
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

try {
  const layoutSd = new StyleDictionary(layoutConfig);
  await layoutSd.buildPlatform("web");
  console.log("✅ Simple build successful!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  
  // Let's inspect the tokens to see what's missing
  try {
    console.log("🔍 Attempting to inspect tokens...");
    const sd = new StyleDictionary(layoutConfig);
    const parsed = sd.exportPlatform("web");
    console.log("Parsed tokens count:", Object.keys(parsed.allTokens || {}).length);
  } catch (inspectError) {
    console.error("Inspect error:", inspectError.message);
  }
}
