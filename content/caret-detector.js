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
   * Get caret coordinates for contenteditable elements
   */
  function _getCaretFromContentEditable() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);

    // Try getBoundingClientRect first
    let rect = range.getBoundingClientRect();

    // If rect is zero (empty contenteditable), try inserting a temp node
    if (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0) {
      const temp = document.createElement('span');
      temp.textContent = '\u200B'; // zero-width space
      range.insertNode(temp);
      rect = temp.getBoundingClientRect();
      temp.parentNode.removeChild(temp);
      // Restore selection
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0) {
      return null;
    }

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
      return _getCaretFromContentEditable();
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
