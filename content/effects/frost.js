// effects/frost.js — Hexagonal ice crystal particles

const FrostEffect = {
  name: 'frost',
  label: '冰霜結晶',
  icon: '❄️',

  _colors: ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#67E8F9'],

  spawn(x, y, intensity, acquire) {
    const count = Math.floor((5 + Math.random() * 6) * intensity);
    const colors = this._colors;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 4 + Math.random() * 5;
      p.life = 0;
      p.maxLife = 25 + Math.floor(Math.random() * 20); // 25-45 frames
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = Math.random() * Math.PI * 2;
      p.scale = 1;
      p.custom.rotationSpeed = (Math.random() - 0.5) * 0.08;
      p.custom.spokes = Math.random() < 0.5 ? 6 : 4; // hex or cross
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.rotation += p.custom.rotationSpeed;
    p.scale *= 0.985; // gradually shrink

    const progress = p.life / p.maxLife;
    p.alpha = 1 - progress;
  },

  render(ctx, p) {
    if (p.alpha <= 0) return;

    const r = p.size * p.scale;
    if (r < 0.5) return;

    const spokes = p.custom.spokes || 6;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    // Draw crystal spokes
    for (let i = 0; i < spokes; i++) {
      const a = (Math.PI * 2 / spokes) * i;
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dx, dy);
      ctx.stroke();

      // Small branches on each spoke
      const bLen = r * 0.35;
      const bx = dx * 0.6;
      const by = dy * 0.6;
      const bAngle1 = a + 0.5;
      const bAngle2 = a - 0.5;

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(bAngle1) * bLen, by + Math.sin(bAngle1) * bLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(bAngle2) * bLen, by + Math.sin(bAngle2) * bLen);
      ctx.stroke();
    }

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrostEffect;
}
