import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

// Register the token studio transforms
register(StyleDictionary);

console.log("Building only web tokens to identify issue...");

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
      ],
    },
  },
});

try {
  await sd.buildPlatform("web");
  console.log("✅ Web tokens built successfully!");
} catch (error) {
  console.log("❌ Build failed:", error.message);
  console.log("Stack:", error.stack);
}
