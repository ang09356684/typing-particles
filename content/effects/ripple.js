// effects/ripple.js — Expanding water ripple rings

const RippleEffect = {
  name: 'ripple',
  label: '水波漣漪',
  icon: '🌊',

  spawn(x, y, intensity, acquire) {
    const count = Math.floor((2 + Math.random() * 2) * intensity); // 2-3 rings

    for (let i = 0; i < count; i++) {
      const p = acquire();
      if (!p) return;

      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
      p.size = 2 + i * 3;  // stagger initial size so rings don't overlap
      p.life = 0;
      p.maxLife = 25 + Math.floor(Math.random() * 15); // 25-40 frames
      p.color = '';
      p.alpha = 1;
      p.rotation = 0;
      p.scale = 1;
      p.custom.expandSpeed = 1.2 + Math.random() * 0.8; // 1.2-2.0 px/frame
      p.custom.delay = i * 4; // stagger appearance
    }
  },

  update(p) {
    // Delay before the ring starts appearing
    if (p.life < p.custom.delay) {
      p.alpha = 0;
      return;
    }

    const activeLife = p.life - p.custom.delay;
    const activeMax = p.maxLife - p.custom.delay;
    const progress = activeLife / activeMax;

    p.size += p.custom.expandSpeed;
    p.alpha = 1 - progress * progress; // quadratic fade

    // Color shifts from bright cyan to blue as it expands
    if (progress < 0.3) {
      p.color = '#67E8F9';
    } else if (progress < 0.6) {
      p.color = '#38BDF8';
    } else {
      p.color = '#3B82F6';
    }
  },

  render(ctx, p) {
    if (p.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(0.5, 2 - (p.life / p.maxLife) * 1.5); // thins out
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RippleEffect;
}
