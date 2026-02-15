# Typing Particles

A Chrome Extension that displays real-time particle effect animations when users type in any text input field on any webpage. It offers 12 visual styles to switch between, supports multiple languages (English / Traditional Chinese / Simplified Chinese / Japanese / Korean / Spanish), and all settings are configured through a Popup panel with instant effect.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Installation & Testing](#installation--testing)
3. [File Structure](#file-structure)
4. [Architecture Design](#architecture-design)
   - [Overall Data Flow](#overall-data-flow)
   - [Rendering Layer: Full-Screen Canvas Overlay](#rendering-layer-full-screen-canvas-overlay)
   - [Caret Position Detection](#caret-position-detection)
   - [Particle Engine: Object Pool Pattern](#particle-engine-object-pool-pattern)
   - [Event Listening Strategy](#event-listening-strategy)
   - [Settings Synchronization Mechanism](#settings-synchronization-mechanism)
5. [Implementation & Algorithms of the Twelve Effects](#implementation--algorithms-of-the-twelve-effects)
   - [Effect 1: 💥 Burst](#effect-1--burst)
   - [Effect 2: 🔤 Text Echo](#effect-2--text-echo)
   - [Effect 3: 💫 Vortex](#effect-3--vortex)
   - [Effect 4: ⭐ Sparkle](#effect-4--sparkle)
   - [Effect 5: ✨ Firefly](#effect-5--firefly)
   - [Effect 6: 🎊 Confetti](#effect-6--confetti)
   - [Effect 7: 🫧 Bubble](#effect-7--bubble)
   - [Effect 8: ❄️ Frost](#effect-8--frost)
   - [Effect 9: 🔥 Flame](#effect-9--flame)
   - [Effect 10: 🌊 Ripple](#effect-10--ripple)
   - [Effect 11: ⚡ Electric](#effect-11--electric)
   - [Effect 12: 🌀 Diffuse](#effect-12--diffuse)
6. [Effect Interface Specification & Extension Guide](#effect-interface-specification--extension-guide)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Performance Design](#performance-design)
9. [Known Limitations](#known-limitations)

---

## Feature Overview

| Feature | Description |
|---|---|
| Twelve particle effects | Burst / Text Echo / Vortex / Sparkle / Firefly / Confetti / Bubble / Frost / Flame / Ripple / Electric / Diffuse |
| Real-time switching | Select via Popup panel, no page reload required |
| Intensity control | Slider 0.1 – 1.0 to control particle count multiplier |
| Global toggle | One-click enable or disable all effects |
| Multi-language support | Supports English / Traditional Chinese / Simplified Chinese / Japanese / Korean / Spanish, auto-detects browser locale |
| Cross-device sync | Settings stored in `chrome.storage.sync` |
| Supports all input fields | `<input>` / `<textarea>` / `contenteditable` |
| Privacy protection | Automatically skips `<input type="password">` |
| IME support | Suppressed during composition, triggered on input confirmation |
| iframe support | `all_frames: true`, input fields within child frames also work |
| Zero interference | Canvas layer uses `pointer-events: none`, does not affect any page interaction |

---

## Installation & Testing

### Method 1: Load in Developer Mode (Recommended for Testing)

1. Open Chrome, enter `chrome://extensions/` in the address bar
2. Enable "**Developer mode**" in the top-right corner
3. Click "**Load unpacked**" in the top-left corner
4. Select the `typing-particles/` **root directory** (the folder containing `manifest.json`)
5. The extension appearing as "Typing Particles" in the extensions list confirms successful loading
6. Open any webpage (e.g., Google Search, GitHub, Gmail), type in an input field to see the particle effects
7. Click the extension icon in the top-right of the browser to open the Popup panel for switching effects and adjusting intensity

### Method 2: Use the Prototype Page (For Quick Visual Verification Only)

1. Open `typing-particles/prototype/index.html` in a browser
2. The page includes four built-in input types: text input, textarea, contenteditable, and password
3. The top control panel allows switching effects, adjusting intensity, and viewing active particle count
4. This prototype runs locally and does not depend on the Chrome Extension API

### Testing Checklist

- [ ] Type in `<input type="text">`, particles appear near the caret
- [ ] Type in `<textarea>` with multiline text, particles follow the caret across line breaks
- [ ] Type in a `contenteditable` area, particles display correctly
- [ ] Type in `<input type="password">`, particles do **not** appear (privacy protection)
- [ ] Switch between the twelve effects via Popup, effects change instantly
- [ ] Adjust the intensity slider, particle count changes accordingly
- [ ] Turn off the effect toggle, particles stop immediately and disappear
- [ ] No stuttering during rapid typing (confirm no dropped frames in the Performance panel)
- [ ] On pages with iframes (e.g., CodePen), input fields within iframes also show effects
- [ ] Using IME input methods such as Zhuyin/Pinyin: no particles during composition, triggered after pressing Enter to confirm

---

## File Structure

```
typing-particles/
├── manifest.json                # Manifest V3 configuration
├── _locales/                    # Multi-language translation files
│   ├── en/messages.json         # English (default)
│   ├── zh_TW/messages.json      # Traditional Chinese
│   ├── zh_CN/messages.json      # Simplified Chinese
│   ├── ja/messages.json         # Japanese
│   ├── ko/messages.json         # Korean
│   └── es/messages.json         # Spanish
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/
│   ├── popup.html               # Settings panel UI (translation points marked with data-i18n attributes)
│   ├── popup.css                # Settings panel styles (dark theme, 4×3 grid)
│   └── popup.js                 # Settings read/write logic + i18n initialization
├── content/
│   ├── content.js               # Entry point: event listeners, input detection, context assembly
│   ├── caret-detector.js        # Caret pixel position detection (mirror div + Selection API)
│   ├── canvas-manager.js        # Canvas overlay lifecycle (wrapped in Shadow DOM)
│   ├── particle-engine.js       # Particle object pool + requestAnimationFrame animation loop
│   ├── settings-bridge.js       # chrome.storage.onChanged listener bridge
│   └── effects/
│       ├── burst.js             # 💥 Burst
│       ├── echo.js              # 🔤 Text Echo
│       ├── vortex.js            # 💫 Vortex
│       ├── sparkle.js           # ⭐ Sparkle
│       ├── firefly.js           # ✨ Firefly
│       ├── confetti.js          # 🎊 Confetti
│       ├── bubble.js            # 🫧 Bubble
│       ├── frost.js             # ❄️ Frost
│       ├── flame.js             # 🔥 Flame
│       ├── ripple.js            # 🌊 Ripple
│       ├── electric.js          # ⚡ Electric
│       └── diffuse.js           # 🌀 Diffuse
├── shared/
│   └── constants.js             # Default values, effect registry
└── prototype/                   # Standalone prototype (not shipped with the Extension)
    ├── index.html
    ├── prototype.js
    └── prototype.css
```

---

## Architecture Design

### Overall Data Flow

```
User presses a key
    │
    ▼
document 'input' event (capture phase)
    │
    ├─ Throttle: at most once per 16ms
    ├─ IME filter: skip during composition
    │
    ▼
CaretDetector.detect(target)
    │
    ├─ <input>/<textarea> → Mirror Div technique
    ├─ contenteditable    → Selection/Range API
    ├─ password           → return null (skip)
    │
    ▼
Obtain caret viewport coordinates { x, y }
    │
    ▼
Assemble context { char, fontFamily, fontSize, fontWeight }
    │
    ▼
ParticleEngine.spawn(x, y, intensity, context)
    │
    ├─ Call current effect's spawn() → acquire particle from object pool
    ├─ Start requestAnimationFrame loop (if not already running)
    │
    ▼
Per-frame loop:
    ├─ CanvasManager.clear()
    ├─ Iterate all active particles:
    │   ├─ effect.update(p)  → update position, velocity, opacity
    │   ├─ p.life++
    │   ├─ If life >= maxLife → recycle to object pool
    │   └─ effect.render(ctx, p) → draw to Canvas
    └─ Particles reach zero → stop loop + hide Canvas
```

### Rendering Layer: Full-Screen Canvas Overlay

**File**: `content/canvas-manager.js`

```
┌─────────────────────────────────────┐
│ document.documentElement            │
│  ┌──────────────────────────────┐   │
│  │ Shadow Host (div)            │   │
│  │ position: fixed              │   │
│  │ z-index: 2147483647          │   │
│  │ pointer-events: none         │   │
│  │  ┌── closed Shadow DOM ──┐  │   │
│  │  │                       │  │   │
│  │  │  <canvas>             │  │   │
│  │  │  100vw × 100vh        │  │   │
│  │  │  display: none/block  │  │   │
│  │  │                       │  │   │
│  │  └───────────────────────┘  │   │
│  └──────────────────────────────┘   │
│                                     │
│  [Original page DOM]                │
└─────────────────────────────────────┘
```

Key design points:

- **Closed Shadow DOM**: The Canvas is wrapped in a closed shadow root, fully isolated and unaffected by page CSS (e.g., `canvas { display: none !important }`)
- **`pointer-events: none`**: All mouse events pass through to the underlying page, completely transparent to the user
- **`z-index: 2147483647`**: Maximum 32-bit integer value, ensuring particles are always on the topmost layer
- **`display: none`**: Fully hidden when no particles are present, eliminating browser compositing cost
- **`devicePixelRatio` support**: Canvas physical pixels are set to `viewport × dpr`, CSS dimensions remain at viewport size, combined with `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` to ensure particles are crisp on Retina displays
- **resize response**: Listens for `window.resize` events to adjust Canvas dimensions in real time

### Caret Position Detection

**File**: `content/caret-detector.js`

This is the **most complex part** of the entire project, because browsers do not provide a direct API to obtain the caret's pixel coordinates. Different strategies are used for different input element types:

#### Strategy 1: Mirror Div Technique (for `<input>` and `<textarea>`)

The caret position in `<input>` and `<textarea>` cannot be obtained via the Selection API, so a "mirror div" approach is used:

```
Original <input>:  "Hello World|"   (| = caret position)
                                      ↑ We need the pixel coordinates here

Approach:
1. Create a hidden <div> (mirror div), placed in the DOM but with visibility: hidden
2. Copy 23 layout-related CSS properties from the original element to the mirror div:
   - Font: fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, ...
   - Spacing: padding (top/bottom/left/right), border (top/bottom/left/right)
   - Layout: boxSizing, direction, textAlign, whiteSpace, wordWrap, tabSize
3. Set the mirror div's width and height to match the original element
4. Place text before the caret into a TextNode, and the first character after the caret into a <span> (marker element)
5. Call getBoundingClientRect() on the <span> to get its position
6. Convert the mirror div's coordinate system back to the original element's viewport coordinates
7. Subtract the original element's scrollTop / scrollLeft (to handle content scrolling)
```

```
Mirror Div structure:
┌────────────────────────────────┐
│ TextNode("Hello World")        │
│ <span>next character</span>  ← getBoundingClientRect()
│ TextNode(remaining text)       │
└────────────────────────────────┘
```

#### Strategy 2: Selection/Range API (for `contenteditable`)

The caret in `contenteditable` elements can be obtained directly via native browser APIs:

```javascript
const sel = window.getSelection();
const range = sel.getRangeAt(0).cloneRange();
range.collapse(true);  // Collapse to caret position
const rect = range.getBoundingClientRect();  // Directly get pixel coordinates
```

Edge case handling:
- **Empty contenteditable**: `getBoundingClientRect()` returns all zeros. In this case, a temporary `<span>` containing a zero-width space `\u200B` is inserted, the coordinates are obtained, then the span is immediately removed and the Selection is restored

#### Strategy 3: Skip Password Fields

When `<input type="password">` is detected, `null` is returned immediately, producing no particles, to avoid leaking information such as password length or typing rhythm.

### Particle Engine: Object Pool Pattern

**File**: `content/particle-engine.js`

#### Why Use an Object Pool?

Each keystroke generates 2-18 particle objects. If `new` is used for creation and natural GC for cleanup, rapid typing triggers frequent Minor GC pauses, causing micro-stuttering. The object pool allocates all objects at initialization, and only resets state afterwards — **zero memory allocation and zero GC pressure throughout the entire lifecycle**.

#### How the Object Pool Works

```
Initialization: pre-allocate 300 particle objects
┌─────────────────────────────────────────────┐
│ [idle] [idle] [idle] ... [idle]  ← 300      │
└─────────────────────────────────────────────┘

Keystroke spawns particles: acquire() finds the first idle object, marks it active
┌─────────────────────────────────────────────┐
│ [ACTIVE] [ACTIVE] [idle] ... [idle]         │
└─────────────────────────────────────────────┘

Particle lifetime ends: release() marks it back to idle (no deletion, no new)
┌─────────────────────────────────────────────┐
│ [idle] [ACTIVE] [idle] ... [idle]           │
└─────────────────────────────────────────────┘
```

#### Automatic Start/Stop of the Animation Loop

```
spawn() is called
    │
    ├─ activeCount > 0 and rafId === null
    │       → Start requestAnimationFrame loop
    │
    ▼
_tick() executes each frame:
    ├─ clear Canvas
    ├─ Iterate pool → update + render each active particle
    ├─ life >= maxLife → release
    │
    └─ activeCount === 0?
            ├─ Yes → cancelAnimationFrame + hide Canvas (save power)
            └─ No  → requestAnimationFrame(_tick) continue
```

#### Particle Object Structure

Each particle object contains the following fields, shared across all effects:

| Field | Type | Description |
|---|---|---|
| `active` | boolean | Whether currently in use |
| `x`, `y` | number | Viewport coordinates |
| `vx`, `vy` | number | Velocity vector (px/frame) |
| `size` | number | Base size (px) |
| `life` | number | Frames survived |
| `maxLife` | number | Maximum lifetime (frames) |
| `color` | string | CSS color value |
| `alpha` | number | Opacity 0-1 |
| `rotation` | number | Rotation angle (radians) |
| `rotationSpeed` | number | Rotation per frame |
| `scale` | number | Scale multiplier |
| `custom` | object | Effect-specific data (reset to `{}` on each acquire) |

### Event Listening Strategy

**File**: `content/content.js`

```javascript
document.addEventListener('input', _onInput, true);  // capture phase
```

Reasons for choosing the `input` event over `keydown`:

| Comparison | `keydown` | `input` |
|---|---|---|
| Modifier keys like Shift/Ctrl | Fires | Does not fire |
| Paste text | Does not fire | Fires |
| Autocomplete selection | Does not fire | Fires |
| Voice input | Does not fire | Fires |
| IME composition confirmation | Requires extra handling | Fires naturally |
| `e.data` to get input character | Not available (must check keyCode) | Available |

Using **capture phase** (third argument `true`) ensures that even if page JavaScript calls `e.stopPropagation()` in the bubble phase, we can still intercept the event.

**Throttle**: At most one event processed per 16ms, corresponding to one frame at 60fps. Excess events are discarded to prevent particle accumulation during rapid typing.

**IME Handling**:

```
compositionstart → _composing = true (composition begins, suppress particles)
    |
User selects characters in IME... (input events blocked by _composing)
    |
compositionend → _composing = false → immediately trigger one _onInput()
```

**Context Assembly**:

For effects like "Diffuse" and "Text Echo" that need to know the specific character, `content.js` assembles the context on each input event:

```javascript
context = {
  char: e.data.slice(-1),                    // Last typed character
  fontFamily: computedStyle.fontFamily,       // Input field's font
  fontSize: parseFloat(computedStyle.fontSize), // Font size (px)
  fontWeight: computedStyle.fontWeight         // Font weight
};
```

### Settings Synchronization Mechanism

```
Popup Panel                      Content Script
┌──────────┐                     ┌──────────────┐
│ User      │  chrome.storage    │ SettingsBridge│
│ switches  │ ──── .sync.set ──→ │ .onChanged   │
│ effect    │                    │  listener     │
│ adjusts   │                    │       │       │
│ intensity │                    │       ▼       │
│ on/off    │                    │  Apply new    │
└──────────┘                     │  settings     │
                                 │  switch effect│
                                 └──────────────┘
```

- **Storage**: `chrome.storage.sync` (cross-device sync, 100KB max)
- **Instant effect**: Content Script listens via `chrome.storage.onChanged`, applies changes immediately upon receiving them, no page reload needed
- **No "Save" button**: Every action in the Popup writes directly to storage

---

## Implementation & Algorithms of the Twelve Effects

### Effect 1: 💥 Burst

**File**: `content/effects/burst.js`

**Visual effect**: On each keystroke, colorful circular particles shoot outward in all directions from the caret position, with gravity and friction, resembling a mini firework.

**Algorithm**:

```
spawn (triggered on each keystroke):
  particle count = floor((6 + random()*10) × intensity)  // ~6-8 at intensity 0.5
  For each particle:
    angle = random() × 2π                    // Random direction across 360°
    speed = 2 + random() × 5                 // 2-7 px/frame
    vx = cos(angle) × speed
    vy = sin(angle) × speed
    size = 3 + random() × 5 px
    lifetime = 25-50 frames (~0.4-0.8 seconds)
    color = random pick from [gold #FFD700, orange #FF8C00, white #FFFFFF, light blue #87CEEB]

update (each frame):
    x += vx
    y += vy
    vy += 0.1                                // Gravity acceleration (downward)
    vx *= 0.98                               // Horizontal friction
    vy *= 0.98                               // Vertical friction
    alpha = 1 - (life / maxLife)             // Linear fade-out

render:
    ctx.arc(x, y, size) filled circle
```

**Physics model**: Simplified 2D projectile motion. Gravity constant of 0.1 gives particles a parabolic trajectory, friction coefficient of 0.98 prevents particles from flying too far.

### Effect 2: 🔤 Text Echo

**File**: `content/effects/echo.js`

**Visual effect**: After typing a character, 2-3 layers of **enlarged outlines of the same glyph** appear, expanding outward layer by layer like ripples and fading out.

**Algorithm**:

```
spawn:
  Use measureText to get character width → calculate character center = caret x - charWidth/2
  layers = max(2, floor(3 × intensity))
  color = random pick from [cyan, purple, gold, pink, white]

  For each layer i = 0, 1, 2:
    p.x, p.y = character center
    p.size = original fontSize
    p.custom.char = typed character
    p.custom.fontFamily = input field font
    p.custom.fontWeight = input field font weight
    p.custom.startDelay = i × 5               // First layer immediately, 5-frame interval between layers
    p.maxLife = 35-45 frames

update:
    if life < startDelay → do nothing (waiting to appear)

    active = life - startDelay
    duration = maxLife - startDelay
    progress = active / duration

    scale = 1.05 + progress × 1.5             // 1.05× → 2.55× linear scale-up

    alpha:
      progress < 0.1 → fast fade-in (0 → 0.7)
      progress ≥ 0.1 → 0.7 × (1 - t²)        // Quadratic fade-out

render:
    scaledSize = fontSize × scale
    ctx.font = "fontWeight scaledSizepx fontFamily"

    First layer: fillText (low opacity alpha×0.15)     // Soft background glow
    Second layer: strokeText (full opacity alpha)       // Clear character outline
    lineWidth = max(1, 2 - scale×0.4)                  // Thinner lines at larger scale, more elegant
```

**Key to the ripple effect**: `startDelay = i × 5` makes the three character layers appear sequentially. Visually, this creates a wave pattern expanding outward from the center.

---

### Effect 3: 💫 Vortex

**File**: `content/effects/vortex.js`

**Visual effect**: Particles spawn around the caret, spiral inward along a contracting path to the center, gradually shrinking and disappearing, like a mini black hole absorption effect.

**Algorithm**:

```
spawn:
  particle count = floor((6 + random()*8) × intensity)
  For each particle:
    initial angle = random() × 2π
    initial distance = 20 + random() × 30 px (ring distribution around caret)
    position = caret + (cos(angle)×distance, sin(angle)×distance)
    spin speed = 0.15 + random() × 0.1 rad/frame
    lifetime = 25-40 frames
    color = [purple #C084FC, light purple #A78BFA, indigo #818CF8, cyan #67E8F9, pink-purple #F0ABFC, white]

update:
    angle += spinSpeed                         // Continuous rotation
    dist *= 0.955                              // Orbit radius shrinks by 4.5% per frame
    x = centerX + cos(angle) × dist            // Spiral trajectory
    y = centerY + sin(angle) × dist
    scale = 1 - progress × 0.7                // Shrinks as it approaches center
    alpha = 1 - progress²                      // Quadratic fade-out

render:
    Outer layer: large radius circle, low opacity → glow
    Inner layer: small radius white circle → bright core
```

---

### Effect 4: ⭐ Sparkle

**File**: `content/effects/sparkle.js`

**Visual effect**: Four-pointed star particles appear around the caret, rotating, with size oscillating back and forth to create a twinkling effect, slowly drifting upward.

**Algorithm**:

```
spawn:
  particle count = floor((4 + random()*6) × intensity)
  For each particle:
    position = caret ± random()*40 px (randomly scattered near the caret)
    vy = -0.3 - random()*0.5                  // Gentle upward drift
    size = 5-11 px
    lifetime = 30-55 frames
    rotationSpeed = random() × 0.15 rad/frame
    phaseOffset = random() × 2π               // Twinkle phase (prevents synchronized twinkling)
    color = [white #FFFFFF, light yellow #FFFACD, light blue #87CEEB]

update:
    x += vx, y += vy
    rotation += rotationSpeed
    progress = life / maxLife
    scale = 0.5 + 0.5 × |sin(life × 0.3 + phaseOffset)|   // ← Core of the twinkling
    alpha = 1 - progress

render:
    Four-pointed star — 4 outer vertices + 4 inner vertices connected alternately
    Outer vertices: distance size×scale from center, every 90°
    Inner vertices: distance size×scale×0.3 from center, at 45° between outer vertices
```

**Twinkling mechanism**: `scale` uses a sine function `|sin(life × 0.3 + phaseOffset)|` to produce periodic scaling between 0.5 and 1.0. `phaseOffset` gives each particle a different twinkling rhythm, preventing all stars from enlarging/shrinking simultaneously.

**Four-pointed star rendering**: An 8-vertex polygon with outer vertices at 0°/90°/180°/270° and inner vertices at 45°/135°/225°/315°. The outer radius is 3.3× the inner radius (`0.3` ratio), creating a sharp star shape.

---

### Effect 5: ✨ Firefly

**File**: `content/effects/firefly.js`

**Visual effect**: Yellow-green light dots slowly drift out from the caret, following random wandering paths with flickering brightness, like fireflies at night.

**Algorithm**:

```
spawn:
  particle count = floor((4 + random()*6) × intensity)
  For each particle:
    position = caret ± random()*16 px (scattered)
    vy = slight upward drift (-0.3 bias)
    speed = 0.3 + random() × 0.8 (slow)
    size = 2-4 px
    lifetime = 40-70 frames (long lifetime, leisurely pace)
    color = [golden yellow #FBBF24, yellow-green #A3E635, light green #BEF264, light gold #FDE68A, tender green #D9F99D]
    flickerSpeed = 0.15 + random() × 0.15
    phase = random() × 2π (each has its own flicker rhythm)

update:
    // Wandering drift
    vx += sin(life × 0.07 + wanderPhase) × 0.04
    vy += cos(life × 0.09 + wanderPhase) × 0.03
    vx *= 0.97, vy *= 0.97

    // Brightness flickering (sine wave controlled)
    flicker = 0.5 + 0.5 × sin(life × flickerSpeed + phase)

    // Fade-in/fade-out envelope
    envelope:
      progress < 0.15 → fade in
      0.15 - 0.7     → full brightness
      > 0.7          → fade out
    alpha = flicker × envelope

render:
    Outer layer: radial gradient glow (3× radius, low opacity)
    Inner layer: white dot (0.6× radius, high opacity)
```

**Key to flickering**: `flicker × envelope` dual control. `flicker` (sine wave) produces continuous brightness oscillation, `envelope` controls the overall lifecycle fade-in/fade-out. Their product creates a natural firefly glow effect.

---

### Effect 6: 🎊 Confetti

**File**: `content/effects/confetti.js`

**Visual effect**: Colorful rectangular paper pieces shoot upward then fall under gravity, with a 3D tumbling rotation effect.

**Algorithm**:

```
spawn:
  particle count = floor((5 + random()*8) × intensity)
  For each particle:
    vx = (random()-0.5) × 5                    // Random left/right scatter
    vy = -3 - random() × 4                     // Strong upward launch
    width = 3 + random() × 4 px
    height = width × (1.5 + random())           // Rectangular shape
    lifetime = 35-55 frames (floats for a while)
    color = random pick from 8-color high-saturation palette
    rotation = random() × 2π
    rotationSpeed = (random()-0.5) × 0.3
    phase = random() × 2π (3D tumble phase)

update:
    x += vx, y += vy
    vy += 0.15                                 // Gravity (stronger than Burst)
    vx *= 0.98                                 // Air resistance
    vx += sin(life × 0.1 + phase) × 0.1       // Left-right swaying
    rotation += rotationSpeed
    alpha = 1 - progress²                      // Rapid fade-out in later phase

render:
    translate(x, y) → rotate(rotation)
    scaleX = cos(life × 0.15 + phase)          // 3D tumble
    drawWidth = width × |scaleX|               // When scaleX→0, the paper becomes a line
    fillRect(-w/2, -h/2, w, h)
```

**3D tumble effect**: `cos(life × 0.15 + phase)` makes the width oscillate between positive and negative. After taking the absolute value, the paper periodically flips from face → edge → face, simulating the 3D effect of paper tumbling in the air.

---

### Effect 7: 🫧 Bubble

**File**: `content/effects/bubble.js`

**Visual effect**: Semi-transparent colorful bubbles float upward from the caret, with glossy highlights and gentle left-right swaying, expanding and popping at the end.

**Algorithm**:

```
spawn:
  particle count = floor((4 + random()*6) × intensity)
  For each particle:
    position = caret ± 10px
    vy = -1.5 - random() × 2                   // Float upward
    size = 4-11 px
    lifetime = 30-55 frames
    color = [cyan #67E8F9, purple #A78BFA, gold #FDE68A, pink #FCA5A5, green #86EFAC, peach #F9A8D4]
    swayAmp = 0.3 + random() × 0.4

update:
    vx += sin(life × 0.12 + phase) × swayAmp × 0.1  // Swaying
    vx *= 0.96
    vy *= 0.995                                 // Very slight drag

    // Pop effect: inflate and vanish in last 15% of lifetime
    progress > 0.85:
      scale = 1 + (progress - 0.85) × 3        // Inflate
      alpha = (1 - progress) / 0.15             // Rapid fade-out
    else:
      alpha = 0.7                               // Semi-transparent

render:
    // Glass-like radial gradient
    gradient with offset center (brighter at upper-left):
      stop 0: rgba(255,255,255,0.5)             // Highlight
      stop 0.4: rgba(color, 0.25)               // Bubble main color
      stop 1: rgba(color, 0.05)                 // Transparent edge
    Circular outline stroke (rim)
    Elliptical white highlight (specular highlight)
```

---

### Effect 8: ❄️ Frost

**File**: `content/effects/frost.js`

**Visual effect**: Hexagonal/four-pointed ice crystals scatter from the caret, with branching structures and rotation, gradually shrinking and disappearing.

**Algorithm**:

```
spawn:
  particle count = floor((5 + random()*6) × intensity)
  For each particle:
    angle = random() × 2π
    speed = 1 + random() × 2.5
    size = 4-9 px
    lifetime = 25-45 frames
    color = [white #FFFFFF, ice blue #E0F2FE, light blue #BAE6FD, sky blue #7DD3FC, cyan #67E8F9]
    rotationSpeed = (random()-0.5) × 0.08
    spokes = 6 or 4 (randomly chosen hexagonal or four-pointed)

update:
    x += vx, y += vy
    vx *= 0.95, vy *= 0.95                     // Deceleration
    rotation += rotationSpeed
    scale *= 0.985                              // Gradually shrink
    alpha = 1 - progress                        // Linear fade-out

render:
    For each spoke (6 or 4):
      Draw main stem line from center outward (length = size × scale)
      Draw two branches at 60% of the stem (length = 35% of stem, ±0.5 rad angle)
    lineCap = 'round', lineWidth = 1.2
```

**Crystal shape**: Each spoke consists of one main stem + two branches. Six spokes evenly distributed form a snowflake pattern. The 4-spoke variant forms a cross crystal. Branches are at the 60% position of the stem, at angles of ±0.5 rad (~±29°), approximating real snowflake branching angles.

---

### Effect 9: 🔥 Flame

**File**: `content/effects/flame.js`

**Visual effect**: Flame particles spawn from the caret position, rising upward with left-right flickering. Color transitions from bright yellow to dark red over the lifetime, gradually shrinking and disappearing.

**Algorithm**:

```
spawn:
  particle count = floor((8 + random()*10) × intensity)
  For each particle:
    position = caret x ± 7px, y = caret y
    vy = -2.5 - random()*3.5                  // Strong upward force
    vx = ± random()*1.5                       // Initial horizontal offset
    size = 6-12 px
    lifetime = 30-55 frames

update:
    x += vx, y += vy
    vx += (random()-0.5) × 0.2               // Random horizontal flickering
    vx *= 0.95                                // Flickering damping
    size *= 0.97                              // Shrink 3% per frame
    progress = life / maxLife
    alpha = 1 - progress²                     // Quadratic fade-out (almost no fade in early phase)

    Color transitions by progress stage:
        0%  - 25%  → #FFFF80 bright yellow
        25% - 50%  → #FFA500 orange
        50% - 75%  → #FF4500 red-orange
        75% - 100% → #8B0000 dark red

render:
    Create RadialGradient (center → edge):
      stop 0: current color (solid)
      stop 1: rgba(0,0,0,0) (transparent)
    Fill circle — produces a soft glowing sphere effect
```

**Flickering algorithm**: Each frame adds a random perturbation of `[-0.1, +0.1]` to `vx`, then multiplies by a damping factor of 0.95. This creates a natural sway similar to Brownian motion, without accumulating into a unidirectional drift.

**Color evolution**: Simulates the spectral shift from the core (hottest) to the outer edge (coolest) of a flame. The discrete four-stage switching appears as a smooth gradient in fast animation.

**Radial gradient**: Each particle uses `createRadialGradient` to draw a circle that is solid at the center and transparent at the edges, producing a "glowing sphere" appearance that looks more like a real flame than a solid circle.

### Effect 10: 🌊 Ripple

**File**: `content/effects/ripple.js`

**Visual effect**: Concentric ring waves expand outward from the caret, like a water surface being touched, transitioning from light cyan to blue, with lines gradually thinning.

**Algorithm**:

```
spawn:
  particle count = floor((2 + random()*2) × intensity)  // 2-3 ripple rings
  For each particle i:
    position = caret (no offset)
    size = 2 + i × 3 (staggered initial radius)
    lifetime = 25-40 frames
    expandSpeed = 1.2 + random() × 0.8 px/frame
    delay = i × 4 frames (sequential delay for each layer)

update:
    if life < delay → alpha = 0 (waiting to appear)
    else:
      size += expandSpeed                       // Continuously expand
      alpha = 1 - activeProgress²               // Quadratic fade-out
      Color by progress: cyan #67E8F9 → blue #38BDF8 → deep blue #3B82F6

render:
    ctx.arc stroke circle (no fill)
    lineWidth = max(0.5, 2 - progress × 1.5)   // Thinner at greater distance
```

---

### Effect 11: ⚡ Electric

**File**: `content/effects/electric.js`

**Visual effect**: 2-3 random jagged lightning bolts shoot from the caret, in bright cyan-white colors, with extremely short lifetimes and arc jittering effects.

**Algorithm**:

```
spawn:
  particle count = floor((2 + random()*2) × intensity)
  For each lightning bolt:
    Generate polyline path: starting from (0,0), 5-8 segments
    Each segment length 8-15 px
    Direction = previous segment direction ± random() × 60°
    Starting angle completely random (360°)
    lifetime = 8-15 frames (extremely short)
    color = [white #FFFFFF, light cyan #67E8F9, ice cyan #A5F3FC, ice blue #E0F2FE]

update:
    No movement (lightning is instantaneous)
    alpha decays linearly and rapidly
    Each frame adds ±1px random perturbation to each path node (arc jitter)

render:
    Bottom layer: lineWidth=4, alpha×0.3, same color → glow
    Top layer: lineWidth=1.5, alpha, white → bright core
    moveTo/lineTo to draw polyline, lineCap='round', lineJoin='round'
    Randomly draw small dots at polyline nodes → sparks
```

**Jagged path generation**: Each segment's direction deviates ±60° randomly from the previous one, producing a natural zigzag shape. The random segment length of 8-15px ensures each lightning bolt is unique.

**Dual-layer rendering**: The bottom layer uses wide lines at low opacity to simulate glow diffusion, while the top layer uses thin lines at high brightness to form the lightning core. The two layers combined produce a realistic electric arc visual.

---

### Effect 12: 🌀 Diffuse

**File**: `content/effects/diffuse.js`

**Visual effect**: Particles disperse outward along the **actual contour edges** of the just-typed character. For example, typing "A" causes particles to scatter from the triangular outline of A.

**This is the most algorithmically complex of the twelve effects**, involving offscreen rendering and edge detection.

**Algorithm (three stages)**:

#### Stage 1: Offscreen Rendering to Obtain Character Pixels

```
1. Create a hidden <canvas> (offscreen), size = fontSize × 2.5
2. Set the same font as the input field (family, size, weight)
3. Use fillText to draw the character at the canvas center
4. Use measureText to get the actual character width (for positioning)
```

#### Stage 2: Edge Detection Algorithm

```
5. Call getImageData to get the entire canvas pixel array
6. Scan pixels row by row (step=2 for large fonts to speed up):
   For each pixel (x, y):
     if alpha[x,y] < 50 → skip (not part of the character)
     Check four neighbors:
       top    = alpha[x, y-1]
       bottom = alpha[x, y+1]
       left   = alpha[x-1, y]
       right  = alpha[x+1, y]
     if any neighbor alpha < 50 → this is an edge pixel! Record (x - cx, y - cy)

Result: an array of edge coordinates relative to the character center
```

```
Example: Edge detection result for character "A" (conceptual diagram)

     ·  ·
    · ·· ·
   ·  ··  ·
  · ······ ·
 ·  ·    ·  ·
·  ·      ·  ·

· = edge pixel (interior fill pixels and exterior blank pixels are excluded)
```

#### Stage 3: Particle Spawning and Animation

```
7. Uniformly sample 12-30 points from the edge pixels
8. For each sampled point:
     screen coordinates = (caret x - charWidth/2 + edge.x, caret y + edge.y)
     velocity direction = normalize(edge.x, edge.y) × (0.5 + random())
               ↑ Direction from character center to edge point = outward normal

update:
    x += vx, y += vy
    vx *= 0.97, vy *= 0.97                    // Deceleration
    scale:
      progress < 0.3 → 1 + progress×2         // First 30%: slight expansion
      progress ≥ 0.3 → (1-progress) × 1.8     // Last 70%: shrink and vanish
    alpha = (1-progress)² × 0.9                // Quadratic fade-out

render:
    RadialGradient glowing sphere, color from solid to transparent edge
    color = random [purple #A78BFA, cyan #67E8F9, gold #FDE68A, pink #F9A8D4, white #FFFFFF]
```

**Performance considerations**:
- The offscreen canvas is created only once and reused afterwards
- `getContext('2d', { willReadFrequently: true })` hints the browser to use the CPU rather than GPU backend, speeding up `getImageData`
- For large fonts (>30px), the scan step is set to 2, reducing pixel scan volume by 75%

---

## Effect Interface Specification & Extension Guide

Each effect is a standalone JavaScript object that must implement the following interface:

```javascript
const MyEffect = {
  name: 'my-effect',           // Unique identifier (corresponds to EFFECT_REGISTRY)
  label: 'My Effect',          // Display name (used in Popup UI)
  icon: '🎨',                  // Popup card icon

  /**
   * Spawn particles at caret position (x, y)
   * @param {number} x         - viewport X coordinate
   * @param {number} y         - viewport Y coordinate
   * @param {number} intensity - intensity multiplier 0.1-1.0
   * @param {Function} acquire - acquire an idle particle from the object pool, returns particle object or null
   * @param {Object|null} context - { char, fontFamily, fontSize, fontWeight }
   */
  spawn(x, y, intensity, acquire, context) { ... },

  /**
   * Update a single particle's state each frame
   * @param {Object} p - particle object
   */
  update(p) { ... },

  /**
   * Render a single particle each frame
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} p - particle object
   */
  render(ctx, p) { ... }
};
```

### Steps to Add a New Effect

1. Add a new JS file in `content/effects/` (e.g., `my-effect.js`), implementing the interface above
2. Add the name to the `EFFECT_REGISTRY` array in `shared/constants.js`
3. Add the file path to the `content_scripts.js` array in `manifest.json`
4. Add the mapping to the `EFFECTS` object in `content/content.js`
5. Add a button to the `effect-list` in `popup/popup.html` (with `data-i18n` attribute)
6. Add the translation key to all `_locales/*/messages.json` files
7. Add a button and `<script>` tag in `prototype/index.html`
8. Add the mapping to the `EFFECTS` object in `prototype/prototype.js`

---

## Internationalization (i18n)

Uses the Chrome Extension built-in `chrome.i18n` API, automatically displaying the corresponding language based on the browser locale.

### Supported Languages

| Locale Code | Language | Example (Firefly) |
|---|---|---|
| `en` | English (default) | Firefly |
| `zh_TW` | Traditional Chinese | 螢光漫舞 |
| `zh_CN` | Simplified Chinese | 萤光漫舞 |
| `ja` | Japanese | 蛍の光 |
| `ko` | Korean | 반딧불이 |
| `es` | Spanish | Luciérnaga |

### How It Works

- `name` and `description` in `manifest.json` use `__MSG_key__` placeholders, which Chrome automatically replaces with the translation for the corresponding locale
- UI text elements in `popup.html` are marked with `data-i18n="key"` attributes, defaulting to English
- On startup, `popup.js` calls `chrome.i18n.getMessage()` to replace the text content of all `data-i18n` elements one by one
- Translation files are located at `_locales/{locale_code}/messages.json`

### Steps to Add a New Language

1. Create a locale folder under `_locales/` (e.g., `_locales/fr/`)
2. Create a `messages.json` containing translations for all keys
3. No modifications to any JS or HTML code are needed

---

## Performance Design

| Design | Performance Impact |
|---|---|
| Object pool (300 particles pre-allocated) | Zero memory allocation, zero GC pressure |
| requestAnimationFrame auto start/stop | 0% CPU usage when not typing |
| Canvas `display:none` | Zero compositing cost when not typing |
| Event throttle 16ms | At most one input processed per frame |
| Offscreen canvas reuse | Diffuse effect avoids repeated creation |
| `willReadFrequently` hint | getImageData uses CPU path, faster |
| Large font pixel step ×2 | Edge detection scan volume reduced by 75% |
| Closed Shadow DOM | Page CSS cannot trigger reflow |

Typical rapid typing scenario (10 keystrokes/sec): ~100 particles rendered per frame, taking approximately 0.5-1ms, well within the 16.6ms frame budget.

---

## Known Limitations

| Limitation | Reason |
|---|---|
| Google Docs / Sheets / Slides | Uses custom Canvas rendering, does not trigger standard `input` events |
| Input fields inside Closed Shadow DOM | Browser security policy prohibits external access to closed shadow roots |
| Diffuse / Text Echo effects do not trigger on delete key | `e.data` is `null`, no character available to render |
| Some highly customized rich text editors (e.g., Monaco Editor) | May use non-standard input mechanisms |
