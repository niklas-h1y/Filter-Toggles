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

const FILTERS = Object.keys(DEFAULT_FILTERS);
const warmPreset = {
  ...DEFAULT_FILTERS,
  contrast: 105,
  hue: 350,
  sepia: 25,
  saturate: 120
};

function updateLabel(id, value) {
  const label = document.getElementById(`val-${id}`);
  if (!label) return;
  label.textContent = id === "hue"
    ? `${value}°`
    : (id === "blur" || id === "shadow" ? `${value} px` : `${value}%`);
}

function readControls() {
  return Object.fromEntries(
    FILTERS.map((id) => [id, Number(document.getElementById(id).value)])
  );
}

function renderControls(values) {
  FILTERS.forEach((id) => {
    const input = document.getElementById(id);
    input.value = values[id] ?? DEFAULT_FILTERS[id];
    updateLabel(id, input.value);
  });
}

function applyToActiveTab(filters) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs?.[0]?.id) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "UPDATE_FILTERS", filters },
      () => {
        // Restricted browser pages (for example chrome:// pages) do not accept content scripts.
        void chrome.runtime.lastError;
      }
    );
  });
}

function saveAndApply() {
  const data = readControls();
  chrome.storage.local.set(data, () => {
    if (chrome.runtime.lastError) return;
    applyToActiveTab(data);
  });
}

chrome.storage.local.get(DEFAULT_FILTERS, (saved) => {
  if (chrome.runtime.lastError) return;
  const values = { ...DEFAULT_FILTERS, ...saved };
  renderControls(values);

  FILTERS.forEach((id) => {
    document.getElementById(id).addEventListener("input", (event) => {
      updateLabel(id, event.target.value);
      saveAndApply();
    });
  });
});

document.getElementById("reset-btn").addEventListener("click", () => {
  chrome.storage.local.set(DEFAULT_FILTERS, () => {
    if (chrome.runtime.lastError) return;
    renderControls(DEFAULT_FILTERS);
    applyToActiveTab(DEFAULT_FILTERS);
  });
});

document.getElementById("preset-warm").addEventListener("click", () => {
  chrome.storage.local.set(warmPreset, () => {
    if (chrome.runtime.lastError) return;
    renderControls(warmPreset);
    applyToActiveTab(warmPreset);
  });
});
