// effects/vortex.js — Spiral vortex particles converging inward

const VortexEffect = {
  name: 'vortex',
  label: '漩渦吸入',
  icon: '💫',

  _colorsDark: ['#C084FC', '#A78BFA', '#818CF8', '#67E8F9', '#F0ABFC', '#FFFFFF'],
  _colorsLight: ['#7C3AED', '#6D28D9', '#4F46E5', '#0891B2', '#A21CAF', '#4338CA'],

  spawn(x, y, intensity, acquire, context) {
    const count = Math.floor((6 + Math.random() * 8) * intensity);
    const isDark = context && context.isDarkBg;
    const colors = isDark ? this._colorsDark : this._colorsLight;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30; // spawn away from center

      p.x = x + Math.cos(angle) * dist;
      p.y = y + Math.sin(angle) * dist;
      p.vx = 0;
      p.vy = 0;
      p.size = 2 + Math.random() * 3;
      p.life = 0;
      p.maxLife = 25 + Math.floor(Math.random() * 15); // 25-40 frames
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.cx = x; // vortex center
      p.custom.cy = y;
      p.custom.angle = angle;
      p.custom.dist = dist;
      p.custom.spinSpeed = 0.15 + Math.random() * 0.1; // radians per frame
      p.custom.spinDir = Math.random() < 0.5 ? 1 : -1;
      p.custom.isDark = isDark;
    }
  },

  update(p) {
    const progress = p.life / p.maxLife;

    // Spiral inward: angle increases, distance decreases
    p.custom.angle += p.custom.spinSpeed;
    p.custom.dist *= 0.955; // shrink orbit

    p.x = p.custom.cx + Math.cos(p.custom.angle) * p.custom.dist;
    p.y = p.custom.cy + Math.sin(p.custom.angle) * p.custom.dist;

    // Shrink and fade as it gets sucked in
    p.scale = 1 - progress * 0.7;
    p.alpha = 1 - progress * progress;
  },

  render(ctx, p) {
    if (p.alpha <= 0) return;

    const r = p.size * p.scale;
    if (r < 0.3) return;

    ctx.save();
    ctx.globalAlpha = p.alpha;

    // Glow layer
    ctx.globalAlpha = p.alpha * 0.3;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.custom.isDark ? '#FFFFFF' : p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VortexEffect;
}
