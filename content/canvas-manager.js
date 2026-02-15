// canvas-manager.js — Full-screen Canvas overlay lifecycle

const CanvasManager = (() => {
  let _host = null;   // Shadow host element
  let _shadow = null;  // Closed shadow root
  let _canvas = null;
  let _ctx = null;
  let _visible = false;
  let _dpr = 1;

  function init(useShadowDOM = true) {
    if (_canvas) return;

    _dpr = window.devicePixelRatio || 1;

    if (useShadowDOM && typeof document.createElement('div').attachShadow === 'function') {
      _host = document.createElement('div');
      _host.id = '__typing-particles-host';
      Object.assign(_host.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0',
        height: '0',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: '2147483647'
      });
      document.documentElement.appendChild(_host);
      _shadow = _host.attachShadow({ mode: 'closed' });
    } else {
      _shadow = null;
    }

    _canvas = document.createElement('canvas');
    Object.assign(_canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483647',
      display: 'none'
    });

    _resizeCanvas();

    if (_shadow) {
      _shadow.appendChild(_canvas);
    } else {
      document.documentElement.appendChild(_canvas);
    }

    window.addEventListener('resize', _resizeCanvas);
    _ctx = _canvas.getContext('2d');
  }

  function _resizeCanvas() {
    if (!_canvas) return;
    _dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    _canvas.width = w * _dpr;
    _canvas.height = h * _dpr;
    _canvas.style.width = w + 'px';
    _canvas.style.height = h + 'px';
    if (_ctx) {
      _ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);
    }
  }

  function show() {
    if (_canvas && !_visible) {
      _canvas.style.display = 'block';
      _visible = true;
    }
  }

  function hide() {
    if (_canvas && _visible) {
      _canvas.style.display = 'none';
      _visible = false;
    }
  }

  function clear() {
    if (_ctx) {
      _ctx.save();
      _ctx.setTransform(1, 0, 0, 1, 0, 0);
      _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
      _ctx.restore();
    }
  }

  function getCtx() {
    return _ctx;
  }

  function isVisible() {
    return _visible;
  }

  function destroy() {
    window.removeEventListener('resize', _resizeCanvas);
    if (_host && _host.parentNode) {
      _host.parentNode.removeChild(_host);
    } else if (_canvas && _canvas.parentNode) {
      _canvas.parentNode.removeChild(_canvas);
    }
    _canvas = null;
    _ctx = null;
    _host = null;
    _shadow = null;
    _visible = false;
  }

  return { init, show, hide, clear, getCtx, isVisible, destroy };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasManager;
}
