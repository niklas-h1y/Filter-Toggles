if (!globalThis.__filterMatrixContentLoaded) {
  globalThis.__filterMatrixContentLoaded = true;

const DEFAULT_FILTERS = {
  grayscale: 0, contrast: 100, invert: 0, hue: 0, sepia: 0, saturate: 100,
  brightness: 100, blur: 0, opacity: 100, shadow: 0, temperature: 0,
  blueLight: 0, vignette: 0, grain: 0, tintStrength: 0, tintColor: "#ff9a5c"
};

let styleEl;
let overlayEl;
let pendingFilters = { ...DEFAULT_FILTERS };

function ensureElements() {
  const root = document.documentElement;
  if (!root) return false;

  if (!styleEl?.isConnected) {
    styleEl = document.getElementById("matrix-filter-style") || document.createElement("style");
    styleEl.id = "matrix-filter-style";
    if (!styleEl.isConnected) (document.head || root).appendChild(styleEl);
  }

  if (!overlayEl?.isConnected) {
    overlayEl = document.getElementById("matrix-filter-overlays") || document.createElement("div");
    overlayEl.id = "matrix-filter-overlays";
    overlayEl.setAttribute("aria-hidden", "true");
    if (!overlayEl.isConnected) {
      overlayEl.innerHTML = [
        '<div class="matrix-tint"></div>',
        '<div class="matrix-warmth"></div>',
        '<div class="matrix-blue"></div>',
        '<div class="matrix-vignette"></div>',
        '<div class="matrix-grain"></div>'
      ].join("");
      root.appendChild(overlayEl);
    }
  }
  return true;
}

function normalizeFilters(filters = {}) {
  const normalized = {};
  for (const [key, fallback] of Object.entries(DEFAULT_FILTERS)) {
    if (key === "tintColor") {
      const color = typeof filters[key] === "string" ? filters[key] : fallback;
      normalized[key] = /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
    } else {
      const value = Number(filters[key]);
      normalized[key] = Number.isFinite(value)
        ? Math.min(1000, Math.max(0, value))
        : fallback;
    }
  }
  return normalized;
}

function applyFilters(filters) {
  pendingFilters = normalizeFilters(filters);
  if (!ensureElements()) return false;

  const f = pendingFilters;
  const root = document.documentElement;
  const filterValue = [
    `grayscale(${f.grayscale}%)`,
    `contrast(${f.contrast}%)`,
    `invert(${f.invert}%)`,
    `hue-rotate(${f.hue}deg)`,
    `sepia(${Math.min(100, f.sepia + f.temperature * 0.45)}%)`,
    `saturate(${f.saturate}%)`,
    `brightness(${f.brightness}%)`,
    `blur(${f.blur}px)`,
    `opacity(${f.opacity}%)`,
    `drop-shadow(0 0 ${f.shadow}px rgba(0,0,0,.65))`
  ].join(" ");

  // Inline !important wins over ordinary stylesheet rules loaded by the site
  // after this content script starts.
  root.style.setProperty("filter", filterValue, "important");

  styleEl.textContent = `
    #matrix-filter-overlays {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      contain: strict !important;
    }
    #matrix-filter-overlays > div {
      position: absolute !important;
      inset: 0 !important;
      pointer-events: none !important;
    }
    #matrix-filter-overlays .matrix-tint {
      background: ${f.tintColor} !important;
      opacity: ${f.tintStrength / 100} !important;
      mix-blend-mode: color !important;
    }
    #matrix-filter-overlays .matrix-warmth {
      background: rgba(255,155,75,${f.temperature / 100 * 0.28}) !important;
      mix-blend-mode: soft-light !important;
    }
    #matrix-filter-overlays .matrix-blue {
      background: rgba(255,165,85,${f.blueLight / 100 * 0.38}) !important;
      mix-blend-mode: multiply !important;
    }
    #matrix-filter-overlays .matrix-vignette {
      background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${f.vignette / 100}) 115%) !important;
    }
    #matrix-filter-overlays .matrix-grain {
      opacity: ${f.grain / 100} !important;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E") !important;
      background-size: 180px 180px !important;
      mix-blend-mode: soft-light !important;
    }
  `;
  return true;
}

function loadAndApplySavedFilters() {
  chrome.storage.local.get(DEFAULT_FILTERS, (saved) => {
    if (chrome.runtime.lastError) {
      console.warn("[Filter Matrix] Could not read saved filters:", chrome.runtime.lastError.message);
      applyFilters(pendingFilters);
      return;
    }
    applyFilters({ ...DEFAULT_FILTERS, ...saved });
  });
}

if (document.documentElement) {
  loadAndApplySavedFilters();
} else {
  document.addEventListener("DOMContentLoaded", loadAndApplySavedFilters, { once: true });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (Object.keys(DEFAULT_FILTERS).some((key) => key in changes)) {
    loadAndApplySavedFilters();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "UPDATE_FILTERS") return;
  const success = applyFilters(message.filters);
  sendResponse?.({ success });
});


function ensureFilterMatrixPanel() {
  const root = document.documentElement;
  if (!root) return;
  let launcher = document.getElementById("filter-matrix-launcher");
  let frame = document.getElementById("filter-matrix-fullscreen-panel");
  if (!launcher) {
    launcher = document.createElement("button");
    launcher.id = "filter-matrix-launcher";
    launcher.type = "button";
    launcher.textContent = "◈";
    launcher.title = "Open Filter Matrix";
    launcher.setAttribute("aria-label", "Open Filter Matrix");
    launcher.style.cssText = "position:fixed!important;right:16px!important;bottom:16px!important;left:auto!important;z-index:2147483647!important;width:42px!important;height:42px!important;border:1px solid rgba(255,255,255,.3)!important;border-radius:14px!important;background:linear-gradient(135deg,#8b7cff,#41d8c7)!important;color:#07101d!important;font:700 22px/1 system-ui!important;box-shadow:0 5px 24px rgba(0,0,0,.35)!important;cursor:pointer!important;pointer-events:auto!important";
    launcher.addEventListener("click", openFilterMatrixPanel);
    root.appendChild(launcher);
  }
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "filter-matrix-fullscreen-panel";
    frame.title = "Filter Matrix full-screen controls";
    frame.src = chrome.runtime.getURL("popup.html?fullscreen=1");
    frame.allow = "clipboard-read; clipboard-write";
    frame.style.cssText = "position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;z-index:2147483647!important;background:#0b1020!important;display:none!important;pointer-events:auto!important";
    root.appendChild(frame);
  }
}
function openFilterMatrixPanel() {
  ensureFilterMatrixPanel();
  const frame = document.getElementById("filter-matrix-fullscreen-panel");
  const launcher = document.getElementById("filter-matrix-launcher");
  if (frame) frame.style.setProperty("display","block","important");
  if (launcher) launcher.style.setProperty("display","none","important");
}
function closeFilterMatrixPanel() {
  const frame = document.getElementById("filter-matrix-fullscreen-panel");
  const launcher = document.getElementById("filter-matrix-launcher");
  if (frame) frame.style.setProperty("display","none","important");
  if (launcher) launcher.style.setProperty("display","block","important");
}
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(message?.type==="FILTER_MATRIX_OPEN_PANEL"){openFilterMatrixPanel();sendResponse?.({success:true});return;}
});
window.addEventListener("message",event=>{
  const frame=document.getElementById("filter-matrix-fullscreen-panel");
  if(!frame||event.source!==frame.contentWindow)return;
  if(event.data?.type==="FILTER_MATRIX_PANEL_CLOSE"){closeFilterMatrixPanel();return;}
  if(event.data?.type==="FILTER_MATRIX_PANEL_APPLY"){applyFilters(event.data.filters);return;}
});

// Keep the control center closed on page load. The bottom-right launcher
// remains visible and opens the panel when the user chooses.
function initializeFilterMatrixPanel() {
  ensureFilterMatrixPanel();
}
if (document.documentElement) {
  initializeFilterMatrixPanel();
} else {
  document.addEventListener("DOMContentLoaded", initializeFilterMatrixPanel, { once: true });
}


}
