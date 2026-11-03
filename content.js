const DEFAULT_FILTERS = {
  grayscale: 0,
  contrast: 100,
  invert: 0,
  hue: 0,
  sepia: 0,
  saturate: 100,
  brightness: 100,
  blur: 0,
  opacity: 100,
  shadow: 0
};

let styleEl;
let pendingFilters = DEFAULT_FILTERS;

function ensureStyleElement() {
  if (styleEl?.isConnected) return styleEl;
  if (!document.documentElement) return null;

  styleEl = document.getElementById("matrix-filter-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "matrix-filter-style";
    (document.head || document.documentElement).appendChild(styleEl);
  }
  return styleEl;
}

function normalizeFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_FILTERS).map(([key, fallback]) => {
      const value = Number(filters[key]);
      return [key, Number.isFinite(value) ? value : fallback];
    })
  );
}

function applyFilters(filters) {
  pendingFilters = normalizeFilters(filters);
  const target = ensureStyleElement();
  if (!target) return;

  const f = pendingFilters;
  target.textContent = `
    html {
      filter:
        grayscale(${f.grayscale}%)
        contrast(${f.contrast}%)
        invert(${f.invert}%)
        hue-rotate(${f.hue}deg)
        sepia(${f.sepia}%)
        saturate(${f.saturate}%)
        brightness(${f.brightness}%)
        blur(${f.blur}px)
        opacity(${f.opacity}%)
        drop-shadow(0 0 ${f.shadow}px rgba(0, 0, 0, 0.65)) !important;
    }
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!styleEl?.isConnected) applyFilters(pendingFilters);
}, { once: true });

chrome.storage.local.get(DEFAULT_FILTERS, applyFilters);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  const changed = Object.keys(DEFAULT_FILTERS).some((key) => key in changes);
  if (changed) chrome.storage.local.get(DEFAULT_FILTERS, applyFilters);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "UPDATE_FILTERS") return;
  applyFilters(message.filters);
  sendResponse?.({ success: true });
});
