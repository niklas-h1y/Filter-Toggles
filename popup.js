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
function formatValue(id, value) {
  if (id === "hue") return `${value}°`;
  if (id === "blur" || id === "shadow") return `${value} px`;
  return `${value}%`;
}
function renderControls(values) {
  RANGE_FILTERS.forEach((id) => {
    const input = document.getElementById(id);
    input.value = values[id] ?? DEFAULT_FILTERS[id];
    document.getElementById(`val-${id}`).textContent = formatValue(id, input.value);
  });
  document.getElementById("tintColor").value = values.tintColor || DEFAULT_FILTERS.tintColor;
}
function readControls() {
  const values = { tintColor: document.getElementById("tintColor").value };
  RANGE_FILTERS.forEach((id) => { values[id] = Number(document.getElementById(id).value); });
  return values;
}
function applyToActiveTab(filters) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs?.[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_FILTERS", filters }, () => {
      // Restricted pages do not accept extension content-script messages.
      void chrome.runtime.lastError;
    });
  });
}
function saveAndApply() {
  const values = readControls();
  chrome.storage.local.set(values, () => {
    if (!chrome.runtime.lastError) applyToActiveTab(values);
  });
}
function setPreset(name) {
  const values = PRESETS[name];
  if (!values) return;
  renderControls(values);
  chrome.storage.local.set(values, () => {
    if (!chrome.runtime.lastError) applyToActiveTab(values);
  });
}
chrome.storage.local.get(DEFAULT_FILTERS, (saved) => {
  if (!chrome.runtime.lastError) renderControls({ ...DEFAULT_FILTERS, ...saved });
});
RANGE_FILTERS.forEach((id) => {
  document.getElementById(id).addEventListener("input", (event) => {
    document.getElementById(`val-${id}`).textContent = formatValue(id, event.target.value);
    saveAndApply();
  });
});
document.getElementById("tintColor").addEventListener("input", saveAndApply);
document.getElementById("apply-btn").addEventListener("click", saveAndApply);
document.getElementById("reset-btn").addEventListener("click", () => setPreset("original"));
document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => setPreset(button.dataset.preset));
});
