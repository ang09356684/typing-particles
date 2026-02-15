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

    // Build context with character and font info for effects that need it
    let context = null;
    const char = e.data;
    if (char) {
      const cs = window.getComputedStyle(target);
      context = {
        char: char.slice(-1),  // last character typed
        fontFamily: cs.fontFamily,
        fontSize: parseFloat(cs.fontSize) || 16,
        fontWeight: cs.fontWeight || '400'
      };
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
