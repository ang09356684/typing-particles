// shared/constants.js — Default values and effect registry

const EFFECT_REGISTRY = ['burst', 'echo', 'vortex', 'sparkle', 'firefly', 'confetti', 'bubble', 'frost', 'flame', 'ripple', 'electric', 'diffuse'];

const DEFAULT_SETTINGS = {
  enabled: true,
  effect: 'burst',
  intensity: 0.5          // 0.1 – 1.0
};

const POOL_SIZE = 300;
const MAX_FRAME_BUDGET_MS = 4;

// Colors per effect
const COLORS = {
  burst: ['#FFD700', '#FF8C00', '#FFFFFF', '#87CEEB'],
  sparkle: ['#FFFFFF', '#FFFACD', '#87CEEB'],
  flame: ['#FFFF80', '#FFA500', '#FF4500', '#8B0000'],
  diffuse: ['#A78BFA', '#67E8F9', '#FDE68A', '#FCA5A5']
};

// Try to export for both module and script contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EFFECT_REGISTRY, DEFAULT_SETTINGS, POOL_SIZE, COLORS, MAX_FRAME_BUDGET_MS };
}
