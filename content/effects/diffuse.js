// effects/diffuse.js — Particles emanate from character outline and expand outward

const DiffuseEffect = (() => {
  let _offscreen = null;
  let _offCtx = null;

  function _ensureOffscreen() {
    if (!_offscreen) {
      _offscreen = document.createElement('canvas');
      _offCtx = _offscreen.getContext('2d', { willReadFrequently: true });
    }
  }

  /**
   * Render `char` on an offscreen canvas and return edge pixel positions
   * relative to the character center (0,0).
   */
  function _getEdgePoints(char, fontFamily, fontSize, fontWeight) {
    _ensureOffscreen();
    const pad = 4;
    const size = Math.ceil(fontSize * 2.5) + pad * 2;
    _offscreen.width = size;
    _offscreen.height = size;

    const ctx = _offCtx;
    ctx.clearRect(0, 0, size, size);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(char, size / 2, size / 2);

    const charWidth = ctx.measureText(char).width;

    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    const edges = [];
    const thr = 50;  // alpha threshold

    // Scan every other pixel for performance on large fonts
    const step = fontSize > 30 ? 2 : 1;
    for (let y = 1; y < size - 1; y += step) {
      for (let x = 1; x < size - 1; x += step) {
        const a = d[(y * size + x) * 4 + 3];
        if (a < thr) continue;

        // Is at least one neighbour transparent? → edge pixel
        const top    = d[((y - 1) * size + x) * 4 + 3];
        const bottom = d[((y + 1) * size + x) * 4 + 3];
        const left   = d[(y * size + (x - 1)) * 4 + 3];
        const right  = d[(y * size + (x + 1)) * 4 + 3];

        if (top < thr || bottom < thr || left < thr || right < thr) {
          edges.push({ x: x - size / 2, y: y - size / 2 });
        }
      }
    }

    return { edges, charWidth };
  }

  const COLORS = ['#A78BFA', '#67E8F9', '#FDE68A', '#F9A8D4', '#FFFFFF'];

  return {
    name: 'diffuse',
    label: '擴散漸層',
    icon: '🌀',

    spawn(x, y, intensity, acquire, context) {
      if (!context || !context.char) return;

      const { char, fontFamily, fontSize, fontWeight } = context;
      const { edges, charWidth } = _getEdgePoints(char, fontFamily, fontSize, fontWeight);
      if (edges.length === 0) return;

      // Sample a subset of edge points
      const maxCount = Math.floor((12 + Math.random() * 18) * intensity);
      const count = Math.min(edges.length, maxCount);
      const sampleStep = edges.length / count;

      // Caret is after the character → character center is half a char-width to the left
      const centerX = x - charWidth * 0.5;
      const centerY = y;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      for (let i = 0; i < count; i++) {
        const p = acquire();
        if (!p) return;

        const edge = edges[Math.floor(i * sampleStep)];

        // Direction: outward from character centre
        const dx = edge.x;
        const dy = edge.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 0.5 + Math.random() * 1.0;

        p.x = centerX + edge.x;
        p.y = centerY + edge.y;
        p.vx = (dx / dist) * speed;
        p.vy = (dy / dist) * speed;
        p.size = 2 + Math.random() * 3;
        p.life = 0;
        p.maxLife = 30 + Math.floor(Math.random() * 25);
        p.alpha = 0.9;
        p.color = color;
        p.rotation = 0;
        p.rotationSpeed = 0;
        p.scale = 1;
        p.custom.startDelay = Math.floor(Math.random() * 4); // slight stagger
      }
    },

    update(p) {
      if (p.life < p.custom.startDelay) return;

      const active = p.life - p.custom.startDelay;
      const duration = p.maxLife - p.custom.startDelay;
      const progress = active / duration;

      p.x += p.vx;
      p.y += p.vy;
      // Gentle deceleration
      p.vx *= 0.97;
      p.vy *= 0.97;

      // Grow slightly then shrink
      if (progress < 0.3) {
        p.scale = 1 + progress * 2;
      } else {
        p.scale = (1 - progress) * 1.8;
      }

      // Smooth fade-out
      p.alpha = (1 - progress) * (1 - progress) * 0.9;
    },

    render(ctx, p) {
      if (p.life < p.custom.startDelay) return;
      if (p.alpha < 0.01) return;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      const r = Math.max(0.5, p.size * p.scale);
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, p.color + '00'); // transparent edge

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiffuseEffect;
}
