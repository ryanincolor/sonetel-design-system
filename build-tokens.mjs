import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";
import fs from "fs";

// Register the token studio transforms
register(StyleDictionary);

// Add custom transform to handle token names that start with numbers
StyleDictionary.registerTransform({
  name: "name/camel/safe",
  type: "name",
  transform: function (token) {
    let name = token.path.join("");
    // Convert to camelCase
    name = name.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
    // If name starts with a number, prefix with underscore
    if (/^[0-9]/.test(name)) {
      name = "_" + name;
    }
    return name;
  },
});

// Register filter for webapp tokens only
StyleDictionary.registerFilter({
  name: "webapp-only",
  filter: function (token) {
    return token.filePath && token.filePath.includes("Webapp/");
  },
});

// Register filter for core tokens only
StyleDictionary.registerFilter({
  name: "core-only",
  filter: function (token) {
    return token.filePath && token.filePath.includes("Core/");
  },
});

// Register a format for themed CSS
StyleDictionary.registerFormat({
  name: "css/themed",
  format: function (dictionary, config) {
    const selector = config?.options?.selector || ":root";

    let output = `${selector} {\n`;
    dictionary.allTokens.forEach((token) => {
      output += `  --${token.name}: ${token.value};\n`;
    });
    output += "}\n";

    return output;
  },
});

console.log("Building design tokens...");

// StyleDictionary v4 - Build semantic webapp tokens with theming
const sd = new StyleDictionary({
  source: ["tokens/**/*.json"],
  platforms: {
    // Core tokens - simple CSS for UI documentation only
    "core-tokens": {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
        "name/kebab",
      ],
      buildPath: "dist/web/",
      files: [
        {
          destination: "core-tokens.css",
          format: "css/variables",
          filter: "core-only",
        },
      ],
    },
    // Main webapp export in all formats - only semantic tokens
    web: {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
        "name/kebab",
      ],
      buildPath: "dist/web/",
      prefix: "swa",
      source: [
        "tokens/Core/**/*.json",
        "tokens/Webapp/Color/Light.json",
        "tokens/Webapp/Spacing.json",
      ],
      files: [
        {
          destination: "tokens.scss",
          format: "scss/variables",
          filter: "webapp-only",
        },
        {
          destination: "tokens.json",
          format: "json/flat",
          filter: "webapp-only",
        },
      ],
    },
    // Webapp light theme - semantic tokens only
    "webapp-light": {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
        "name/kebab",
      ],
      buildPath: "dist/web/",
      prefix: "swa",
      files: [
        {
          destination: "webapp-light.css",
          format: "css/themed",
          filter: "webapp-only",
          options: {
            selector: ":root, .light-theme",
          },
        },
      ],
      source: [
        "tokens/Core/**/*.json",
        "tokens/Webapp/Color/Light.json",
        "tokens/Webapp/Spacing.json",
      ],
    },
    // Webapp dark theme - semantic tokens only
    "webapp-dark": {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
        "name/kebab",
      ],
      buildPath: "dist/web/",
      prefix: "swa",
      files: [
        {
          destination: "webapp-dark.css",
          format: "css/themed",
          filter: "webapp-only",
          options: {
            selector: ".dark-theme",
          },
        },
      ],
      source: [
        "tokens/Core/**/*.json",
        "tokens/Webapp/Color/Dark.json",
        "tokens/Webapp/Spacing.json",
      ],
    },
    "web-js": {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
        "name/camel/safe",
      ],
      buildPath: "dist/web/",
      prefix: "swa",
      source: [
        "tokens/Core/**/*.json",
        "tokens/Webapp/Color/Light.json",
        "tokens/Webapp/Spacing.json",
      ],
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
          filter: "webapp-only",
        },
      ],
    },
    ios: {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
      ],
      buildPath: "dist/ios/",
      files: [
        {
          destination: "SonetelTokens.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "SonetelTokens",
          },
        },
      ],
    },
    android: {
      transforms: [
        "ts/descriptionToComment",
        "ts/size/px",
        "ts/opacity",
        "ts/color/modifiers",
        "ts/typography/fontWeight",
      ],
      buildPath: "dist/android/",
      files: [
        {
          destination: "colors.xml",
          format: "android/resources",
        },
        {
          destination: "dimens.xml",
          format: "android/resources",
        },
      ],
    },
  },
});

// Build all platforms
await sd.buildAllPlatforms();

// Combine webapp light and dark CSS into main tokens.css export
if (
  fs.existsSync("dist/web/webapp-light.css") &&
  fs.existsSync("dist/web/webapp-dark.css")
) {
  const lightCSS = fs.readFileSync("dist/web/webapp-light.css", "utf8");
  const darkCSS = fs.readFileSync("dist/web/webapp-dark.css", "utf8");

  const combinedCSS = lightCSS + "\n" + darkCSS;
  fs.writeFileSync("dist/web/tokens.css", combinedCSS);

  // Clean up individual files
  fs.unlinkSync("dist/web/webapp-light.css");
  fs.unlinkSync("dist/web/webapp-dark.css");

  console.log("✅ Main tokens.css created with webapp tokens");
}

// Copy index.html to dist folder with corrected CSS path
if (fs.existsSync("index.html")) {
  let indexContent = fs.readFileSync("index.html", "utf8");
  // Fix the CSS path for the dist version
  indexContent = indexContent.replace(
    'href="dist/web/core-tokens.css"',
    'href="web/core-tokens.css"',
  );
  fs.writeFileSync("dist/index.html", indexContent);
  console.log("✅ Restored index.html with corrected CSS path");
}

console.log("✅ Design tokens built successfully!");
