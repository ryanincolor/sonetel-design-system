// Main application functionality
// This file contains all the token browsing and UI functionality

// Helper function to clean iOS token names
function cleanIOSTokenName(tokenName) {
  const tokenPath = tokenName.split('.');
  const camelCased = tokenPath
    .map((segment, index) => {
      // Clean up special characters, hyphens, and handle common patterns
      let cleanSegment = segment
        .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric
        .replace(/^on/i, 'On') // Handle 'on-action' -> 'OnAction' pattern
        .replace(/^x/i, 'X'); // Handle 'x-large' -> 'XLarge' pattern

      return index === 0
        ? cleanSegment
        : cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1);
    })
    .join("");
  return camelCased;
}

// Navigation switching
function switchSection(sectionId, event) {
  console.log(`🔄 Switching to section: ${sectionId}`);

  // Hide all sections
  const sections = document.querySelectorAll(".section");
  console.log(`🔄 Hiding ${sections.length} sections`);
  sections.forEach((section) => section.classList.remove("active"));

  // Remove active class from all nav buttons
  const navButtons = document.querySelectorAll(".nav-button");
  navButtons.forEach((button) => button.classList.remove("active"));

  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");
    console.log(`✅ Section ${sectionId} activated`);
  } else {
    console.error(`❌ Section ${sectionId} not found!`);
  }

  // Add active class to clicked button (if called from UI)
  if (event && event.target) {
    event.target.classList.add("active");
  } else {
    // If called programmatically, find and activate the corresponding button
    const targetButton = document.querySelector(
      `.nav-button[onclick*="switchSection('${sectionId}', event)"]`,
    );
    if (targetButton) {
      targetButton.classList.add("active");
    }
  }

  // Load content for the section
  loadSectionContent(sectionId);
}

// Token format updating
async function updateTokenFormat() {
  try {
    // Update individual webapp tokens
    updateWebappTokenFormat();
  } catch (error) {
    console.error("Error loading token format:", error);
  }
}

// iOS token format updating
async function updateIOSTokenFormat() {
  try {
    // Update individual iOS tokens
    updateIOSTokenFormatDisplay();
  } catch (error) {
    console.error("Error loading iOS token format:", error);
  }
}

// Update iOS token format for individual tokens
async function updateIOSTokenFormatDisplay() {
  const formatElement = document.getElementById("ios-token-format");
  if (!formatElement) {
    console.warn("iOS token format dropdown not found");
    return;
  }

  const format = formatElement.value;
  const iOSTokens = document.querySelectorAll("#ios .token-formatted-output, #ios .typography-css-variables, #ios .typography-showcase");

  if (iOSTokens.length === 0) {
    console.log("No iOS tokens with formatted output found");
    return;
  }

  try {
    let tokensData = {};

    if (format !== "names") {
      // For now, we'll use the webapp tokens.json as a reference
      // In a real implementation, you might want to generate iOS-specific tokens
      const response = await fetch("dist/web/tokens.json");
      if (response.ok) {
        tokensData = await response.json();
      }
    }

    iOSTokens.forEach((tokenEl) => {
      const tokenName = tokenEl.getAttribute("data-token");
      const tokenValue = tokenEl.getAttribute("data-value");
      const coreTokens = tokenEl.getAttribute("data-core-tokens");

      if (!tokenName) {
        // Handle typography showcase elements specially
        if (tokenEl.classList.contains('typography-showcase')) {
          handleTypographyShowcase(tokenEl, format);
        }
        return;
      }

      const kebabName = tokenName.replace(/\./g, "-");
      // Use helper function for iOS token name cleaning
      const swiftName = cleanIOSTokenName(tokenName);
      let formattedValue = "";

      // Check if this is a typography token with core token references
      const isTypographyToken = coreTokens && tokenEl.classList.contains('typography-css-variables');

      switch (format) {
        case "names":
          // Hide the formatted output section for "names only"
          tokenEl.style.display = "none";
          return;
        case "swift":
          if (isTypographyToken) {
            // Show individual Swift constants for each core token the typography style references
            const tokens = JSON.parse(coreTokens);
            formattedValue = tokens.map(token => {
              const coreTokenName = token.coreToken.replace(/[{}]/g, '');
              const swiftTokenName = cleanIOSTokenName(coreTokenName);
              return `SmaTokens.${swiftTokenName}`;
            }).join('<br>');
          } else {
            formattedValue = `SmaTokens.${swiftName}`;
          }
          break;
        case "json":
          const finalValue = tokensData[kebabName] || tokenValue;
          formattedValue = `"${kebabName}": "${finalValue}"`;
          break;
        case "plist":
          formattedValue = `<key>${kebabName}</key>\n<string>${tokenValue}</string>`;
          break;
      }

      tokenEl.innerHTML = formattedValue;
      tokenEl.style.display = formattedValue ? "block" : "none";
    });
  } catch (error) {
    console.error("Error updating iOS token format:", error);
  }
}

// Copy token in current format
function copyToken(tokenName, tokenValue, isWebapp, isIOS) {
  let textToCopy = tokenName; // fallback to token name

  if (isWebapp) {
    // Check current format selection
    const formatElement = document.getElementById("token-format");
    if (formatElement) {
      const format = formatElement.value;
      const kebabName = tokenName.replace(/\./g, "-");

      switch (format) {
        case "names":
          textToCopy = tokenName;
          break;
        case "css":
          textToCopy = `var(--swa-${kebabName})`;
          break;
        case "js":
          const camelCaseName = kebabName
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            .replace(/-/g, "");
          textToCopy = `swa${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}`;
          break;
        case "json":
          textToCopy = `"${kebabName}": "${tokenValue}"`;
          break;
        default:
          textToCopy = tokenName;
      }
    }
  } else if (isIOS) {
    // Check iOS format selection
    const formatElement = document.getElementById("ios-token-format");
    if (formatElement) {
      const format = formatElement.value;
      const kebabName = tokenName.replace(/\./g, "-");
      // Use helper function for iOS token name cleaning
      const swiftName = cleanIOSTokenName(tokenName);

      switch (format) {
        case "names":
          textToCopy = tokenName;
          break;
        case "swift":
          textToCopy = `SmaTokens.${swiftName}`;
          break;
        case "json":
          textToCopy = `"${kebabName}": "${tokenValue}"`;
          break;
        case "plist":
          textToCopy = `<key>${kebabName}</key>\n<string>${tokenValue}</string>`;
          break;
        default:
          textToCopy = tokenName;
      }
    }
  }

  // Copy to clipboard with improved fallback
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showCopyFeedback(textToCopy);
      })
      .catch((err) => {
        console.error("Clipboard API failed: ", err);
        fallbackCopyToClipboard(textToCopy);
      });
  } else {
    // Use fallback immediately if clipboard API is not available
    fallbackCopyToClipboard(textToCopy);
  }
}

// Improved fallback copy function
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "-9999px";
  textArea.setAttribute('readonly', '');
  textArea.setAttribute('contenteditable', 'true');
  document.body.appendChild(textArea);

  try {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    const successful = document.execCommand("copy");
    if (successful) {
      showCopyFeedback(text);
    } else {
      console.error("Fallback copy failed");
      showCopyError();
    }
  } catch (err) {
    console.error("Fallback copy failed: ", err);
    showCopyError();
  } finally {
    document.body.removeChild(textArea);
  }
}

// Show copy feedback
function showCopyFeedback(copiedText) {
  // Remove any existing feedback
  const existingFeedback = document.querySelector(".copy-feedback, .copy-error");
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create and show feedback
  const feedback = document.createElement("div");
  feedback.className = "copy-feedback";
  feedback.innerHTML = `Copied: <code>${copiedText}</code>`;
  document.body.appendChild(feedback);

  // Remove after 2 seconds
  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

// Show copy error feedback
function showCopyError() {
  // Remove any existing feedback
  const existingFeedback = document.querySelector(".copy-feedback, .copy-error");
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create and show error feedback
  const feedback = document.createElement("div");
  feedback.className = "copy-error";
  feedback.innerHTML = `Copy failed - clipboard not available`;
  document.body.appendChild(feedback);

  // Remove after 3 seconds
  setTimeout(() => {
    feedback.remove();
  }, 3000);
}

// Handle typography showcase CSS variable updates
function handleTypographyShowcase(showcaseEl, format) {
  const cssVarElements = showcaseEl.querySelectorAll('.token-css-variable');

  cssVarElements.forEach(cssVarEl => {
    const cssVarType = cssVarEl.getAttribute('data-css-var');
    const tokenReferenceItem = cssVarEl.closest('.token-reference-item');
    const coreTokenEl = tokenReferenceItem.querySelector('.token-reference-resolved');

    if (!coreTokenEl) return;

    const coreTokenName = coreTokenEl.textContent.replace(/[{}]/g, '');
    const cssVariable = `var(--swa-${coreTokenName.replace(/\./g, '-')})`;

    switch (format) {
      case "names":
        cssVarEl.style.display = "none";
        break;
      case "css":
        cssVarEl.innerHTML = `<div class="css-variable-display">${cssVariable}</div>`;
        cssVarEl.style.display = "block";
        break;
      case "js":
      case "json":
        cssVarEl.style.display = "none";
        break;
      default:
        cssVarEl.style.display = "none";
    }
  });
}

// Update webapp token format for individual tokens
async function updateWebappTokenFormat() {
  const formatElement = document.getElementById("token-format");
  if (!formatElement) {
    console.warn("Token format dropdown not found");
    return;
  }

  const format = formatElement.value;
  const webappTokens = document.querySelectorAll(".token-formatted-output, .typography-css-variables, .typography-showcase");

  if (webappTokens.length === 0) {
    console.log("No webapp tokens with formatted output found");
    return;
  }

  try {
    let tokensData = {};

    if (format !== "names") {
      const response = await fetch("dist/web/tokens.json");
      if (response.ok) {
        tokensData = await response.json();
      }
    }

    webappTokens.forEach((tokenEl) => {
      const tokenName = tokenEl.getAttribute("data-token");
      const tokenValue = tokenEl.getAttribute("data-value");
      const coreTokens = tokenEl.getAttribute("data-core-tokens");

      if (!tokenName) {
        // Handle typography showcase elements specially
        if (tokenEl.classList.contains('typography-showcase')) {
          handleTypographyShowcase(tokenEl, format);
        }
        return;
      }

      const kebabName = tokenName.replace(/\./g, "-");
      let formattedValue = "";

      // Check if this is a typography token with core token references
      const isTypographyToken = coreTokens && tokenEl.classList.contains('typography-css-variables');

      switch (format) {
        case "names":
          // Hide the formatted output section for "names only"
          tokenEl.style.display = "none";
          return;
        case "css":
          if (isTypographyToken) {
            // Show individual CSS variables for each core token the typography style references
            const tokens = JSON.parse(coreTokens);
            formattedValue = tokens.map(token =>
              `<div class="core-token-item">
                <div class="token-reference-item">
                  <span class="token-reference-name">${token.webappToken}</span>
                  <span class="token-reference-resolved">{${token.coreToken}}</span>
                </div>
                <div class="css-variable-display">${token.cssVariable}</div>
              </div>`
            ).join('');
          } else {
            formattedValue = `var(--swa-${kebabName})`;
          }
          break;
        case "js":
          const camelCaseName = kebabName
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            .replace(/-/g, "");
          formattedValue = `swa${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}`;
          break;
        case "json":
          const finalValue = tokensData[kebabName] || tokenValue;
          formattedValue = `"${kebabName}": "${finalValue}"`;
          break;
      }

      tokenEl.innerHTML = formattedValue;
      tokenEl.style.display = formattedValue ? "block" : "none";
    });
  } catch (error) {
    console.error("Error updating webapp token format:", error);
  }
}

// Load content for sections
async function loadSectionContent(sectionId) {
  console.log(`Loading content for ${sectionId}`);

  if (sectionId === "core") {
    await loadCoreTokens();
  } else if (sectionId === "webapp") {
    // Force refresh of modification times when entering webapp section
    fileModificationTimes.clear();
    await loadWebTokens();
  } else if (sectionId === "android") {
    await loadAndroidTokens();
  } else if (sectionId === "ios") {
    await loadIOSTokens();
  } else if (sectionId === "outputs") {
    await loadOutputFiles();
  }
}

// Load and display core tokens
async function loadCoreTokens() {
  try {
    // Load core color tokens
    const colorResponse = await fetch("tokens/Core/Color.json");
    const colorTokens = await colorResponse.json();

    // Load core spacing tokens
    const spacingResponse = await fetch("tokens/Core/Spacing.json");
    const spacingTokens = await spacingResponse.json();

    // Load core typography tokens
    const typographyResponse = await fetch("tokens/Core/Typography.json");
    const typographyTokens = await typographyResponse.json();

    // Load core border radius tokens
    const borderRadiusResponse = await fetch("tokens/Core/Border-radius.json");
    const borderRadiusTokens = await borderRadiusResponse.json();

    const grid = document.querySelector("#core .token-grid");
    grid.innerHTML = "";

    // Group and display light color tokens
    if (colorTokens) {
      if (
        colorTokens.color &&
        colorTokens.color.solid &&
        colorTokens.color.solid.light
      ) {
        displayTokenCategory(
          grid,
          "Color Solid - Light",
          { color: { solid: { light: colorTokens.color.solid.light } } },
          "color",
        );
      }
      if (
        colorTokens.color &&
        colorTokens.color.alpha &&
        colorTokens.color.alpha.light
      ) {
        displayTokenCategory(
          grid,
          "Color Alpha - Light",
          { color: { alpha: { light: colorTokens.color.alpha.light } } },
          "color",
        );
      }
    }

    // Group and display dark color tokens
    if (colorTokens) {
      if (
        colorTokens.color &&
        colorTokens.color.solid &&
        colorTokens.color.solid.dark
      ) {
        displayTokenCategory(
          grid,
          "Color Solid - Dark",
          { color: { solid: { dark: colorTokens.color.solid.dark } } },
          "color",
        );
      }
      if (
        colorTokens.color &&
        colorTokens.color.alpha &&
        colorTokens.color.alpha.dark
      ) {
        displayTokenCategory(
          grid,
          "Color Alpha - Dark",
          { color: { alpha: { dark: colorTokens.color.alpha.dark } } },
          "color",
        );
      }
    }

    // Display color hues
    if (colorTokens && colorTokens.color && colorTokens.color.hues) {
      displayTokenCategory(
        grid,
        "Color Hues",
        { color: { hues: colorTokens.color.hues } },
        "color",
      );
    }

    // Display spacing tokens
    if (spacingTokens) {
      displayTokenCategory(grid, "Spacing", spacingTokens, "dimension");
    }

    // Display border radius tokens
    if (borderRadiusTokens) {
      displayTokenCategory(grid, "Border Radius", borderRadiusTokens, "borderRadius");
    }

    // Display typography tokens organized by categories
    console.log("Typography tokens:", typographyTokens);
    if (typographyTokens) {
      // Display font families
      if (typographyTokens.font && typographyTokens.font.family) {
        displayTokenCategory(grid, "Font Families", { font: { family: typographyTokens.font.family } }, "fontFamilies");
      }

      // Display font sizes
      if (typographyTokens.font && typographyTokens.font.size) {
        displayTokenCategory(grid, "Font Sizes", { font: { size: typographyTokens.font.size } }, "fontSizes");
      }

      // Display font weights
      if (typographyTokens.font && typographyTokens.font.weight) {
        displayTokenCategory(grid, "Font Weights", { font: { weight: typographyTokens.font.weight } }, "fontWeights");
      }

      // Display line heights
      if (typographyTokens.font && typographyTokens.font["line-height"]) {
        displayTokenCategory(grid, "Line Heights", { font: { "line-height": typographyTokens.font["line-height"] } }, "lineHeights");
      }

      // Display letter spacing
      if (typographyTokens.font && typographyTokens.font["letter-spacing"]) {
        displayTokenCategory(grid, "Letter Spacing", { font: { "letter-spacing": typographyTokens.font["letter-spacing"] } }, "letterSpacing");
      }

      console.log("Typography tokens displayed by category");
    }
  } catch (error) {
    console.error("Error loading core tokens:", error);
    document.querySelector("#core .token-grid").innerHTML =
      "<p>Error loading tokens</p>";
  }
}

// Helper function to transform token structure with resolved values
function transformTokensWithResolvedValues(tokenStructure, resolvedTokens) {
  function transformObject(obj, path = []) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];

      if (value && typeof value === 'object') {
        if (value.value !== undefined) {
          // This is a token with a value - try to find resolved value
          const tokenPath = currentPath.join('.');

          // Try to find in resolved tokens by following the path
          let resolvedValue = resolvedTokens;
          for (const segment of currentPath) {
            if (resolvedValue && resolvedValue[segment] !== undefined) {
              resolvedValue = resolvedValue[segment];
            } else {
              resolvedValue = null;
              break;
            }
          }

          // If we found a resolved value, use it; otherwise keep original
          const finalValue = (typeof resolvedValue === 'string') ? resolvedValue : value.value;

          result[key] = {
            ...value,
            value: finalValue
          };
        } else {
          // This is a nested object
          result[key] = transformObject(value, currentPath);
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  return transformObject(tokenStructure);
}

// Helper function to resolve token references
function resolveTokenReference(value, coreTokens, webappTokens = null) {
  if (
    typeof value === "string" &&
    value.startsWith("{") &&
    value.endsWith("}")
  ) {
    // Remove braces and split the path
    const path = value.slice(1, -1).split(".");

    // Try webapp tokens first if available
    if (webappTokens) {
      let resolved = webappTokens;
      for (const segment of path) {
        if (resolved && resolved[segment] !== undefined) {
          resolved = resolved[segment];
        } else {
          resolved = null;
          break;
        }
      }
      if (resolved && resolved.value !== undefined) {
        // Recursively resolve if the value is also a reference
        return resolveTokenReference(resolved.value, coreTokens, webappTokens);
      }
    }

    // Fall back to core tokens
    let resolved = coreTokens;
    for (const segment of path) {
      if (resolved && resolved[segment] !== undefined) {
        resolved = resolved[segment];
      } else {
        return value; // Return original if path not found
      }
    }

    // Return the resolved value or original if not found
    return resolved && resolved.value ? resolved.value : value;
  }
  return value;
}

// Helper function to find what core token a webapp token references
function findCoreTokenReference(tokenReference, webappTypographyTokens, coreTokens) {
  if (!tokenReference || typeof tokenReference !== 'string' || !tokenReference.startsWith('{') || !tokenReference.endsWith('}')) {
    return tokenReference; // Not a token reference
  }

  // Remove braces and split the path
  const path = tokenReference.slice(1, -1).split('.');

  // Try to find the webapp typography token
  let webappToken = webappTypographyTokens;
  for (const segment of path) {
    if (webappToken && webappToken[segment] !== undefined) {
      webappToken = webappToken[segment];
    } else {
      webappToken = null;
      break;
    }
  }

  // If we found the webapp token and it has a value that's also a reference
  if (webappToken && webappToken.value && typeof webappToken.value === 'string' &&
      webappToken.value.startsWith('{') && webappToken.value.endsWith('}')) {
    let coreRef = webappToken.value;
    // Format line-height tokens to display properly (1_2 -> 1.2, 1_5 -> 1.5, etc.)
    if (coreRef.includes('line-height.') && coreRef.includes('_')) {
      coreRef = coreRef.replace(/(\d)_(\d)/g, '$1.$2');
    }
    return coreRef; // Return the formatted core token reference
  }

  return tokenReference; // Return original if we can't resolve
}

// Helper function to convert token path to CSS custom property name
function tokenPathToCSSProperty(fullPath) {
  // Convert token path to CSS custom property name following the expanded tokens pattern
  let cssName = fullPath;

  // Convert dots to dashes first
  cssName = cssName.replace(/\./g, '-');

  // Add dashes before uppercase letters, but be careful with existing dashes
  cssName = cssName.replace(/([a-z])([A-Z])/g, '$1-$2');

  // Convert to lowercase
  cssName = cssName.toLowerCase();

  // Clean up any double dashes
  cssName = cssName.replace(/-+/g, '-');

  // Remove leading or trailing dashes
  cssName = cssName.replace(/^-+|-+$/g, '');

  return cssName;
}

// Helper function to render typography tokens with large dedicated component
function renderTypographyToken(token, fullPath, isWebapp, coreTokens, webappTokens, isIOS) {
  const typographyValue = token.value;

  // Resolve with better fallbacks
  let fontFamily = resolveTokenReference(typographyValue.fontFamily || "'Inter', sans-serif", coreTokens, webappTokens);
  let fontSize = resolveTokenReference(typographyValue.fontSize || "16", coreTokens, webappTokens);
  let fontWeight = resolveTokenReference(typographyValue.fontWeight || "400", coreTokens, webappTokens);
  let lineHeight = resolveTokenReference(typographyValue.lineHeight || "1.5", coreTokens, webappTokens);
  let letterSpacing = resolveTokenReference(typographyValue.letterSpacing || "0%", coreTokens, webappTokens);

  // Map common token references to actual values
  const tokenMappings = {
    '{font.family.mobile}': "'Inter', sans-serif",
    '{font.family.web}': "'Inter', sans-serif",
    '{font.family.sans}': "'Inter', sans-serif",
    '{font.weight.regular}': "400",
    '{font.weight.medium}': "500",
    '{font.weight.semibold}': "600",
    '{font.weight.bold}': "700",
    '{font.line-height.tighter}': "1.1",
    '{font.line-height.tight}': "1.2",
    '{font.line-height.normal}': "1.5",
    '{font.letter-spacing.tight}': "-0.02em",
    '{font.letter-spacing.normal}': "0",
    '{font.size.display.xl}': "96",
    '{font.size.display.lg}': "80",
    '{font.size.display.md}': "64",
    '{font.size.display.sm}': "48",
    '{font.size.headline.3xl}': "40",
    '{font.size.headline.2xl}': "34",
    '{font.size.headline.xl}': "28",
    '{font.size.headline.lg}': "24",
    '{font.size.headline.md}': "20",
    '{font.size.headline.sm}': "18",
    '{font.size.body.xl}': "20",
    '{font.size.body.lg}': "16",
    '{font.size.body.md}': "14",
    '{font.size.body.sm}': "12",
    '{font.size.label.xl}': "18",
    '{font.size.label.lg}': "16",
    '{font.size.label.md}': "14",
    '{font.size.label.sm}': "12"
  };

  // Apply mappings if resolution failed
  if (fontFamily.includes('{')) {
    fontFamily = tokenMappings[fontFamily] || "'Inter', sans-serif";
  }
  if (fontSize.includes('{')) {
    fontSize = tokenMappings[fontSize] || "16";
  }
  if (fontWeight.includes('{')) {
    fontWeight = tokenMappings[fontWeight] || "400";
  }
  if (lineHeight.includes('{')) {
    lineHeight = tokenMappings[lineHeight] || "1.5";
  }
  if (letterSpacing.includes('{')) {
    letterSpacing = tokenMappings[letterSpacing] || "0%";
  }

  // Ensure fontSize has units
  if (!isNaN(fontSize) && !fontSize.toString().includes('px')) {
    fontSize = fontSize + 'px';
  }

  // Convert percentage letter-spacing to em
  let letterSpacingValue = letterSpacing;
  if (letterSpacing.includes("%")) {
    const percentage = parseFloat(letterSpacing.replace("%", ""));
    letterSpacingValue = `${percentage / 100}em`;
  }

  // Debug log
  console.log('Typography values:', { fontFamily, fontSize, fontWeight, lineHeight, letterSpacingValue });

  // For typography tokens, show CSS variables for the core tokens it references
  const coreTokenReferences = [];
  if (typographyValue.fontFamily) {
    const coreToken = findCoreTokenReference(typographyValue.fontFamily, webappTokens, coreTokens);
    const cleanCoreToken = coreToken.replace(/[{}]/g, '');
    coreTokenReferences.push({
      property: 'Font Family',
      webappToken: typographyValue.fontFamily.replace(/[{}]/g, ''),
      coreToken: cleanCoreToken,
      cssVariable: `var(--swa-${cleanCoreToken.replace(/\./g, '-')})`
    });
  }
  if (typographyValue.fontSize) {
    const coreToken = findCoreTokenReference(typographyValue.fontSize, webappTokens, coreTokens);
    const cleanCoreToken = coreToken.replace(/[{}]/g, '');
    coreTokenReferences.push({
      property: 'Font Size',
      webappToken: typographyValue.fontSize.replace(/[{}]/g, ''),
      coreToken: cleanCoreToken,
      cssVariable: `var(--swa-${cleanCoreToken.replace(/\./g, '-')})`
    });
  }
  if (typographyValue.fontWeight) {
    const coreToken = findCoreTokenReference(typographyValue.fontWeight, webappTokens, coreTokens);
    const cleanCoreToken = coreToken.replace(/[{}]/g, '');
    coreTokenReferences.push({
      property: 'Font Weight',
      webappToken: typographyValue.fontWeight.replace(/[{}]/g, ''),
      coreToken: cleanCoreToken,
      cssVariable: `var(--swa-${cleanCoreToken.replace(/\./g, '-')})`
    });
  }
  if (typographyValue.lineHeight) {
    const coreToken = findCoreTokenReference(typographyValue.lineHeight, webappTokens, coreTokens);
    const cleanCoreToken = coreToken.replace(/[{}]/g, '');
    coreTokenReferences.push({
      property: 'Line Height',
      webappToken: typographyValue.lineHeight.replace(/[{}]/g, ''),
      coreToken: cleanCoreToken,
      cssVariable: `var(--swa-${cleanCoreToken.replace(/\./g, '-')})`
    });
  }
  if (typographyValue.letterSpacing) {
    const coreToken = findCoreTokenReference(typographyValue.letterSpacing, webappTokens, coreTokens);
    const cleanCoreToken = coreToken.replace(/[{}]/g, '');
    coreTokenReferences.push({
      property: 'Letter Spacing',
      webappToken: typographyValue.letterSpacing.replace(/[{}]/g, ''),
      coreToken: cleanCoreToken,
      cssVariable: `var(--swa-${cleanCoreToken.replace(/\./g, '-')})`
    });
  }

  const formattedOutput = (isWebapp || isIOS)
    ? `<div class="typography-css-variables" data-token="${fullPath}" data-core-tokens='${JSON.stringify(coreTokenReferences)}'></div>`
    : "";

  return `
    <div class="typography-showcase${isWebapp ? " webapp-token" : ""}${isIOS ? " ios-token" : ""}" onclick="copyToken('${fullPath}', '${JSON.stringify(token.value)}', ${isWebapp}, ${isIOS})">
      <div class="typography-header">
        <h4 class="typography-title">${fullPath}</h4>
      </div>
      <div class="typography-demo typography-${tokenPathToCSSProperty(fullPath)}" data-debug-path="${fullPath}" data-debug-css="typography-${tokenPathToCSSProperty(fullPath)}" style="font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}; letter-spacing: ${letterSpacingValue};">
        The quick brown fox jumps over the lazy dog

      </div>
      <div class="typography-details">
        <div class="typography-token-references">
          <div class="token-reference-item">
            <span class="token-reference-name">${typographyValue.fontFamily.replace(/[{}]/g, '')}</span>
            <span class="token-reference-resolved">${findCoreTokenReference(typographyValue.fontFamily, webappTokens, coreTokens)}</span>
            <div class="token-css-variable" data-css-var="font-family"></div>
          </div>
          <div class="token-reference-item">
            <span class="token-reference-name">${typographyValue.fontSize.replace(/[{}]/g, '')}</span>
            <span class="token-reference-resolved">${findCoreTokenReference(typographyValue.fontSize, webappTokens, coreTokens)}</span>
            <div class="token-css-variable" data-css-var="font-size"></div>
          </div>
          <div class="token-reference-item">
            <span class="token-reference-name">${typographyValue.fontWeight.replace(/[{}]/g, '')}</span>
            <span class="token-reference-resolved">${findCoreTokenReference(typographyValue.fontWeight, webappTokens, coreTokens)}</span>
            <div class="token-css-variable" data-css-var="font-weight"></div>
          </div>
          <div class="token-reference-item">
            <span class="token-reference-name">${typographyValue.lineHeight.replace(/[{}]/g, '')}</span>
            <span class="token-reference-resolved">${findCoreTokenReference(typographyValue.lineHeight, webappTokens, coreTokens)}</span>
            <div class="token-css-variable" data-css-var="line-height"></div>
          </div>
          <div class="token-reference-item">
            <span class="token-reference-name">${typographyValue.letterSpacing.replace(/[{}]/g, '')}</span>
            <span class="token-reference-resolved">${findCoreTokenReference(typographyValue.letterSpacing, webappTokens, coreTokens)}</span>
            <div class="token-css-variable" data-css-var="letter-spacing"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper function to display typography categories with special layout
function displayTypographyCategory(
  container,
  categoryName,
  tokens,
  isWebapp = false,
  coreTokens = null,
  fullWebappTypographyTokens = null,
  isIOS = false,
) {
  const categoryDiv = document.createElement("div");
  categoryDiv.className = "typography-category";

  let categoryHtml = `<h3 class="typography-category-title">${categoryName}</h3><div class="typography-showcase-list">`;

  function renderTypographyTokens(obj, prefix = "") {
    Object.keys(obj).forEach((key) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const token = obj[key];

      if (token && typeof token === "object") {
        if (token.value !== undefined && token.type === "typography" && typeof token.value === "object") {
          // This is a typography token
          categoryHtml += renderTypographyToken(token, fullPath, isWebapp, coreTokens, fullWebappTypographyTokens, isIOS);
        } else if (token.value === undefined) {
          // This is a nested object
          renderTypographyTokens(token, fullPath);
        }
      }
    });
  }

  renderTypographyTokens(tokens);
  categoryHtml += `</div>`;
  categoryDiv.innerHTML = categoryHtml;
  container.appendChild(categoryDiv);
}

// Helper function to display token categories
function displayTokenCategory(
  container,
  categoryName,
  tokens,
  defaultType,
  isWebapp = false,
  coreTokens = null,
  webappTokens = null,
  isIOS = false,
) {
  const categoryDiv = document.createElement("div");
  categoryDiv.className = "token-category";

  let categoryHtml = `<h3>${categoryName}</h3><div class="token-list">`;

  function renderTokens(obj, prefix = "") {
    Object.keys(obj).forEach((key) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const token = obj[key];

      if (token && typeof token === "object") {
        if (token.value !== undefined) {
          // This is a token
          const tokenType = token.type || defaultType;
          let preview = "";

          // Handle typography tokens with dedicated function
          if (tokenType === "typography" && typeof token.value === "object") {
            categoryHtml += renderTypographyToken(token, fullPath, isWebapp, coreTokens, webappTokens, isIOS);
            return;
          }

          if (tokenType === "color") {
            let colorValue;

            if ((isWebapp || isIOS) && coreTokens) {
              // For webapp and iOS tokens, resolve references to actual color values
              colorValue = resolveTokenReference(
                token.value,
                coreTokens,
                webappTokens || tokens,
              );
            } else {
              // For core tokens, use actual color values directly
              colorValue = token.value;
            }

            // Add checkerboard pattern for transparent colors
            const isAlpha =
              fullPath.includes("alpha") ||
              token.value.includes("00000000") ||
              token.value.includes("ffffff00");
            const checkerboard = isAlpha
              ? "background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"
              : "";
            preview = `<div class="token-preview" style="background-color: ${colorValue}; ${checkerboard}"></div>`;
          } else if (tokenType === "dimension" || tokenType === "spacing") {
            let dimensionValue = token.value;

            // For webapp tokens, resolve references to actual dimension values
            if (isWebapp && coreTokens) {
              dimensionValue = resolveTokenReference(
                token.value,
                coreTokens,
                webappTokens || tokens,
              );
            }

            // Parse the dimension value and create preview
            const numericValue = parseFloat(dimensionValue.replace("px", ""));
            const width = Math.max(2, numericValue) + "px"; // Minimum 2px width for visibility
            preview = `<div class="dimension-preview" style="width: ${width}; height: 8px; background: #333 !important;"></div>`;

          } else if (tokenType === "borderRadius") {
            let borderRadiusValue = token.value;

            // For webapp tokens, resolve references to actual border radius values
            if (isWebapp && coreTokens) {
              borderRadiusValue = resolveTokenReference(
                token.value,
                coreTokens,
                webappTokens || tokens,
              );
            }

            // Parse the border radius value and create preview
            const numericValue = parseFloat(borderRadiusValue.replace("px", ""));
            const borderRadiusValueWithUnit = Math.max(0, numericValue) + "px";
            preview = `<div class="border-radius-preview" style="width: 40px; height: 40px; background: var(--swa-action-primary-enabled, #333); border-radius: ${borderRadiusValueWithUnit};"></div>`;

          } else if (tokenType === "typography") {
            // Handle typography tokens
            let typographyValue = token.value;
            if (typeof typographyValue === "object") {
              // For composite typography tokens, show sample text with applied styles
              const fontFamily = resolveTokenReference(typographyValue.fontFamily || "'Inter', sans-serif", coreTokens, webappTokens || tokens);
              let fontSize = resolveTokenReference(typographyValue.fontSize || "16", coreTokens, webappTokens || tokens);
              // Ensure fontSize has units
              if (!isNaN(fontSize) && !fontSize.toString().includes('px')) {
                fontSize = fontSize + 'px';
              }
              const fontWeight = resolveTokenReference(typographyValue.fontWeight || "400", coreTokens, webappTokens || tokens);
              let lineHeight = resolveTokenReference(typographyValue.lineHeight || "1.5", coreTokens, webappTokens || tokens);
              const letterSpacing = resolveTokenReference(typographyValue.letterSpacing || "0%", coreTokens, webappTokens || tokens);

              // Debug typography values for iOS tokens
              if (isIOS) {
                console.log(`🎨 Typography debug for ${fullPath}:`, {
                  fontFamily,
                  fontSize,
                  fontWeight,
                  lineHeight,
                  letterSpacing,
                  originalValue: typographyValue
                });
              }

              // Convert percentage line-height to unitless value
              if (typeof lineHeight === 'string' && lineHeight.includes("%")) {
                const percentage = parseFloat(lineHeight.replace("%", ""));
                lineHeight = (percentage / 100).toString();
              }

              // Convert percentage letter-spacing to em
              let letterSpacingValue = letterSpacing;
              if (typeof letterSpacing === 'string' && letterSpacing.includes("%")) {
                const percentage = parseFloat(letterSpacing.replace("%", ""));
                letterSpacingValue = `${percentage / 100}em`;
              } else if (typeof letterSpacing === 'number') {
                // Handle numeric letter spacing values
                letterSpacingValue = `${letterSpacing / 100}em`;
              }

              preview = `<div class="typography-preview" style="font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; line-height: ${lineHeight}; letter-spacing: ${letterSpacingValue}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">The quick brown fox</div>`;
            } else {
              // For primitive typography tokens, just show the value
              preview = `<div class="typography-preview">"${typographyValue}"</div>`;
            }
          } else if (tokenType === "fontFamilies" || tokenType === "fontSizes" || tokenType === "fontWeights" || tokenType === "letterSpacing" || tokenType === "lineHeights") {
            // Handle individual typography properties
            let typographyValue = token.value;
            if (isWebapp && coreTokens) {
              typographyValue = resolveTokenReference(token.value, coreTokens, webappTokens || tokens);
            }

            if (tokenType === "fontFamilies") {
              preview = `<div class="typography-preview" style="font-family: ${typographyValue};">The quick brown fox</div>`;
            } else if (tokenType === "fontSizes") {
              let fontSizeValue = typographyValue;
              if (!isNaN(fontSizeValue) && !fontSizeValue.toString().includes('px')) {
                fontSizeValue = fontSizeValue + 'px';
              }
              preview = `<div class="typography-preview" style="font-size: ${fontSizeValue};">Aa</div>`;
            } else if (tokenType === "fontWeights") {
              preview = `<div class="typography-preview" style="font-weight: ${typographyValue};">The quick brown fox</div>`;
            } else if (tokenType === "letterSpacing") {
              let letterSpacingValue = typographyValue;
              if (typographyValue.includes("%")) {
                const percentage = parseFloat(typographyValue.replace("%", ""));
                letterSpacingValue = `${percentage / 100}em`;
              }
              preview = `<div class="typography-preview" style="letter-spacing: ${letterSpacingValue};">The quick brown fox</div>`;
            } else if (tokenType === "lineHeights") {
              preview = `<div class="typography-preview" style="line-height: ${typographyValue};">The quick brown fox<br>jumps over the lazy dog</div>`;
            }

          }

          const formattedOutput = (isWebapp || isIOS)
            ? `<div class="token-formatted-output" data-token="${fullPath}" data-value="${token.value}"></div>`
            : "";

          categoryHtml += `
            <div class="token-item${isWebapp ? " webapp-token" : ""}${isIOS ? " ios-token" : ""}" onclick="copyToken('${fullPath}', '${token.value}', ${isWebapp}, ${isIOS})">
              ${preview}
              <div class="token-info">
                <div class="token-name">${fullPath}</div>
                <div class="token-value">${token.value}</div>
                ${formattedOutput}
              </div>
            </div>
          `;
        } else {
          // This is a nested object
          renderTokens(token, fullPath);
        }
      }
    });
  }

  renderTokens(tokens);
  categoryHtml += `</div>`;
  categoryDiv.innerHTML = categoryHtml;
  container.appendChild(categoryDiv);
}

// Load and display web tokens
async function loadWebTokens() {
  try {
    // Determine current theme
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const isDarkTheme = currentTheme === "dark";
    const themeLabel = isDarkTheme ? "Dark" : "Light";

    // Load appropriate theme tokens
    let themeTokens = null;
    try {
      const themeFile = isDarkTheme
        ? "tokens/Webapp/Color/Dark.json"
        : "tokens/Webapp/Color/Light.json";
      const themeResponse = await fetch(themeFile);
      if (themeResponse.ok) {
        themeTokens = await themeResponse.json();
      }
    } catch (error) {
      console.log("No webapp color tokens found:", error.message);
    }

    // Load webapp spacing tokens
    let webappSpacingTokens = null;
    try {
      const spacingResponse = await fetch("tokens/Webapp/Spacing.json");
      if (spacingResponse.ok) {
        webappSpacingTokens = await spacingResponse.json();
      }
    } catch (error) {
      console.log("No webapp spacing tokens found");
    }

    // Load webapp typography tokens
    let webappTypographyTokens = null;
    try {
      const typographyResponse = await fetch("tokens/Webapp/Typography.json");
      if (typographyResponse.ok) {
        webappTypographyTokens = await typographyResponse.json();
      }
    } catch (error) {
      console.log("No webapp typography tokens found");
    }

    // Load webapp border radius tokens
    let webappBorderRadiusTokens = null;
    try {
      const borderRadiusResponse = await fetch("tokens/Webapp/Border-radius.json");
      if (borderRadiusResponse.ok) {
        webappBorderRadiusTokens = await borderRadiusResponse.json();
      }
    } catch (error) {
      console.log("No webapp border radius tokens found");
    }

    // Load core tokens for reference resolution (both color and spacing)
    const coreColorResponse = await fetch("tokens/Core/Color.json");
    const coreColorTokens = await coreColorResponse.json();

    const coreSpacingResponse = await fetch("tokens/Core/Spacing.json");
    const coreSpacingTokens = await coreSpacingResponse.json();

    // Load core border radius tokens for reference resolution
    const coreBorderRadiusResponse = await fetch("tokens/Core/Border-radius.json");
    const coreBorderRadiusTokens = await coreBorderRadiusResponse.json();

    // Combine core tokens for reference resolution
    const coreTokens = {
      ...coreColorTokens,
      ...coreSpacingTokens,
      ...coreBorderRadiusTokens,
    };

    const grid = document.querySelector("#webapp .token-grid");
    if (!grid) {
      // Create token grid if it doesn't exist
      const webappSection = document.querySelector("#webapp");
      const tokenGrid = document.createElement("div");
      tokenGrid.className = "token-grid";
      webappSection.appendChild(tokenGrid);
    }

    const webappGrid = document.querySelector("#webapp .token-grid");
    webappGrid.innerHTML = "";

    // Group and display webapp tokens by type for current theme
    if (themeTokens) {
      if (themeTokens.action) {
        displayTokenCategory(
          webappGrid,
          `Action Colors (${themeLabel})`,
          { action: themeTokens.action },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
      if (themeTokens.elevation && themeTokens.elevation.solid) {
        displayTokenCategory(
          webappGrid,
          `Elevation Solid (${themeLabel})`,
          { elevation: { solid: themeTokens.elevation.solid } },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
      if (themeTokens.elevation && themeTokens.elevation.alpha) {
        displayTokenCategory(
          webappGrid,
          `Elevation Alpha (${themeLabel})`,
          { elevation: { alpha: themeTokens.elevation.alpha } },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
      if (themeTokens["on-surface"]) {
        displayTokenCategory(
          webappGrid,
          `On Surface Colors (${themeLabel})`,
          { "on-surface": themeTokens["on-surface"] },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
      if (themeTokens.status) {
        displayTokenCategory(
          webappGrid,
          `Status Colors (${themeLabel})`,
          { status: themeTokens.status },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
      if (themeTokens.brand) {
        displayTokenCategory(
          webappGrid,
          `Brand Colors (${themeLabel})`,
          { brand: themeTokens.brand },
          "color",
          true,
          coreTokens,
          themeTokens,
        );
      }
    }

    // Display webapp spacing tokens (theme-independent)
    if (webappSpacingTokens) {
      displayTokenCategory(
        webappGrid,
        "Webapp Spacing",
        webappSpacingTokens,
        "spacing",
        true,
        coreTokens,
      );
    }

    // Display webapp border radius tokens (theme-independent)
    if (webappBorderRadiusTokens) {
      displayTokenCategory(
        webappGrid,
        "Webapp Border Radius",
        webappBorderRadiusTokens,
        "borderRadius",
        true,
        coreTokens,
      );
    }

    // Display webapp typography tokens grouped by type (theme-independent)
    console.log("Webapp typography tokens:", webappTypographyTokens);
    if (webappTypographyTokens) {
      // Group typography tokens by semantic categories using special typography display
      if (webappTypographyTokens.Display) {
        displayTypographyCategory(
          webappGrid,
          "Display",
          { Display: webappTypographyTokens.Display },
          true,
          coreTokens,
          webappTypographyTokens,
        );
      }

      if (webappTypographyTokens.Headline) {
        displayTypographyCategory(
          webappGrid,
          "Headline",
          { Headline: webappTypographyTokens.Headline },
          true,
          coreTokens,
          webappTypographyTokens,
        );
      }

      if (webappTypographyTokens.Body) {
        displayTypographyCategory(
          webappGrid,
          "Body",
          { Body: webappTypographyTokens.Body },
          true,
          coreTokens,
          webappTypographyTokens,
        );
      }

      if (webappTypographyTokens.Label) {
        displayTypographyCategory(
          webappGrid,
          "Label",
          { Label: webappTypographyTokens.Label },
          true,
          coreTokens,
          webappTypographyTokens,
        );
      }

      // Display webapp font properties organized by categories
      if (webappTypographyTokens.font) {
        // Display webapp font families
        if (webappTypographyTokens.font.family) {
          displayTokenCategory(
            webappGrid,
            "Webapp Font Families",
            { font: { family: webappTypographyTokens.font.family } },
            "fontFamilies",
            true,
            coreTokens,
          );
        }

        // Display webapp font sizes
        if (webappTypographyTokens.font.size) {
          displayTokenCategory(
            webappGrid,
            "Webapp Font Sizes",
            { font: { size: webappTypographyTokens.font.size } },
            "fontSizes",
            true,
            coreTokens,
          );
        }

        // Display webapp font weights
        if (webappTypographyTokens.font.weight) {
          displayTokenCategory(
            webappGrid,
            "Webapp Font Weights",
            { font: { weight: webappTypographyTokens.font.weight } },
            "fontWeights",
            true,
            coreTokens,
          );
        }

        // Display webapp line heights
        if (webappTypographyTokens.font["line-height"]) {
          displayTokenCategory(
            webappGrid,
            "Webapp Line Heights",
            { font: { "line-height": webappTypographyTokens.font["line-height"] } },
            "lineHeights",
            true,
            coreTokens,
          );
        }

        // Display webapp letter spacing
        if (webappTypographyTokens.font["letter-spacing"]) {
          displayTokenCategory(
            webappGrid,
            "Webapp Letter Spacing",
            { font: { "letter-spacing": webappTypographyTokens.font["letter-spacing"] } },
            "letterSpacing",
            true,
            coreTokens,
          );
        }
      }

      console.log("Webapp typography tokens displayed by category");
    }

    // Show message if no webapp color tokens are available
    if (!themeTokens && !webappSpacingTokens && !webappTypographyTokens) {
      webappGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔧</div>
          <h4 class="empty-state-title">Webapp Tokens Temporarily Unavailable</h4>
          <p class="empty-state-description">
            Webapp color tokens are currently being fixed due to a reference error in the build process.
            Webapp spacing tokens will be shown when available.
          </p>
        </div>
      `;
    } else if (!themeTokens) {
      // Only webapp spacing and/or typography tokens available
      if (webappSpacingTokens || webappTypographyTokens) {
        const message = document.createElement("div");
        message.innerHTML = `
          <p style="text-align: center; color: var(--swa-on-surface-secondary); margin-bottom: 24px; font-style: italic;">
            ⚠️ Webapp color tokens temporarily unavailable due to build issue
          </p>
        `;
        webappGrid.insertBefore(message, webappGrid.firstChild);
      }
    }

    // Update format for all webapp tokens
    updateWebappTokenFormat();
  } catch (error) {
    console.error("Error loading webapp tokens:", error);
    // Fallback to the format toggle functionality
    updateTokenFormat();
  }
}



// Load Android tokens
async function loadAndroidTokens() {
  // Android section shows empty state by default
}

// Load iOS tokens
async function loadIOSTokens() {
  console.log("🍎 Loading iOS tokens...");

  // Clear previous content and show loading
  const tokenGrid = document.querySelector("#ios .token-grid");
  console.log("📱 iOS token grid found:", !!tokenGrid);
  if (!tokenGrid) {
    console.error("❌ iOS token grid not found!");
    return;
  }

  // Show loading message
  tokenGrid.innerHTML = `
    <div class="loading-state">
      <div class="loading-icon">⏳</div>
      <h4>Loading iOS tokens...</h4>
      <p>Fetching mobile tokens for iOS platform</p>
    </div>
  `;

  try {
    // Get current theme
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme") || "light";

    console.log("📥 Fetching resolved iOS token values...");

    // Load the resolved token values from the built files
    console.log("📁 Loading resolved tokens for iOS...");
    const tokensResponse = await fetch(`dist/web/tokens.json`);
    if (!tokensResponse.ok) {
      throw new Error(`Failed to fetch resolved tokens (${tokensResponse.status})`);
    }
    const resolvedTokens = await tokensResponse.json();
    console.log("✅ Resolved tokens loaded:", Object.keys(resolvedTokens).length, "tokens");

    // Load theme-specific iOS structure to know which tokens to show
    const themeFile = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    console.log(`📁 Loading iOS ${currentTheme} theme structure...`);
    const colorResponse = await fetch(`tokens/Mobile/Color/${themeFile}.json`);
    if (!colorResponse.ok) {
      throw new Error(`Failed to fetch iOS ${currentTheme} theme structure (${colorResponse.status})`);
    }
    const iOSColorStructure = await colorResponse.json();
    console.log("✅ iOS color structure loaded");

    // Load iOS spacing structure
    console.log("📁 Loading iOS spacing structure...");
    const spacingResponse = await fetch(`tokens/Mobile/Spacing.json`);
    if (!spacingResponse.ok) {
      throw new Error(`Failed to fetch iOS spacing structure (${spacingResponse.status})`);
    }
    const iOSSpacingStructure = await spacingResponse.json();
    console.log("✅ iOS spacing structure loaded");

    // Load iOS typography structure
    console.log("📁 Loading iOS typography structure...");
    const typographyResponse = await fetch(`tokens/Mobile/Typography.json`);
    if (!typographyResponse.ok) {
      throw new Error(`Failed to fetch iOS typography structure (${typographyResponse.status})`);
    }
    const iOSTypographyStructure = await typographyResponse.json();
    console.log("✅ iOS typography structure loaded");

    // Load iOS border radius structure
    console.log("📁 Loading iOS border radius structure...");
    const borderRadiusResponse = await fetch(`tokens/Mobile/Border-radius.json`);
    if (!borderRadiusResponse.ok) {
      throw new Error(`Failed to fetch iOS border radius structure (${borderRadiusResponse.status})`);
    }
    const iOSBorderRadiusStructure = await borderRadiusResponse.json();
    console.log("✅ iOS border radius structure loaded");

    // Transform structure to use resolved values
    console.log("🔄 Transforming iOS tokens with resolved values...");
    const iOSColorTokens = transformTokensWithResolvedValues(iOSColorStructure, resolvedTokens);
    const iOSSpacingTokens = transformTokensWithResolvedValues(iOSSpacingStructure, resolvedTokens);
    const iOSTypographyTokens = transformTokensWithResolvedValues(iOSTypographyStructure, resolvedTokens);
    const iOSBorderRadiusTokens = transformTokensWithResolvedValues(iOSBorderRadiusStructure, resolvedTokens);

    // For reference resolution, we still need core tokens
    console.log("📁 Loading core tokens for reference resolution...");
    const coreColorResponse = await fetch(`tokens/Core/Color.json`);
    const coreTypographyResponse = await fetch(`tokens/Core/Typography.json`);
    const coreSpacingResponse = await fetch(`tokens/Core/Spacing.json`);
    const coreBorderRadiusResponse = await fetch(`tokens/Core/Border-radius.json`);

    const coreTokens = {};
    if (coreColorResponse.ok) {
      coreTokens.color = await coreColorResponse.json();
    }
    if (coreTypographyResponse.ok) {
      coreTokens.font = await coreTypographyResponse.json();
    }
    if (coreSpacingResponse.ok) {
      coreTokens.spacing = await coreSpacingResponse.json();
    }
    if (coreBorderRadiusResponse.ok) {
      coreTokens.borderRadius = await coreBorderRadiusResponse.json();
    }

    // Clear loading and display tokens
    console.log("🎨 Displaying iOS tokens...");
    tokenGrid.innerHTML = "";

    // Display color tokens with proper segmentation
    if (iOSColorTokens && Object.keys(iOSColorTokens).length > 0) {
      console.log("🎨 Adding iOS color tokens to display");

      // Segment colors into categories
      if (iOSColorTokens.elevation) {
        if (iOSColorTokens.elevation.solid) {
          displayTokenCategory(tokenGrid, "iOS Elevation Solid", { elevation: { solid: iOSColorTokens.elevation.solid } }, "color", false, coreTokens, null, true);
        }
        if (iOSColorTokens.elevation.alpha) {
          displayTokenCategory(tokenGrid, "iOS Elevation Alpha", { elevation: { alpha: iOSColorTokens.elevation.alpha } }, "color", false, coreTokens, null, true);
        }
      }

      if (iOSColorTokens.action) {
        const actionTokens = { ...iOSColorTokens.action };
        // Separate on-action from regular action tokens
        if (actionTokens['on-action']) {
          displayTokenCategory(tokenGrid, "iOS On-Action Colors", { action: { 'on-action': actionTokens['on-action'] } }, "color", false, coreTokens, null, true);
          delete actionTokens['on-action'];
        }
        // Display remaining action tokens
        if (Object.keys(actionTokens).length > 0) {
          displayTokenCategory(tokenGrid, "iOS Action Colors", { action: actionTokens }, "color", false, coreTokens, null, true);
        }
      }

      if (iOSColorTokens.brand) {
        displayTokenCategory(tokenGrid, "iOS Brand Colors", { brand: iOSColorTokens.brand }, "color", false, coreTokens, null, true);
      }

      if (iOSColorTokens.status) {
        displayTokenCategory(tokenGrid, "iOS Status Colors", { status: iOSColorTokens.status }, "color", false, coreTokens, null, true);
      }

      if (iOSColorTokens['on-surface']) {
        displayTokenCategory(tokenGrid, "iOS On-Surface Colors", { 'on-surface': iOSColorTokens['on-surface'] }, "color", false, coreTokens, null, true);
      }
    }

    // Display spacing tokens with proper segmentation
    if (iOSSpacingTokens && Object.keys(iOSSpacingTokens).length > 0) {
      console.log("📏 Adding iOS spacing tokens to display");
      displayTokenCategory(tokenGrid, "iOS Spacing", iOSSpacingTokens, "spacing", false, coreTokens, null, true);
    }

    // Display border radius tokens with proper segmentation (after spacing)
    if (iOSBorderRadiusTokens && Object.keys(iOSBorderRadiusTokens).length > 0) {
      console.log("📐 Adding iOS border radius tokens to display");
      displayTokenCategory(tokenGrid, "iOS Border Radius", iOSBorderRadiusTokens, "borderRadius", false, coreTokens, null, true);
    }

    // Display typography tokens with proper segmentation
    if (iOSTypographyTokens && Object.keys(iOSTypographyTokens).length > 0) {
      console.log("📝 Adding iOS typography tokens to display");
      displayTypographyCategory(tokenGrid, "iOS Typography", iOSTypographyTokens, false, coreTokens, null, true);
    }

    console.log("✅ iOS tokens loaded and displayed successfully");

    // Apply current format
    console.log("🔧 Applying iOS token format...");
    updateIOSTokenFormat();
  } catch (error) {
    console.error("❌ Error loading iOS tokens:", error);

    // Show error state
    tokenGrid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h4>Error loading iOS tokens</h4>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Store last modification times for file watching
let fileModificationTimes = new Map();
let fileWatchInterval = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
  // Set initial active section based on which nav button has active class
  const activeButton = document.querySelector('.nav-button.active');
  if (activeButton) {
    const sectionId = activeButton.getAttribute('onclick').match(/switchSection\('([^']+)'/)[1];
    console.log(`🏠 Initializing page with section: ${sectionId}`);
    switchSection(sectionId);
  } else {
    // Fallback to core if no active button found
    console.log('🏠 No active button found, defaulting to core');
    switchSection('core');
  }
});
let tokenWatchInterval = null;

// Load output files
async function loadOutputFiles() {
  const grid = document.getElementById("outputs-grid");

  const outputFiles = [
    {
      path: "dist/web/tokens.css",
      type: "CSS",
      description: "CSS Custom Properties",
    },

    {
      path: "dist/web/tokens.js",
      type: "JS",
      description: "JavaScript ES6 Module",
    },
    {
      path: "dist/web/tokens.json",
      type: "JSON",
      description: "JSON Token Data",
    },
    {
      path: "dist/android/colors.xml",
      type: "XML",
      description: "Android Color Resources",
    },
    {
      path: "dist/android/dimens.xml",
      type: "XML",
      description: "Android Dimension Resources",
    },
    {
      path: "dist/ios/SmaTokens.swift",
      type: "Swift",
      description: "iOS Spacing & Base Tokens",
    },
    {
      path: "dist/ios/SmaTokensLight.swift",
      type: "Swift",
      description: "iOS Light Theme Colors",
    },
    {
      path: "dist/ios/SmaTokensDark.swift",
      type: "Swift",
      description: "iOS Dark Theme Colors",
    },
    {
      path: "dist/ios/SmaTypography.swift",
      type: "Swift",
      description: "iOS Typography Objects",
    },
  ];

  grid.innerHTML = "";

  for (const file of outputFiles) {
    try {
      const response = await fetch(file.path);
      if (response.ok) {
        const fileName = file.path.split("/").pop();
        const fileCard = document.createElement("div");
        fileCard.className = "token-card file-card";

        fileCard.innerHTML = `
          <div class="token-header">
            <div class="token-name">${fileName}</div>
            <div class="token-type">${file.type}</div>
          </div>
          <div class="token-value">
            <div class="value-text">${file.description}</div>
          </div>
                    <div class="file-actions">
            <button class="file-action-btn" onclick="event.stopPropagation(); showFileContent('${file.path}', '${fileName}')" title="View file">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View
            </button>
            <button class="file-action-btn" onclick="event.stopPropagation(); downloadFile('${file.path}', '${fileName}')" title="Download file">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
          </div>
        `;

        grid.appendChild(fileCard);
      }
    } catch (error) {
      console.log(`File ${file.path} not available`);
    }
  }

  // Start file watching if not already started
  startFileWatching();
}

// Start watching for file changes
function startFileWatching() {
  // Clear existing interval if any
  if (fileWatchInterval) {
    clearInterval(fileWatchInterval);
  }

  // Check for file updates every 2 seconds
  fileWatchInterval = setInterval(async () => {
    let hasChanges = false;

    // Check if we're on the outputs section
    const outputsSection = document.getElementById("outputs");
    if (!outputsSection || !outputsSection.classList.contains("active")) {
      return; // Don't check if not viewing outputs
    }

    const outputFiles = [
      "dist/web/tokens.css",
      "dist/web/tokens.js",
      "dist/web/tokens.json",
      "dist/android/colors.xml",
      "dist/android/dimens.xml",
      "dist/ios/SmaTokens.swift",
      "dist/ios/SmaTokensLight.swift",
      "dist/ios/SmaTokensDark.swift",
      "dist/ios/SmaTypography.swift",
    ];

    for (const filePath of outputFiles) {
      try {
        const response = await fetch(filePath, { method: "HEAD" });
        if (response.ok) {
          const lastModified = response.headers.get("Last-Modified");
          const currentTime = new Date(lastModified).getTime();
          const storedTime = fileModificationTimes.get(filePath);

          if (storedTime && currentTime > storedTime) {
            hasChanges = true;
          }
          fileModificationTimes.set(filePath, currentTime);
        }
      } catch (error) {
        // File might not exist yet, ignore
      }
    }

    if (hasChanges) {
      console.log("📄 Detected file changes, refreshing output files...");
      await loadOutputFiles();
    }
  }, 2000);
}

// Show file content in modal
async function showFileContent(filePath, fileName) {
  try {
    const response = await fetch(filePath);
    const content = await response.text();

    // Create modal if it doesn't exist
    let modal = document.getElementById("file-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "file-modal";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title"></h3>
            <button class="modal-close" onclick="closeFileModal()">&times;</button>
          </div>
          <div class="modal-body">
            <pre class="file-content"></pre>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    modal.querySelector(".modal-title").textContent = fileName;
    modal.querySelector(".file-content").textContent = content;
    modal.style.display = "flex";
  } catch (error) {
    console.error("Error loading file:", error);
  }
}

// Close file modal
function closeFileModal() {
  const modal = document.getElementById("file-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Download file function
async function downloadFile(filePath, fileName) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const content = await response.text();

    // Create a blob with the file content
    const blob = new Blob([content], { type: "text/plain" });

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;

    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    URL.revokeObjectURL(downloadLink.href);

    console.log(`📥 Downloaded: ${fileName}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert(`Failed to download ${fileName}. Please try again.`);
  }
}

// View token files
function viewTokenFiles() {
  switchSection("outputs");
  document
    .querySelector("[onclick=\"switchSection('outputs')\"]")
    .classList.add("active");
}

// Start watching for token file changes
function startTokenWatching() {
  // Clear existing interval if any
  if (tokenWatchInterval) {
    clearInterval(tokenWatchInterval);
  }

  // Initialize file modification times first
  const initializeModificationTimes = async () => {
    const tokenFiles = [
      "tokens/Webapp/Color/Light.json",
      "tokens/Webapp/Color/Dark.json",
      "tokens/Webapp/Spacing.json",
      "tokens/Webapp/Typography.json"
    ];

    for (const filePath of tokenFiles) {
      try {
        const response = await fetch(filePath, { method: "HEAD" });
        if (response.ok) {
          const lastModified = response.headers.get("Last-Modified");
          const currentTime = new Date(lastModified).getTime();
          fileModificationTimes.set(filePath, currentTime);
        }
      } catch (error) {
        // File might not exist, ignore
      }
    }
  };

  // Initialize modification times first
  initializeModificationTimes();

  // Check for token file updates every 5 seconds (increased interval to reduce load)
  tokenWatchInterval = setInterval(async () => {
    // Only check if we're viewing webapp tokens
    const webappSection = document.getElementById("webapp");
    if (!webappSection || !webappSection.classList.contains("active")) {
      return;
    }

    const tokenFiles = [
      "tokens/Webapp/Color/Light.json",
      "tokens/Webapp/Color/Dark.json",
      "tokens/Webapp/Spacing.json",
      "tokens/Webapp/Typography.json"
    ];

    let hasChanges = false;

    for (const filePath of tokenFiles) {
      try {
        const response = await fetch(filePath, { method: "HEAD" });
        if (response.ok) {
          const lastModified = response.headers.get("Last-Modified");
          if (lastModified) {
            const currentTime = new Date(lastModified).getTime();
            const storedTime = fileModificationTimes.get(filePath);

            // Only trigger if we have a stored time AND the current time is significantly newer (more than 1 second)
            if (storedTime && currentTime > storedTime + 1000) {
              hasChanges = true;
              console.log(`🔄 Token file changed: ${filePath}, old: ${new Date(storedTime)}, new: ${new Date(currentTime)}`);
              fileModificationTimes.set(filePath, currentTime);
            } else if (!storedTime) {
              // First time seeing this file, just store the time
              fileModificationTimes.set(filePath, currentTime);
            }
          }
        }
      } catch (error) {
        // File might not exist, ignore
      }
    }

    if (hasChanges) {
      console.log("🔄 Detected token changes, refreshing webapp tokens...");
      await loadWebTokens();
    }
  }, 5000);
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  updateThemeButton();
  loadSectionContent("core");

  // Start token watching with improved logic to prevent refresh loops
  setTimeout(() => {
    startTokenWatching();
  }, 2000); // Delay start to allow initial load to complete

  // Force reload webapp tokens to ensure action tokens are loaded
  setTimeout(() => {
    loadWebTokens();
  }, 1000);
});
