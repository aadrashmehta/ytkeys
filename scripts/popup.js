
(() => {
  "use strict";

  const enabledInput = document.querySelector("#enabled");
  const rgbEnabledInput = document.querySelector("#rgbEnabled");
  const status = document.querySelector("#status");

  const defaults = {
    enabled: true,
    rgbEnabled: false
  };

  function showStatus(message) {
    status.textContent = message;
  }

  function loadSettings() {
    chrome.storage.sync.get(defaults, (settings) => {
      if (chrome.runtime.lastError) {
        showStatus("Unable to load settings.");
        return;
      }

      enabledInput.checked = settings.enabled;
      rgbEnabledInput.checked = settings.rgbEnabled;
    });
  }

  function saveSettings() {
    const settings = {
      enabled: enabledInput.checked,
      rgbEnabled: rgbEnabledInput.checked
    };

    showStatus("Saving...");

    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        showStatus("Unable to save settings.");
        return;
      }

      showStatus("Settings saved.");
    });
  }

  enabledInput.addEventListener("change", saveSettings);
  rgbEnabledInput.addEventListener("change", saveSettings);

  loadSettings();
})();
