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

// Register a format for complete themed CSS with light and dark modes
StyleDictionary.registerFormat({
  name: "css/complete-themed",
  format: function (dictionary, config) {
    const prefix = config.prefix || "";

    // We'll manually build this by reading both light and dark token files
    // and generating a complete CSS file with proper theme selectors
    return "/* This format will be populated by the build script */";
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
          destination: "tokens.json",
          format: "json/flat",
          filter: "webapp-only",
        },
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
    // SCSS Light theme
    "scss-light": {
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
          destination: "tokens-light.scss",
          format: "scss/variables",
          filter: "webapp-only",
        },
      ],
    },
    // SCSS Dark theme
    "scss-dark": {
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
        "tokens/Webapp/Color/Dark.json",
        "tokens/Webapp/Spacing.json",
      ],
      files: [
        {
          destination: "tokens-dark.scss",
          format: "scss/variables",
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

// Create complete themed CSS and SCSS files
async function createThemedFiles() {
  // Build light theme tokens
  const lightSD = new StyleDictionary({
    source: [
      "tokens/Core/**/*.json",
      "tokens/Webapp/Color/Light.json",
      "tokens/Webapp/Spacing.json",
    ],
    platforms: {
      temp: {
        transforms: [
          "ts/descriptionToComment",
          "ts/size/px",
          "ts/opacity",
          "ts/color/modifiers",
          "ts/typography/fontWeight",
          "name/kebab",
        ],
        prefix: "swa",
        buildPath: "temp/",
        files: [
          {
            destination: "light.json",
            format: "json/flat",
            filter: "webapp-only",
          },
        ],
      },
    },
  });

  // Build dark theme tokens
  const darkSD = new StyleDictionary({
    source: [
      "tokens/Core/**/*.json",
      "tokens/Webapp/Color/Dark.json",
      "tokens/Webapp/Spacing.json",
    ],
    platforms: {
      temp: {
        transforms: [
          "ts/descriptionToComment",
          "ts/size/px",
          "ts/opacity",
          "ts/color/modifiers",
          "ts/typography/fontWeight",
          "name/kebab",
        ],
        prefix: "swa",
        buildPath: "temp/",
        files: [
          {
            destination: "dark.json",
            format: "json/flat",
            filter: "webapp-only",
          },
        ],
      },
    },
  });

  // Build both
  await lightSD.buildAllPlatforms();
  await darkSD.buildAllPlatforms();

  // Read the generated JSON files
  const lightTokens = JSON.parse(fs.readFileSync("temp/light.json", "utf8"));
  const darkTokens = JSON.parse(fs.readFileSync("temp/dark.json", "utf8"));

  // Generate themed CSS
  let themedCSS = ":root, .light-theme {\n";
  Object.entries(lightTokens).forEach(([name, value]) => {
    themedCSS += `  --${name}: ${value};\n`;
  });
  themedCSS += "}\n\n";

  themedCSS += ".dark-theme {\n";
  Object.entries(darkTokens).forEach(([name, value]) => {
    themedCSS += `  --${name}: ${value};\n`;
  });
  themedCSS += "}\n";

  // Write the themed CSS file
  fs.writeFileSync("dist/web/tokens.css", themedCSS);

  // Create combined SCSS file if individual SCSS files exist
  if (
    fs.existsSync("dist/web/tokens-light.scss") &&
    fs.existsSync("dist/web/tokens-dark.scss")
  ) {
    const lightSCSS = fs.readFileSync("dist/web/tokens-light.scss", "utf8");
    const darkSCSS = fs.readFileSync("dist/web/tokens-dark.scss", "utf8");

    // Create themed SCSS with mixins
    let themedSCSS = "// Light theme variables\n";
    themedSCSS += "@mixin light-theme {\n";
    themedSCSS += lightSCSS
      .replace(/^\$swa-/gm, "  $swa-")
      .replace(/^\/\*\*[\s\S]*?\*\/\s*/gm, "");
    themedSCSS += "}\n\n";

    themedSCSS += "// Dark theme variables\n";
    themedSCSS += "@mixin dark-theme {\n";
    themedSCSS += darkSCSS
      .replace(/^\$swa-/gm, "  $swa-")
      .replace(/^\/\*\*[\s\S]*?\*\/\s*/gm, "");
    themedSCSS += "}\n\n";

    themedSCSS += "// Default to light theme\n";
    themedSCSS += "@include light-theme;\n\n";

    themedSCSS += "// Dark theme class override\n";
    themedSCSS += ".dark-theme {\n";
    themedSCSS += "  @include dark-theme;\n";
    themedSCSS += "}\n";

    fs.writeFileSync("dist/web/tokens.scss", themedSCSS);
    console.log(
      "✅ Complete themed tokens.scss created with light/dark mode mixins",
    );
  }

  // Clean up temp files
  if (fs.existsSync("temp")) {
    fs.rmSync("temp", { recursive: true });
  }

  console.log(
    "✅ Complete themed tokens.css created with light/dark mode support",
  );
}

// Create themed CSS and SCSS
await createThemedFiles();

console.log("✅ Design tokens built successfully!");
