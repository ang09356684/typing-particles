// effects/bubble.js — Semi-transparent floating bubbles

const BubbleEffect = {
  name: 'bubble',
  label: '泡泡飄浮',
  icon: '🫧',

  _colorsDark: ['#67E8F9', '#A78BFA', '#FDE68A', '#FCA5A5', '#86EFAC', '#F9A8D4'],
  _colorsLight: ['#0891B2', '#7C3AED', '#D97706', '#DC2626', '#16A34A', '#DB2777'],

  spawn(x, y, intensity, acquire, context) {
    const count = Math.floor((4 + Math.random() * 6) * intensity);
    const isDark = context && context.isDarkBg;
    const colors = isDark ? this._colorsDark : this._colorsLight;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      p.x = x + (Math.random() - 0.5) * 10;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -1.5 - Math.random() * 2; // float upward
      p.size = 4 + Math.random() * 7;
      p.life = 0;
      p.maxLife = 30 + Math.floor(Math.random() * 25); // 30-55 frames
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.phase = Math.random() * Math.PI * 2; // sway phase
      p.custom.swayAmp = 0.3 + Math.random() * 0.4;
      p.custom.isDark = isDark;
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;

    // Gentle sway left-right
    p.vx += Math.sin(p.life * 0.12 + p.custom.phase) * p.custom.swayAmp * 0.1;
    p.vx *= 0.96;
    p.vy *= 0.995; // very slight slowdown

    const progress = p.life / p.maxLife;
    // Pop at end: scale up slightly then vanish
    if (progress > 0.85) {
      p.scale = 1 + (progress - 0.85) * 3;
      p.alpha = (1 - progress) / 0.15;
    } else {
      p.alpha = 0.7; // semi-transparent throughout
    }
  },

  _hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  },

  render(ctx, p) {
    if (p.alpha <= 0) return;

    const r = p.size * p.scale;
    if (r < 0.5) return;

    const rgb = this._hexToRgb(p.color);

    ctx.save();
    ctx.globalAlpha = p.alpha;

    // Bubble body — radial gradient for glassy look
    const grad = ctx.createRadialGradient(
      p.x - r * 0.25, p.y - r * 0.25, r * 0.1,
      p.x, p.y, r
    );
    grad.addColorStop(0, `rgba(255,255,255,0.5)`);
    grad.addColorStop(0.4, `rgba(${rgb},0.25)`);
    grad.addColorStop(1, `rgba(${rgb},0.05)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Rim outline
    ctx.strokeStyle = `rgba(${rgb},0.4)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Specular highlight
    ctx.globalAlpha = p.alpha * 0.7;
    ctx.fillStyle = p.custom.isDark ? '#FFFFFF' : `rgba(${rgb},0.6)`;
    ctx.beginPath();
    ctx.ellipse(
      p.x - r * 0.3, p.y - r * 0.3,
      r * 0.2, r * 0.12,
      -0.5, 0, Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BubbleEffect;
}
