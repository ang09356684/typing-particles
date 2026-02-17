// popup.js — Settings page logic

(function () {
  'use strict';

  const DEFAULT = { enabled: true, effect: 'burst', intensity: 0.5 };

  // --- i18n ---
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });

  const toggleEnabled = document.getElementById('toggle-enabled');
  const effectList = document.getElementById('effect-list');
  const intensitySlider = document.getElementById('intensity-slider');
  const intensityValue = document.getElementById('intensity-value');

  // Load saved settings
  chrome.storage.sync.get(DEFAULT, (s) => {
    toggleEnabled.checked = s.enabled;
    intensitySlider.value = s.intensity;
    intensityValue.textContent = Number(s.intensity).toFixed(2);
    _selectCard(s.effect);
  });

  // --- Toggle ---
  toggleEnabled.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggleEnabled.checked });
  });

  // --- Effect cards ---
  effectList.addEventListener('click', (e) => {
    const card = e.target.closest('.effect-card');
    if (!card) return;
    const effect = card.dataset.effect;
    _selectCard(effect);
    chrome.storage.sync.set({ effect });
  });

  function _selectCard(name) {
    effectList.querySelectorAll('.effect-card').forEach(c => {
      c.classList.toggle('active', c.dataset.effect === name);
    });
  }

  // --- Intensity ---
  intensitySlider.addEventListener('input', () => {
    const val = parseFloat(intensitySlider.value);
    intensityValue.textContent = val.toFixed(2);
    chrome.storage.sync.set({ intensity: val });
  });
})();
