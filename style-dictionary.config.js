/**
 * OBSOLETE: This file is kept only as a minimal fallback.
 * 
 * The main build process now uses build-tokens.mjs which provides:
 * - Typography optimization and redundancy removal
 * - Dynamic core token mapping
 * - Comprehensive CSS variable optimization
 * - Theme-aware color token generation
 * 
 * Use: npm run build-tokens (or npm run build)
 */

const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    // Minimal fallback for development/testing
    fallback: {
      transformGroup: "tokens-studio",
      buildPath: "dist/fallback/",
      files: [
        {
          destination: "tokens-basic.css",
          format: "css/variables",
          options: {
            showFileHeader: true,
            selector: ":root",
          },
        },
      ],
    },
  },
};
