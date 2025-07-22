const StyleDictionary = require('style-dictionary');

// Register a custom transform for kebab-case CSS custom property names
StyleDictionary.registerTransform({
  name: 'name/cti/kebab',
  type: 'name',
  transformer: function(token, options) {
    // Convert the token path to kebab-case
    return token.path.join('-').toLowerCase().replace(/\s+/g, '-');
  }
});

// Register a custom transform group that includes our kebab-case transform
StyleDictionary.registerTransformGroup({
  name: 'tokens-studio-kebab',
  transforms: [
    // Include all the default tokens-studio transforms
    'attribute/cti',
    'name/cti/kebab', // Use our custom kebab-case transform
    'size/px',
    'color/css'
  ]
});

module.exports = {
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio-kebab",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            showFileHeader: true,
            selector: ":root",
          },
        },
        {
          destination: "tokens.scss",
          format: "scss/variables",
          options: {
            showFileHeader: true,
          },
        },
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
  },
};
