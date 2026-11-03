// Initialize or update the persistent style element
let styleEl = document.getElementById('matrix-filter-style');
if (!styleEl) {
  styleEl = document.createElement('style');
  styleEl.id = 'matrix-filter-style';
  document.documentElement.appendChild(styleEl);
}

// Fetch existing configurations on load
chrome.storage.local.get(['grayscale', 'contrast', 'invert', 'hue', 'sepia', 'saturate', 'brightness'], (result) => {
  if (result.contrast !== undefined) {
    applyFilters(result);
  }
});

// Listen for updates from the popup matrix UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_FILTERS') {
    applyFilters(message.filters);
  }
});

function applyFilters(f) {
  const filterString = `
    html {
      filter: 
        grayscale(${f.grayscale}%) 
        contrast(${f.contrast}%) 
        invert(${f.invert}%) 
        hue-rotate(${f.hue}deg) 
        sepia(${f.sepia}%) 
        saturate(${f.saturate}%) 
        brightness(${f.brightness}%) !important;
    }
  `;
  styleEl.textContent = filterString;
}
