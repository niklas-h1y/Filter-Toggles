const filters = ['grayscale', 'contrast', 'invert', 'hue', 'sepia', 'saturate', 'brightness'];

// Load saved settings
chrome.storage.local.get(filters, (result) => {
  filters.forEach(f => {
    const input = document.getElementById(f);
    if (result[f] !== undefined) {
      input.value = result[f];
    }
    updateLabel(f, input.value);
    input.addEventListener('input', (e) => {
      updateLabel(f, e.target.value);
      saveAndApply();
    });
  });
});

function updateLabel(id, val) {
  const label = document.getElementById(`val-${id}`);
  if (id === 'hue') {
    label.innerText = `${val}°`;
  } else {
    label.innerText = `${val}%`;
  }
}

function saveAndApply() {
  const data = {};
  filters.forEach(f => {
    data[f] = document.getElementById(f).value;
  });
  
  chrome.storage.local.set(data, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_FILTERS', filters: data });
      }
    });
  });
}

document.getElementById('reset-btn').addEventListener('click', () => {
  const defaults = { grayscale: 0, contrast: 100, invert: 0, hue: 0, sepia: 0, saturate: 100, brightness: 100 };
  chrome.storage.local.set(defaults, () => {
    filters.forEach(f => {
      const input = document.getElementById(f);
      input.value = defaults[f];
      updateLabel(f, defaults[f]);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_FILTERS', filters: defaults });
      }
    });
  });
});

document.getElementById('preset-warm').addEventListener('click', () => {
  const preset = { grayscale: 0, contrast: 90, invert: 100, hue: 180, sepia: 40, saturate: 100, brightness: 100 };
  chrome.storage.local.set(preset, () => {
    filters.forEach(f => {
      const input = document.getElementById(f);
      input.value = preset[f];
      updateLabel(f, preset[f]);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_FILTERS', filters: preset });
      }
    });
  });
});
