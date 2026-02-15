// effects/echo.js — Expanding character outline ripple

const EchoEffect = {
  name: 'echo',
  label: '文字迴響',
  icon: '🔤',

  spawn(x, y, intensity, acquire, context) {
    if (!context || !context.char) return;

    const { char, fontFamily, fontSize, fontWeight } = context;

    // Measure character width to find its center (caret is at the right edge)
    const m = document.createElement('canvas').getContext('2d');
    m.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const charWidth = m.measureText(char).width;
    const centerX = x - charWidth * 0.5;
    const centerY = y;

    // Spawn 3 staggered echo rings
    const layers = Math.max(2, Math.floor(3 * intensity));
    const colors = ['#67E8F9', '#A78BFA', '#FDE68A', '#F9A8D4', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < layers; i++) {
      const p = acquire();
      if (!p) return;

      p.x = centerX;
      p.y = centerY;
      p.vx = 0;
      p.vy = 0;
      p.size = fontSize;
      p.life = 0;
      p.maxLife = 35 + Math.floor(Math.random() * 10);
      p.color = color;
      p.alpha = 0;  // controlled in update
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.scale = 1;
      p.custom.char = char;
      p.custom.fontFamily = fontFamily;
      p.custom.fontWeight = fontWeight;
      p.custom.startDelay = i * 5;  // stagger: 0, 5, 10 frames
    }
  },

  update(p) {
    if (p.life < p.custom.startDelay) return;

    const active = p.life - p.custom.startDelay;
    const duration = p.maxLife - p.custom.startDelay;
    const progress = active / duration;

    // Scale: start at 1.05× and grow to ~2.5×
    p.scale = 1.05 + progress * 1.5;

    // Alpha: fade in quickly then fade out smoothly
    if (progress < 0.1) {
      p.alpha = (progress / 0.1) * 0.7;
    } else {
      const t = (progress - 0.1) / 0.9;
      p.alpha = 0.7 * (1 - t * t);
    }
  },

  render(ctx, p) {
    if (p.life < p.custom.startDelay) return;
    if (p.alpha < 0.01) return;

    ctx.save();
    ctx.globalAlpha = p.alpha;

    const scaledSize = p.size * p.scale;
    ctx.font = `${p.custom.fontWeight} ${scaledSize}px ${p.custom.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Soft glow fill behind
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha * 0.15;
    ctx.fillText(p.custom.char, p.x, p.y);

    // Bright outline stroke
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(1, 2 - p.scale * 0.4);
    ctx.strokeText(p.custom.char, p.x, p.y);

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EchoEffect;
}
