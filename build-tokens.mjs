import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Register the token studio transforms
register(StyleDictionary);

console.log('Building design tokens...');

// Build the tokens
await StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    web: {
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/size/css/letterSpacing',
        'ts/color/modifiers',
        'ts/typography/fontWeight',
        'ts/resolve/math',
        'ts/size/rem',
        'ts/color/css',
        'name/kebab'
      ],
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        },
        {
          destination: 'tokens.scss',
          format: 'scss/variables'
        },
        {
          destination: 'tokens.js',
          format: 'javascript/es6'
        },
        {
          destination: 'tokens.json',
          format: 'json/flat'
        }
      ]
    },
    ios: {\n      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/color/modifiers',
        'ts/typography/fontWeight',
        'ts/resolve/math',
        'ts/color/SwiftUI'
      ],
      buildPath: 'dist/ios/',
      files: [
        {
          destination: 'SonetelTokens.swift',
          format: 'ios-swift/class.swift',
          options: {
            className: 'SonetelTokens'
          },
          filter: {
            attributes: {}
          }
        }
      ]
    },
    android: {
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/color/modifiers',
        'ts/typography/fontWeight',
        'ts/resolve/math',
        'ts/color/hex'
      ],
      buildPath: 'dist/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/resources'
        },
        {
          destination: 'dimens.xml',
          format: 'android/resources'
        }
      ]
    }
  }
}).buildAllPlatforms();

// Convert camelCase to kebab-case in CSS files
function convertToKebabCase(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const kebabCaseContent = fileContent.replace(/--([a-z])(?:([a-zA-Z])[a-zA-Z0-9]*)*/g, (match, firstChar, rest) => {
    return `--${firstChar}${rest.toLowerCase()}`;
  });
  fs.writeFileSync(filePath, kebabCaseContent);
}

// Convert css and scss files
convertToKebabCase('dist/web/tokens.css');
convertToKebabCase('dist/web/tokens.scss');

console.log('✅ Converted CSS variables to kebab-case');
console.log('⌅ Converted SCSS variables to kebab-case');

// Copy index.html to dist folder
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
  console.log('⌅ Restored index.html');
}

console.log('✅ Design tokens built successfully!');
