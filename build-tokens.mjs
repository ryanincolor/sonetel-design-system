import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';

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
    ios: {
      transforms: [
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

// Copy index.html to dist folder
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
  console.log('✅ Restored index.html');
}

console.log('✅ Design tokens built successfully!');
