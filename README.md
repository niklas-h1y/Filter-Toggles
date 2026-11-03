# Filter Toggles

A lightweight Chrome extension for adjusting CSS visual filters on webpages.

## Filters

**Color & light**
- Grayscale, contrast, invert, hue rotation, sepia, saturation, and brightness.

**Effects**
- Blur, opacity, and drop shadow.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project folder.
5. Open a webpage and use the extension popup to adjust its filters.

Filter values are saved with `chrome.storage.local` and restored when pages load. Use **Warm** for a warm color treatment or **Reset** to restore defaults.

Some browser-internal pages and other restricted URLs do not allow extensions to inject content scripts; filters cannot be applied on those pages.
