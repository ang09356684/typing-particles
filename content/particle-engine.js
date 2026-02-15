// particle-engine.js — Object-pool particle engine with animation loop

const ParticleEngine = (() => {
  const _pool = [];
  let _activeCount = 0;
  let _rafId = null;
  let _currentEffect = null;
  let _canvasManager = null;
  let _poolSize = 300;

  function init(canvasManager, poolSize) {
    _canvasManager = canvasManager;
    _poolSize = poolSize || 300;
    _pool.length = 0;
    _activeCount = 0;
    for (let i = 0; i < _poolSize; i++) {
      _pool.push(_createParticle());
    }
  }

  function _createParticle() {
    return {
      active: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 0,
      life: 0, maxLife: 0,
      color: '',
      alpha: 1,
      rotation: 0,
      rotationSpeed: 0,
      scale: 1,
      // Effect-specific data
      custom: {}
    };
  }

  function _acquire() {
    for (let i = 0; i < _pool.length; i++) {
      if (!_pool[i].active) {
        _pool[i].active = true;
        _pool[i].custom = {};
        _activeCount++;
        return _pool[i];
      }
    }
    return null; // Pool exhausted
  }

  function _release(particle) {
    particle.active = false;
    _activeCount--;
  }

  function setEffect(effect) {
    _currentEffect = effect;
  }

  function spawn(x, y, intensity, context) {
    if (!_currentEffect) return;
    _currentEffect.spawn(x, y, intensity, _acquire, context);
    if (_activeCount > 0 && _rafId === null) {
      _startLoop();
    }
  }

  function _startLoop() {
    if (_rafId !== null) return;
    _rafId = requestAnimationFrame(_tick);
  }

  function _stopLoop() {
    if (_rafId !== null) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
    if (_canvasManager) {
      _canvasManager.clear();
      _canvasManager.hide();
    }
  }

  function _tick() {
    _rafId = null;

    if (_activeCount === 0) {
      _stopLoop();
      return;
    }

    if (_canvasManager) {
      _canvasManager.show();
      _canvasManager.clear();
      const ctx = _canvasManager.getCtx();

      if (ctx && _currentEffect) {
        for (let i = 0; i < _pool.length; i++) {
          const p = _pool[i];
          if (!p.active) continue;

          // Update
          _currentEffect.update(p);
          p.life++;

          if (p.life >= p.maxLife) {
            _release(p);
            continue;
          }

          // Render
          _currentEffect.render(ctx, p);
        }
      }
    }

    if (_activeCount > 0) {
      _rafId = requestAnimationFrame(_tick);
    } else {
      _stopLoop();
    }
  }

  function getActiveCount() {
    return _activeCount;
  }

  function clear() {
    for (let i = 0; i < _pool.length; i++) {
      if (_pool[i].active) {
        _pool[i].active = false;
      }
    }
    _activeCount = 0;
    _stopLoop();
  }

  return { init, setEffect, spawn, getActiveCount, clear };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleEngine;
}
