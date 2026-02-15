// effects/firefly.js — Glowing firefly lights with pulsing flicker

const FireflyEffect = {
  name: 'firefly',
  label: '螢光漫舞',
  icon: '✨',

  _colorsDark: ['#FBBF24', '#A3E635', '#BEF264', '#FDE68A', '#D9F99D'],
  _colorsLight: ['#B45309', '#15803D', '#4D7C0F', '#92400E', '#166534'],

  spawn(x, y, intensity, acquire, context) {
    const count = Math.floor((4 + Math.random() * 6) * intensity);
    const isDark = context && context.isDarkBg;
    const colors = isDark ? this._colorsDark : this._colorsLight;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.8; // slow drifting

      p.x = x + (Math.random() - 0.5) * 16;
      p.y = y + (Math.random() - 0.5) * 16;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.3; // slight upward drift
      p.size = 2 + Math.random() * 2;
      p.life = 0;
      p.maxLife = 40 + Math.floor(Math.random() * 30); // 40-70 frames (long-lived)
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.phase = Math.random() * Math.PI * 2;    // flicker phase
      p.custom.flickerSpeed = 0.15 + Math.random() * 0.15;
      p.custom.wanderPhase = Math.random() * Math.PI * 2;
      p.custom.isDark = isDark;
    }
  },

  update(p) {
    // Gentle wandering motion
    p.vx += Math.sin(p.life * 0.07 + p.custom.wanderPhase) * 0.04;
    p.vy += Math.cos(p.life * 0.09 + p.custom.wanderPhase) * 0.03;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.x += p.vx;
    p.y += p.vy;

    const progress = p.life / p.maxLife;

    // Pulsing flicker: alpha oscillates with a sine wave
    const flicker = 0.5 + 0.5 * Math.sin(p.life * p.custom.flickerSpeed + p.custom.phase);

    // Overall fade envelope
    let envelope;
    if (progress < 0.15) {
      envelope = progress / 0.15;         // fade in
    } else if (progress > 0.7) {
      envelope = (1 - progress) / 0.3;    // fade out
    } else {
      envelope = 1;
    }

    p.alpha = flicker * envelope;
  },

  _hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  },

  render(ctx, p) {
    if (p.alpha <= 0.01) return;

    const r = p.size;
    const rgb = this._hexToRgb(p.color);

    ctx.save();
    ctx.globalAlpha = p.alpha;

    // Outer glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
    glow.addColorStop(0, `rgba(${rgb},0.4)`);
    glow.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.globalAlpha = Math.min(1, p.alpha * 1.5);
    ctx.fillStyle = p.custom.isDark ? '#FFFFFF' : p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FireflyEffect;
}
