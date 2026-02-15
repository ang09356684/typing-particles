// effects/confetti.js — Colorful confetti pieces with 3D flip

const ConfettiEffect = {
  name: 'confetti',
  label: '紙花飄落',
  icon: '🎊',

  _colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BD6', '#845EC2', '#FF9671', '#00C9A7'],

  spawn(x, y, intensity, acquire) {
    const count = Math.floor((5 + Math.random() * 8) * intensity);
    const colors = this._colors;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      const w = 3 + Math.random() * 4;

      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 5;
      p.vy = -3 - Math.random() * 4; // upward burst
      p.size = w;
      p.life = 0;
      p.maxLife = 35 + Math.floor(Math.random() * 21); // 35-55 frames
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = Math.random() * Math.PI * 2;
      p.scale = 1;
      p.custom.width = w;
      p.custom.height = w * (1.5 + Math.random());
      p.custom.rotationSpeed = (Math.random() - 0.5) * 0.3;
      p.custom.phase = Math.random() * Math.PI * 2; // 3D flip phase
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;        // gravity
    p.vx *= 0.98;         // air resistance
    // Horizontal sway simulating air turbulence
    p.vx += Math.sin(p.life * 0.1 + p.custom.phase) * 0.1;
    p.rotation += p.custom.rotationSpeed;

    const progress = p.life / p.maxLife;
    p.alpha = 1 - progress * progress; // fade out late
  },

  render(ctx, p) {
    const w = p.custom.width || p.size;
    const h = p.custom.height || p.size * 2;

    // 3D flip effect: scaleX oscillates via cosine
    const scaleX = Math.cos(p.life * 0.15 + p.custom.phase);
    const drawW = w * Math.abs(scaleX);

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-drawW / 2, -h / 2, drawW, h);
    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfettiEffect;
}
