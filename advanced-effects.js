// Advanced CSS/SVG filter renderer. The named artistic looks are practical browser approximations.
(function () {
  if (globalThis.__filterMatrixAdvancedLoaded) return;
  globalThis.__filterMatrixAdvancedLoaded = true;
  const DEFAULTS = { grayscale:0, contrast:100, invert:0, hue:0, sepia:0, saturate:100, brightness:100, blur:0, opacity:100, shadow:0, temperature:0, blueLight:0, vignette:0, grain:0, tintStrength:0, tintColor:"#ff9a5c", filterMode:"auto", advancedEffects:[] };
  const SVG_NS = "http://www.w3.org/2000/svg";
  function ensureNode(id, tag, parent) {
    let node = document.getElementById(id);
    if (!node) { node = document.createElement(tag); node.id = id; (parent || document.documentElement).appendChild(node); }
    return node;
  }
  function makeSvg(selected) {
    const selectedSet = new Set(selected);
    const has = name => selectedSet.has(name);
    const bits = [];
    if (has("feColorMatrix")) bits.push('<feColorMatrix type="saturate" values="1.3"/>');
    if (has("feComponentTransfer") || ["feFuncR","feFuncG","feFuncB","feFuncA"].some(has)) bits.push('<feComponentTransfer><feFuncR type="gamma" amplitude="1.1" exponent=".9" offset="0"/><feFuncG type="gamma" amplitude="1.1" exponent=".9" offset="0"/><feFuncB type="gamma" amplitude="1.1" exponent=".9" offset="0"/><feFuncA type="identity"/></feComponentTransfer>');
    if (has("feComposite")) bits.push('<feComposite in="SourceGraphic" in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3=".08" k4="0"/>');
    if (has("feConvolveMatrix")) bits.push('<feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"/>');
    if (has("feDiffuseLighting") || has("feDistantLight") || has("fePointLight") || has("feSpotLight")) bits.push('<feDiffuseLighting surfaceScale="2" diffuseConstant="1"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>');
    if (has("feSpecularLighting")) bits.push('<feSpecularLighting surfaceScale="2" specularConstant=".6" specularExponent="18"><fePointLight x="80" y="40" z="120"/></feSpecularLighting>');
    if (has("feDisplacementMap")) bits.push('<feTurbulence baseFrequency=".015" numOctaves="2" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>');
    if (has("feDropShadow")) bits.push('<feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity=".55"/>');
    if (has("feFlood")) bits.push('<feFlood flood-color="#8b7cff" flood-opacity=".12"/><feComposite in2="SourceGraphic" operator="in"/>');
    if (has("feGaussianBlur")) bits.push('<feGaussianBlur stdDeviation="1.2"/>');
    if (has("feMorphology")) bits.push('<feMorphology operator="dilate" radius="1"/>');
    if (has("feOffset")) bits.push('<feOffset dx="1" dy="1"/>');
    if (has("feTile")) bits.push('<feTile/>');
    if (has("feTurbulence")) bits.push('<feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2"/>');
    if (has("feMerge") || has("feMergeNode")) bits.push('<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="SourceGraphic"/></feMerge>');
    if (has("feImage")) bits.push('<feImage href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E" preserveAspectRatio="none"/>');
    if (!bits.length) bits.push('<feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/>');
    const svg = ensureNode("matrix-advanced-svg", "svg", document.body || document.documentElement);
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    svg.innerHTML = '<defs><filter id="matrix-svg-effects" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' + bits.join("") + '</filter></defs>';
  }
  function render(settings) {
    if (!document.documentElement) return;
    const f = { ...DEFAULTS, ...settings };
    const selected = Array.isArray(f.advancedEffects) ? f.advancedEffects : [];
    const active = new Set(selected);
    makeSvg(selected);
    const base = [
      'grayscale(' + f.grayscale + '%)', 'contrast(' + f.contrast + '%)', 'invert(' + f.invert + '%)',
      'hue-rotate(' + f.hue + 'deg)', 'sepia(' + Math.min(100, f.sepia + f.temperature * .45) + '%)',
      'saturate(' + f.saturate + '%)', 'brightness(' + f.brightness + '%)', 'blur(' + f.blur + 'px)',
      'opacity(' + f.opacity + '%)', 'drop-shadow(0 0 ' + f.shadow + 'px rgba(0,0,0,.65))'
    ];
    const artistic = [];
    const add = (names, value) => { if (names.some(n => active.has(n))) artistic.push(value); };
    add(["solarize","infrared","thermal"], "hue-rotate(145deg) saturate(180%)");
    add(["acid-trip"], "hue-rotate(95deg) saturate(220%)");
    add(["duotone","tritone","technicolor"], "grayscale(65%) sepia(35%) saturate(180%)");
    add(["night-vision","gameboy"], "grayscale(100%) sepia(100%) hue-rotate(55deg) saturate(220%)");
    add(["posterize","comic-book","cga-palette"], "contrast(180%) saturate(150%)");
    add(["emboss"], "contrast(150%)");
    add(["sharpen","high-pass"], "contrast(125%)");
    add(["low-pass"], "blur(.6px)");
    add(["bleach-bypass"], "grayscale(35%) contrast(145%) saturate(70%)");
    add(["sepia-high-contrast"], "sepia(100%) contrast(150%)");
    add(["sepia-low-contrast"], "sepia(75%) contrast(80%)");
    add(["vintage-polaroid","kodachrome","fujichrome","cross-process","lomo"], "sepia(18%) saturate(135%) contrast(110%)");
    add(["edge-detection","sketch","ascii-art","crosshatch","oil-painting","watercolor"], "grayscale(100%) contrast(165%)");
    add(["infrared"], "hue-rotate(210deg) saturate(180%)");
    let filter = base.concat(artistic).join(" ");
    if (f.filterMode === "auto") filter += " url(#matrix-svg-effects)";
    else if (f.filterMode === "url") filter = "url(#matrix-svg-effects)";
    else if (["none","inherit","initial","revert","revert-layer","unset"].includes(f.filterMode)) filter = f.filterMode;
    document.documentElement.style.setProperty("filter", filter, "important");
    const overlay = ensureNode("matrix-advanced-overlay", "div");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none;overflow:hidden";
    const layers = [];
    if (["scanlines","scanline-bleed","bad-signal","crt-curvature"].some(n => active.has(n))) layers.push("repeating-linear-gradient(transparent 0 3px,rgba(0,0,0,.22) 4px)");
    if (active.has("grid-overlay")) { layers.push("linear-gradient(rgba(100,220,255,.12) 1px,transparent 1px)"); layers.push("linear-gradient(90deg,rgba(100,220,255,.12) 1px,transparent 1px)"); }
    if (["noise","dithering","stipple","film-grain"].some(n => active.has(n))) layers.push("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E\")");
    if (["rgb-split","chromatic-aberration"].some(n => active.has(n))) layers.push("linear-gradient(90deg,rgba(255,0,0,.08),transparent 35%,rgba(0,180,255,.08))");
    if (["screen-tear","bad-signal","flicker"].some(n => active.has(n))) layers.push("repeating-linear-gradient(0deg,transparent 0 22px,rgba(255,255,255,.08) 23px 25px,transparent 26px 48px)");
    if (active.has("crt-curvature")) layers.push("radial-gradient(ellipse,transparent 68%,rgba(0,0,0,.35) 100%)");
    if (["bloom","phosphor-glow","neon-glow"].some(n => active.has(n))) layers.push("radial-gradient(ellipse at center,rgba(130,220,255,.12),transparent 65%)");
    if (active.has("halation")) layers.push("radial-gradient(ellipse at center,rgba(255,90,55,.13),transparent 70%)");
    if (["pixelate","dot-matrix","cga-palette"].some(n => active.has(n))) layers.push("radial-gradient(rgba(0,0,0,.22) 1px,transparent 1.5px)");
    if (active.has("vignette")) layers.push("radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.45) 115%)");
    overlay.style.backgroundImage = layers.length ? layers.join(",") : "none";
    overlay.style.backgroundSize = active.has("grid-overlay") ? "22px 22px,22px 22px" : (active.has("pixelate") || active.has("dot-matrix") ? "5px 5px" : "auto");
    overlay.style.boxShadow = active.has("crt-curvature") ? "inset 0 0 55px rgba(0,0,0,.5)" : "none";
    overlay.style.mixBlendMode = active.has("mix-blend-mode") ? "screen" : "normal";
    overlay.style.backdropFilter = active.has("backdrop-filter") ? "blur(2px)" : "none";
    const extra = ensureNode("matrix-advanced-style", "style");
    const rules = [];
    if (active.has("text-shadow")) rules.push("html body,html body *{text-shadow:0 1px 2px rgba(0,0,0,.65)!important}");
    if (active.has("box-shadow")) rules.push("html body *{box-shadow:0 1px 5px rgba(0,0,0,.24)!important}");
    if (active.has("crt-curvature")) rules.push("html body{border-radius:2.5% / 1.5%;overflow:hidden}");
    if (active.has("flicker")) rules.push("@keyframes matrixFlicker{0%,96%,98%,100%{opacity:1}97%,99%{opacity:.88}}#matrix-advanced-overlay{animation:matrixFlicker .16s infinite}");
    extra.textContent = rules.join("\n");
  }
  function load() {
    chrome.storage.local.get(DEFAULTS, settings => {
      if (chrome.runtime.lastError) return;
      setTimeout(() => render(settings), 80);
    });
  }
  load();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && Object.keys(DEFAULTS).some(k => k in changes)) load();
  });
})();
