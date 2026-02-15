// effects/burst.js — Classic particle burst

const BurstEffect = {
  name: 'burst',
  label: '粒子爆發',
  icon: '💥',

  spawn(x, y, intensity, acquire) {
    const count = Math.floor((6 + Math.random() * 10) * intensity);
    const colors = ['#FFD700', '#FF8C00', '#FFFFFF', '#87CEEB'];

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 3 + Math.random() * 5;
      p.life = 0;
      p.maxLife = 25 + Math.floor(Math.random() * 25);
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;          // gravity
    p.vx *= 0.98;          // friction
    p.vy *= 0.98;
    p.alpha = 1 - (p.life / p.maxLife);  // linear fade
  },

  render(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BurstEffect;
}
