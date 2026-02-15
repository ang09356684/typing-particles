// effects/electric.js — Lightning bolt pulses

const ElectricEffect = {
  name: 'electric',
  label: '電流脈衝',
  icon: '⚡',

  _colorsDark: ['#FFFFFF', '#67E8F9', '#A5F3FC', '#E0F2FE'],
  _colorsLight: ['#1E40AF', '#3B82F6', '#6366F1', '#7C3AED'],

  spawn(x, y, intensity, acquire, context) {
    const count = Math.floor((2 + Math.random() * 2) * intensity);
    const isDark = context && context.isDarkBg;
    const colors = isDark ? this._colorsDark : this._colorsLight;

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      // Generate zigzag path
      const segments = 5 + Math.floor(Math.random() * 4); // 5-8 segments
      const path = [{ x: 0, y: 0 }];
      let angle = Math.random() * Math.PI * 2; // random starting direction

      for (let s = 0; s < segments; s++) {
        const len = 8 + Math.random() * 7; // 8-15px per segment
        angle += (Math.random() - 0.5) * (Math.PI / 3); // ±60°
        const prev = path[path.length - 1];
        path.push({
          x: prev.x + Math.cos(angle) * len,
          y: prev.y + Math.sin(angle) * len
        });
      }

      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
      p.size = 1;
      p.life = 0;
      p.maxLife = 8 + Math.floor(Math.random() * 8); // 8-15 frames
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.path = path;
      p.custom.coreColor = isDark ? '#FFFFFF' : '#1E3A8A';
    }
  },

  update(p) {
    // Lightning doesn't move — just fades fast
    p.alpha = 1 - (p.life / p.maxLife);

    // Jitter path coordinates slightly for electric arc effect
    const path = p.custom.path;
    if (path) {
      for (let i = 1; i < path.length; i++) {
        path[i].x += (Math.random() - 0.5) * 2;
        path[i].y += (Math.random() - 0.5) * 2;
      }
    }
  },

  render(ctx, p) {
    const path = p.custom.path;
    if (!path || path.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Glow layer
    ctx.globalAlpha = p.alpha * 0.3;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.x + path[0].x, p.y + path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(p.x + path[i].x, p.y + path[i].y);
    }
    ctx.stroke();

    // Bright core
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.custom.coreColor || '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x + path[0].x, p.y + path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(p.x + path[i].x, p.y + path[i].y);
    }
    ctx.stroke();

    // Spark dots at branch points
    ctx.fillStyle = p.custom.coreColor || '#FFFFFF';
    for (let i = 1; i < path.length - 1; i++) {
      if (Math.random() < 0.4) {
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(p.x + path[i].x, p.y + path[i].y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElectricEffect;
}
