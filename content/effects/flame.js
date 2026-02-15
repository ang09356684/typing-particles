// effects/flame.js — Rising flame particles

const FlameEffect = {
  name: 'flame',
  label: '火焰上升',
  icon: '🔥',

  spawn(x, y, intensity, acquire) {
    const count = Math.floor((8 + Math.random() * 10) * intensity);

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      p.x = x + (Math.random() - 0.5) * 14;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = -2.5 - Math.random() * 3.5;   // rise upward
      p.size = 6 + Math.random() * 6;
      p.life = 0;
      p.maxLife = 30 + Math.floor(Math.random() * 25);
      p.color = '';  // computed per frame
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.initialSize = p.size;
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;
    // Horizontal sway
    p.vx += (Math.random() - 0.5) * 0.2;
    p.vx *= 0.95;
    // Gradually shrink
    p.size *= 0.97;
    // Fade out
    const progress = p.life / p.maxLife;
    p.alpha = 1 - progress * progress;

    // Color shift: bright yellow → orange → red → dark red
    if (progress < 0.25) {
      p.color = '#FFFF80';
    } else if (progress < 0.5) {
      p.color = '#FFA500';
    } else if (progress < 0.75) {
      p.color = '#FF4500';
    } else {
      p.color = '#8B0000';
    }
  },

  // Convert hex color to "rgba(r,g,b,0)" to avoid dark fringing
  _toTransparent(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
  },

  render(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;

    // Radial gradient: same color fading to transparent (not to black)
    const r = p.size;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(1, this._toTransparent(p.color));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlameEffect;
}
