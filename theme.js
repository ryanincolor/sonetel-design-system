// Theme initialization script - prevents FOUC (Flash of Unstyled Content)
// This script runs immediately when parsed to apply the correct theme

(function () {
  // Load saved theme or detect system preference
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  // Apply theme immediately to prevent flash
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

// Theme toggle function - available globally
function toggleTheme() {
  const html = document.documentElement;
  const button = document.querySelector(".theme-toggle");

  const currentTheme = html.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  if (newTheme === "dark") {
    html.setAttribute("data-theme", "dark");
    button.textContent = "☀️ Light";
    localStorage.setItem("theme", "dark");
  } else {
    html.removeAttribute("data-theme");
    button.textContent = "🌙 Dark";
    localStorage.setItem("theme", "light");
  }

  // Only reload webapp tokens since core tokens never change
  const webappSection = document.getElementById("webapp");
  if (webappSection && webappSection.classList.contains("active")) {
    loadWebTokens();
  }
}

// Update button text on page load
function updateThemeButton() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  const button = document.querySelector(".theme-toggle");
  if (button) {
    if (theme === "dark") {
      button.textContent = "☀️ Light";
    } else {
      button.textContent = "🌙 Dark";
    }
  }
}
