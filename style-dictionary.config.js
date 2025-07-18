module.exports = {
  source: ["tokens/**/*.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    web: {
      transformGroup: "tokens-studio",
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
