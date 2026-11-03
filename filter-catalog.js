// Shared catalog for the popup and content script. Entries are classified by how CSS/SVG uses them.
globalThis.FILTER_MATRIX_CATALOG = {
  propertyModes: ["none","inherit","initial","revert","revert-layer","unset","url"],
  groups: [
    { name:"Creative effects", items:["vignette","scanlines","crt-curvature","rgb-split","flicker","noise","chromatic-aberration","scanline-bleed","bloom","phosphor-glow","halation","grid-overlay","bad-signal","screen-tear","dithering","pixelate","acid-trip","solarize","duotone","tritone","technicolor","sepia-high-contrast","sepia-low-contrast","vintage-polaroid","cross-process","lomo","bleach-bypass","kodachrome","fujichrome","infrared","thermal","night-vision","gameboy","cga-palette","cyber-punk","neon-glow","edge-detection","emboss","sharpen","posterize","high-pass","low-pass","ascii-art","dot-matrix","comic-book","sketch","oil-painting","watercolor","crosshatch","stipple"] },
    { name:"CSS styling effects", items:["text-shadow","box-shadow","mix-blend-mode","backdrop-filter"] },
    { name:"SVG filter primitives", items:["feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"] }
  ]
};
