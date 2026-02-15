// effects/sparkle.js — Sparkling star particles

const SparkleEffect = {
  name: 'sparkle',
  label: '星光閃爍',
  icon: '⭐',

  _colorsDark: ['#FFFFFF', '#FFFACD', '#87CEEB'],
  _colorsLight: ['#F59E0B', '#3B82F6', '#EC4899'],

  spawn(x, y, intensity, acquire, context) {
    const count = Math.floor((4 + Math.random() * 6) * intensity);
    const isDark = context && context.isDarkBg;
    const colors = isDark ? this._colorsDark : this._colorsLight;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      p.x = x + (Math.random() - 0.5) * 40;
      p.y = y + (Math.random() - 0.5) * 40;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = -0.3 - Math.random() * 0.5;   // gentle float up
      p.size = 5 + Math.random() * 6;
      p.life = 0;
      p.maxLife = 30 + Math.floor(Math.random() * 25);
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = Math.random() * Math.PI;
      p.rotationSpeed = (Math.random() - 0.5) * 0.15;
      p.scale = 1;
      p.custom.phaseOffset = Math.random() * Math.PI * 2;
    }
  },

  update(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    // Pulsing scale for twinkle
    const progress = p.life / p.maxLife;
    p.scale = 0.5 + 0.5 * Math.abs(Math.sin(p.life * 0.3 + p.custom.phaseOffset));
    p.alpha = 1 - progress;
  },

  render(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const s = p.size * p.scale;
    // Draw 4-point star
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerX = Math.cos(angle) * s;
      const outerY = Math.sin(angle) * s;
      const innerAngle = angle + Math.PI / 4;
      const innerR = s * 0.3;
      const innerX = Math.cos(innerAngle) * innerR;
      const innerY = Math.sin(innerAngle) * innerR;

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SparkleEffect;
}
