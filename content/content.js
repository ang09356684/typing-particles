// content.js — Entry point: event listening and input detection

(function () {
  'use strict';

  const EFFECTS = {
    burst: BurstEffect,
    echo: EchoEffect,
    vortex: VortexEffect,
    sparkle: SparkleEffect,
    firefly: FireflyEffect,
    confetti: ConfettiEffect,
    bubble: BubbleEffect,
    frost: FrostEffect,
    flame: FlameEffect,
    ripple: RippleEffect,
    electric: ElectricEffect,
    diffuse: DiffuseEffect
  };

  let settings = {
    enabled: true,
    effect: 'burst',
    intensity: 0.5
  };

  let _lastInputTime = 0;
  let _composing = false;

  function _detectIsDarkBg(el) {
    let current = el;
    while (current && current !== document.documentElement) {
      const bg = window.getComputedStyle(current).backgroundColor;
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m) {
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        if (a < 0.1) { current = current.parentElement; continue; }
        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
        return lum < 0.5;
      }
      current = current.parentElement;
    }
    return false;
  }

  // --- Initialization ---
  function init() {
    CanvasManager.init(true); // Use shadow DOM
    ParticleEngine.init(CanvasManager, 300);
    ParticleEngine.setEffect(EFFECTS[settings.effect]);

    // Load settings via bridge
    SettingsBridge.init((updated) => {
      Object.assign(settings, updated);

      if (settings.enabled) {
        ParticleEngine.setEffect(EFFECTS[settings.effect] || EFFECTS.burst);
      } else {
        ParticleEngine.clear();
      }
    });

    // Listen for input events in capture phase
    document.addEventListener('input', _onInput, true);

    // IME composition handling
    document.addEventListener('compositionstart', () => { _composing = true; }, true);
    document.addEventListener('compositionend', (e) => {
      _composing = false;
      // Trigger a burst for the composed text
      _onInput(e);
    }, true);
  }

  function _onInput(e) {
    if (!settings.enabled) return;
    if (_composing) return;

    // Throttle to ~1 per frame
    const now = performance.now();
    if (now - _lastInputTime < 16) return;
    _lastInputTime = now;

    // Find the actual target (handle shadow DOM)
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (!target) return;

    const pos = CaretDetector.detect(target);
    if (!pos) return;

    const isDarkBg = _detectIsDarkBg(target);
    let context = { isDarkBg };
    const char = e.data;
    if (char) {
      const cs = window.getComputedStyle(target);
      context.char = char.slice(-1);
      context.fontFamily = cs.fontFamily;
      context.fontSize = parseFloat(cs.fontSize) || 16;
      context.fontWeight = cs.fontWeight || '400';
    }

    ParticleEngine.spawn(pos.x, pos.y, settings.intensity, context);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
