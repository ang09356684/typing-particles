// prototype.js — Prototype controller (runs outside of extension context)

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

  let currentEffect = 'burst';
  let intensity = 0.5;
  let enabled = true;
  let composing = false;
  let lastInputTime = 0;

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
    return false; // default: assume light bg
  }

  // --- Init ---
  CanvasManager.init(false); // No shadow DOM in prototype
  ParticleEngine.init(CanvasManager, 300);
  ParticleEngine.setEffect(EFFECTS[currentEffect]);

  // --- Event listening ---
  document.addEventListener('input', onInput, true);
  document.addEventListener('compositionstart', () => { composing = true; }, true);
  document.addEventListener('compositionend', (e) => {
    composing = false;
    onInput(e);
  }, true);

  function onInput(e) {
    if (!enabled) return;
    if (composing) return;

    const now = performance.now();
    if (now - lastInputTime < 16) return;
    lastInputTime = now;

    const target = e.target;
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

    ParticleEngine.spawn(pos.x, pos.y, intensity, context);
  }

  // --- Control panel ---
  const ctrlEnabled = document.getElementById('ctrl-enabled');
  const ctrlEffects = document.getElementById('ctrl-effects');
  const ctrlIntensity = document.getElementById('ctrl-intensity');
  const ctrlIntensityVal = document.getElementById('ctrl-intensity-val');
  const statParticles = document.getElementById('stat-particles');

  ctrlEnabled.addEventListener('change', () => {
    enabled = ctrlEnabled.checked;
    if (!enabled) ParticleEngine.clear();
  });

  ctrlEffects.addEventListener('click', (e) => {
    const btn = e.target.closest('.effect-card');
    if (!btn) return;
    currentEffect = btn.dataset.effect;
    ParticleEngine.setEffect(EFFECTS[currentEffect]);
    document.querySelectorAll('.effect-card').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  });

  ctrlIntensity.addEventListener('input', () => {
    intensity = parseFloat(ctrlIntensity.value);
    ctrlIntensityVal.textContent = intensity.toFixed(2);
  });

  // Stats update
  setInterval(() => {
    statParticles.textContent = ParticleEngine.getActiveCount();
  }, 100);
})();
