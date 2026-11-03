# Filter Toggles

A lightweight Manifest V3 Chrome extension for live visual adjustments to webpages.

## Color and light
- The complete set of ten standard CSS filter functions: grayscale, contrast, invert, hue rotation, sepia, saturation, brightness, blur, opacity, and drop shadow.
- Additional warmth and blue-light reduction overlays.

## Effects and atmosphere
- Vignette, film grain, and a custom color wash with a color picker and strength control.

## Quick looks
- Original, Warm, Night, Mono, Cinema, and Soft presets.

Settings are saved locally and restored when pages load. Effects are visual only and do not change the underlying page content.

## Install locally
1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project folder.
5. Open a webpage and use the extension popup.

Some browser-internal pages and other restricted URLs do not allow extensions to inject content scripts.

## Automatic system-time schedule
- Optional toggle applies an evening preset and daytime preset automatically using the computer's local time.
- Choose both presets and local clock times (for example, set the evening switch to your usual sunset time).
- The schedule is checked every minute, applies across open tabs, and follows timezone/daylight-saving changes.
- This is a configurable clock schedule, not live astronomical sunset detection; it does not request location access.
