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

console.log("Building design tokens...");

// StyleDictionary v4 APB
const sd = new StyleDictionary({
  source: ["tokens/**/*.json"],
  platforms: {
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
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
        },
        {
          destination: "tokens.scss",
          format: "scss/variables",
        },
        {
          destination: "tokens.json",
          format: "json/flat",
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
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
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

// Copy index.html to dist folder with corrected CSS path
if (fs.existsSync("index.html")) {
  let indexContent = fs.readFileSync("index.html", "utf8");
  // Fix the CSS path for the dist version
  indexContent = indexContent.replace(
    'href="dist/web/tokens.css"',
    'href="web/tokens.css"',
  );
  fs.writeFileSync("dist/index.html", indexContent);
  console.log("✅ Restored index.html with corrected CSS path");
}

console.log("✅ Design tokens built successfully!");
