// Main application functionality
// This file contains all the token browsing and UI functionality

// Navigation switching
function switchSection(sectionId, event) {
  // Hide all sections
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active"));

  // Remove active class from all nav buttons
  const navButtons = document.querySelectorAll(".nav-button");
  navButtons.forEach((button) => button.classList.remove("active"));

  // Show selected section
  document.getElementById(sectionId).classList.add("active");

  // Add active class to clicked button (if called from UI)
  if (event && event.target) {
    event.target.classList.add("active");
  } else {
    // If called programmatically, find and activate the corresponding button
    const targetButton = document.querySelector(
      `[onclick*="switchSection('${sectionId}')"]`,
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

// Copy token in current format
function copyToken(tokenName, tokenValue, isWebapp) {
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
  }

  // Copy to clipboard
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      // Show visual feedback
      showCopyFeedback(textToCopy);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showCopyFeedback(textToCopy);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
      document.body.removeChild(textArea);
    });
}

// Show copy feedback
function showCopyFeedback(copiedText) {
  // Remove any existing feedback
  const existingFeedback = document.querySelector(".copy-feedback");
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

// Update webapp token format for individual tokens
async function updateWebappTokenFormat() {
  const formatElement = document.getElementById("token-format");
  if (!formatElement) {
    console.warn("Token format dropdown not found");
    return;
  }

  const format = formatElement.value;
  const webappTokens = document.querySelectorAll(".token-formatted-output");

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

      if (!tokenName) {
        console.warn("Token element missing data-token attribute", tokenEl);
        return;
      }

      const kebabName = tokenName.replace(/\./g, "-");
      let formattedValue = "";

      switch (format) {
        case "names":
          // Hide the formatted output section for "names only"
          tokenEl.style.display = "none";
          return;
        case "css":
          formattedValue = `var(--swa-${kebabName})`;
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

      tokenEl.textContent = formattedValue;
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
  } catch (error) {
    console.error("Error loading core tokens:", error);
    document.querySelector("#core .token-grid").innerHTML =
      "<p>Error loading tokens</p>";
  }
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

// Helper function to display token categories
function displayTokenCategory(
  container,
  categoryName,
  tokens,
  defaultType,
  isWebapp = false,
  coreTokens = null,
  webappTokens = null,
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

          if (tokenType === "color") {
            let colorValue;

            if (isWebapp && coreTokens) {
              // For webapp tokens, resolve references to actual color values
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
            preview = `<div class="dimension-preview" style="width: ${width}; height: 8px; background: #007aff !important;"></div>`;
          }

          const formattedOutput = isWebapp
            ? `<div class="token-formatted-output" data-token="${fullPath}" data-value="${token.value}"></div>`
            : "";

          categoryHtml += `
            <div class="token-item${isWebapp ? " webapp-token" : ""}" onclick="copyToken('${fullPath}', '${token.value}', ${isWebapp})">
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

    // Load core tokens for reference resolution (both color and spacing)
    const coreColorResponse = await fetch("tokens/Core/Color.json");
    const coreColorTokens = await coreColorResponse.json();

    const coreSpacingResponse = await fetch("tokens/Core/Spacing.json");
    const coreSpacingTokens = await coreSpacingResponse.json();

    // Combine core tokens for reference resolution
    const coreTokens = {
      ...coreColorTokens,
      ...coreSpacingTokens,
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

    // Show message if no webapp color tokens are available
    if (!themeTokens && !webappSpacingTokens) {
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
      // Only webapp spacing tokens available
      if (webappSpacingTokens) {
        const message = document.createElement("div");
        message.innerHTML = `
          <p style="text-align: center; color: var(--swa-on-surface-seconday); margin-bottom: 24px; font-style: italic;">
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
  // iOS section shows empty state by default
}

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
      path: "dist/web/tokens.scss",
      type: "SCSS",
      description: "Sass Variables",
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
      path: "dist/ios/SonetelTokens.swift",
      type: "Swift",
      description: "iOS Swift Constants",
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
        fileCard.onclick = () => showFileContent(file.path, fileName);

        fileCard.innerHTML = `
          <div class="token-header">
            <div class="token-name">${fileName}</div>
            <div class="token-type">${file.type}</div>
          </div>
          <div class="token-value">
            <div class="value-text">${file.description}</div>
          </div>
          <div class="copy-indicator">👁️ View</div>
        `;

        grid.appendChild(fileCard);
      }
    } catch (error) {
      console.log(`File ${file.path} not available`);
    }
  }
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

// View token files
function viewTokenFiles() {
  switchSection("outputs");
  document
    .querySelector("[onclick=\"switchSection('outputs')\"]")
    .classList.add("active");
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  updateThemeButton();
  loadSectionContent("core");
});
