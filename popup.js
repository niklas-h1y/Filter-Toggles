const DEFAULT_FILTERS = {
  grayscale: 0, contrast: 100, invert: 0, hue: 0, sepia: 0, saturate: 100,
  brightness: 100, blur: 0, opacity: 100, shadow: 0, temperature: 0,
  blueLight: 0, vignette: 0, grain: 0, tintStrength: 0, tintColor: "#ff9a5c"
};
const RANGE_FILTERS = Object.keys(DEFAULT_FILTERS).filter((key) => key !== "tintColor");
const PRESETS = {
  original: { ...DEFAULT_FILTERS },
  warm: { ...DEFAULT_FILTERS, temperature: 35, sepia: 18, saturate: 112, contrast: 105 },
  night: { ...DEFAULT_FILTERS, brightness: 78, contrast: 112, blueLight: 75, temperature: 22, vignette: 18 },
  mono: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 118, vignette: 24 },
  cinema: { ...DEFAULT_FILTERS, contrast: 128, saturate: 118, vignette: 35, grain: 12, shadow: 2 },
  soft: { ...DEFAULT_FILTERS, brightness: 108, contrast: 88, saturate: 88, temperature: 12 }
};

const statusEl = document.getElementById("status");
function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}
function formatValue(id, value) {
  if (id === "hue") return `${value}°`;
  if (id === "blur" || id === "shadow") return `${value} px`;
  return `${value}%`;
}
function renderControls(values) {
  RANGE_FILTERS.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.value = values[id] ?? DEFAULT_FILTERS[id];
    const output = document.getElementById(`val-${id}`);
    if (output) output.textContent = formatValue(id, input.value);
  });
  document.getElementById("tintColor").value = values.tintColor || DEFAULT_FILTERS.tintColor;
}
function readControls() {
  const values = { tintColor: document.getElementById("tintColor").value };
  RANGE_FILTERS.forEach((id) => {
    const input = document.getElementById(id);
    if (input) values[id] = Number(input.value);
  });
  return values;
}
function sendFilters(tabId, filters) {
  chrome.tabs.sendMessage(tabId, { type: "UPDATE_FILTERS", filters }, (response) => {
    const messageError = chrome.runtime.lastError;
    if (!messageError && response?.success) {
      setStatus("Filters applied");
      return;
    }

    // Some tabs can miss the document_start content script (for example,
    // pages that were already open when the extension was reloaded). Inject
    // it on demand, then retry the message once.
    chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
      const injectionError = chrome.runtime.lastError;
      if (injectionError) {
        setStatus("This page blocks extensions", true);
        return;
      }
      chrome.tabs.sendMessage(tabId, { type: "UPDATE_FILTERS", filters }, (retryResponse) => {
        const retryError = chrome.runtime.lastError;
        if (retryError || !retryResponse?.success) {
          setStatus("Could not apply filters on this page", true);
        } else {
          setStatus("Filters applied");
        }
      });
    });
  });
}
function applyToActiveTab(filters) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs?.[0]?.id;
    if (chrome.runtime.lastError || tabId == null) {
      setStatus("No active tab found", true);
      return;
    }
    sendFilters(tabId, filters);
  });
}
function saveAndApply() {
  const values = readControls();
  chrome.storage.local.set(values, () => {
    if (chrome.runtime.lastError) {
      setStatus("Could not save settings", true);
      return;
    }
    applyToActiveTab(values);
  });
}
function setPreset(name) {
  const values = PRESETS[name];
  if (!values) return;
  renderControls(values);
  chrome.storage.local.set(values, () => {
    if (chrome.runtime.lastError) {
      setStatus("Could not save preset", true);
      return;
    }
    applyToActiveTab(values);
  });
}
chrome.storage.local.get(DEFAULT_FILTERS, (saved) => {
  if (!chrome.runtime.lastError) renderControls({ ...DEFAULT_FILTERS, ...saved });
});
RANGE_FILTERS.forEach((id) => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener("input", (event) => {
    const output = document.getElementById(`val-${id}`);
    if (output) output.textContent = formatValue(id, event.target.value);
    saveAndApply();
  });
});
document.getElementById("tintColor").addEventListener("input", saveAndApply);
document.getElementById("apply-btn").addEventListener("click", saveAndApply);
document.getElementById("reset-btn").addEventListener("click", () => setPreset("original"));
document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => setPreset(button.dataset.preset));
});
