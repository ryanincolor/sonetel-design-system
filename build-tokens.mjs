import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';

// Register the token studio transforms
register(StyleDictionary);

console.log('Building design tokens...');

// StyleDictionary v4 APB
const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  platforms: {\n    web: {
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/color/modifiers',
        'ts/typography/fontWeight',
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
          destination: 'tokens.json',
          format: 'json/flat'
        }
      ]
    },
    'web-js': {
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/color/modifiers',
        'ts/typography/fontWeight',
        'name/camel'
      ],
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6'
        }
      ]
    },
    ios: {
      transforms: [
        'ts/descriptionToComment',
        'ts/size/px',
        'ts/opacity',
        'ts/color/modifiers',
        'ts/typography/fontWeight'
      ],
      buildPath: 'dist/ios/',
      files: [
        {
          destination: 'SonetelTokens.swift',
          format: 'ios-swift/class.swift',
          options: {
            className: 'SonetelTokens'
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
        'ts/typography/fontWeight'
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
});

// Build all platforms
await sd.buildAllPlatforms();

// Copy index.html to dist folder
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
  console.log('✅ Restored index.html');
}

console.log('✅ Design tokens built successfully!');
