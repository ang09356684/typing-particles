// caret-detector.js — Detect pixel position of the text caret

const CaretDetector = (() => {
  let _mirror = null;

  const MIRROR_STYLE_PROPS = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing',
    'wordSpacing', 'textTransform', 'textIndent', 'textDecoration',
    'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'boxSizing', 'direction', 'textAlign', 'whiteSpace', 'wordWrap',
    'overflowWrap', 'tabSize'
  ];

  function _getMirror() {
    if (_mirror && document.body.contains(_mirror)) return _mirror;
    _mirror = document.createElement('div');
    _mirror.id = '__tp_mirror';
    Object.assign(_mirror.style, {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflow: 'hidden'
    });
    document.body.appendChild(_mirror);
    return _mirror;
  }

  /**
   * Get caret coordinates for <input> or <textarea>
   */
  function _getCaretFromInputable(el) {
    const mirror = _getMirror();
    const cs = window.getComputedStyle(el);

    // Copy styles
    for (const prop of MIRROR_STYLE_PROPS) {
      mirror.style[prop] = cs[prop];
    }

    // Set mirror dimensions to match element
    const rect = el.getBoundingClientRect();
    mirror.style.width = rect.width + 'px';
    if (el.tagName === 'INPUT') {
      mirror.style.whiteSpace = 'nowrap';
      mirror.style.height = 'auto';
    } else {
      mirror.style.height = rect.height + 'px';
    }

    // Build content up to caret position
    const pos = el.selectionStart ?? el.value.length;
    const textBefore = el.value.substring(0, pos);
    const textAfter = el.value.substring(pos) || ' ';

    mirror.textContent = '';
    const beforeNode = document.createTextNode(textBefore);
    const marker = document.createElement('span');
    marker.textContent = textAfter.charAt(0) || '|';
    const afterNode = document.createTextNode(textAfter.substring(1));

    mirror.appendChild(beforeNode);
    mirror.appendChild(marker);
    mirror.appendChild(afterNode);

    // Account for scroll offset
    mirror.scrollTop = el.scrollTop;
    mirror.scrollLeft = el.scrollLeft;

    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();

    // Convert back to page coordinates relative to the element
    const x = rect.left + (markerRect.left - mirrorRect.left) - el.scrollLeft;
    const y = rect.top + (markerRect.top - mirrorRect.top) - el.scrollTop;

    return { x, y: y + markerRect.height * 0.5 };
  }

  /**
   * Check if a DOMRect looks like a valid caret position
   * (has non-zero height and isn't stuck at the viewport origin)
   */
  function _isUsableRect(r) {
    return r && r.height > 0 && !(r.left === 0 && r.top === 0);
  }

  /**
   * Check if a point is reasonably inside (or near) an element's bounds
   */
  function _isInsideElement(r, elRect, margin) {
    margin = margin || 30;
    return r.left >= elRect.left - margin && r.left <= elRect.right + margin &&
           r.top  >= elRect.top  - margin && r.top  <= elRect.bottom + margin;
  }

  /**
   * Get caret coordinates for contenteditable elements
   */
  function _getCaretFromContentEditable(el) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);

    const elRect = el.getBoundingClientRect();
    let rect = null;

    // Method 1: getClientRects() — more reliable for collapsed ranges on Windows Chrome
    const rects = range.getClientRects();
    if (rects.length > 0 && _isUsableRect(rects[0])) {
      rect = rects[0];
    }

    // Method 2: getBoundingClientRect()
    if (!rect) {
      const bRect = range.getBoundingClientRect();
      if (_isUsableRect(bRect)) {
        rect = bRect;
      }
    }

    // Method 3: insert a temporary zero-width space to force layout
    if (!rect) {
      const temp = document.createElement('span');
      temp.textContent = '\u200B';
      try {
        range.insertNode(temp);
        const tempRect = temp.getBoundingClientRect();
        if (_isUsableRect(tempRect)) {
          rect = tempRect;
        }
        temp.parentNode.removeChild(temp);
      } catch (_) {
        // insertNode can fail in some editors; ignore
        if (temp.parentNode) temp.parentNode.removeChild(temp);
      }
      // Restore selection
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (!rect) return null;

    // Validate: the caret should be within (or very near) the element
    if (!_isInsideElement(rect, elRect, 30)) return null;

    return { x: rect.left, y: rect.top + rect.height * 0.5 };
  }

  /**
   * Main entry: detect caret position for the given element.
   * Returns { x, y } in viewport coordinates, or null.
   */
  function detect(el) {
    if (!el) return null;

    // Skip password fields
    if (el.tagName === 'INPUT' && el.type === 'password') return null;

    // contenteditable
    if (el.isContentEditable) {
      return _getCaretFromContentEditable(el);
    }

    // input / textarea
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return _getCaretFromInputable(el);
    }

    return null;
  }

  return { detect };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CaretDetector;
}
