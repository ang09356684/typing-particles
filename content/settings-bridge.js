// settings-bridge.js — Listen for chrome.storage changes and apply settings

const SettingsBridge = (() => {
  let _callback = null;

  const DEFAULT_SETTINGS = {
    enabled: true,
    effect: 'burst',
    intensity: 0.5
  };

  function init(callback) {
    _callback = callback;

    // Load initial settings
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
        if (_callback) _callback(result);
      });

      // Listen for changes
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        const updated = {};
        for (const key in changes) {
          updated[key] = changes[key].newValue;
        }
        if (_callback) _callback(updated);
      });
    } else {
      // Not in extension context (e.g., prototype) — use defaults
      if (_callback) _callback(DEFAULT_SETTINGS);
    }
  }

  return { init, DEFAULT_SETTINGS };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsBridge;
}
