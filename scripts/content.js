
(() => {
  "use strict";

  if (window.__youtubeRGBControlsInstalled) return;
  window.__youtubeRGBControlsInstalled = true;

  const HOST_ID = "yt-rgb-controls";
  const LIGHT_ID = "yt-rgb-ambient";
  const DEFAULT_SETTINGS = {
    enabled: true,
    rgbEnabled: false
  };

  let settings = { ...DEFAULT_SETTINGS };
  let video = null;
  let player = null;
  let host = null;
  let ambientLight = null;
  let hideTimer = null;
  let observerTimer = null;
  let lastUrl = location.href;

  const query = (selector, root = document) =>
    root.querySelector(selector);

  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      if (chrome.runtime.lastError) return;
      settings = result;
      render();
    });
  }

  function isTyping(target) {
    if (!(target instanceof Element)) return false;

    return Boolean(
      target.closest([
        "input",
        "textarea",
        "select",
        "[contenteditable='true']",
        "[contenteditable='']",
        "[role='textbox']",
        "[role='searchbox']",
        "ytd-searchbox",
        "#search",
        "#commentbox",
        "ytd-commentbox",
        "ytd-comment-simplebox-renderer",
        "yt-live-chat-text-input-field-renderer"
      ].join(","))
    );
  }

  function findVideo() {
    const candidates = [...document.querySelectorAll("video")];

    return candidates.find((item) => {
      if (!item.isConnected) return false;

      const rect = item.getBoundingClientRect();
      const style = getComputedStyle(item);

      return rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden";
    }) || null;
  }

  function findPlayer() {
    if (!video) return null;

    return video.closest(".html5-video-player") ||
      video.closest("ytd-player") ||
      video.parentElement;
  }

  function seek(seconds) {
    if (!video || !Number.isFinite(video.currentTime)) return;

    const duration = video.duration;
    const target = video.currentTime + seconds;

    video.currentTime = Number.isFinite(duration)
      ? Math.max(0, Math.min(duration, target))
      : Math.max(0, target);

    showControls();
  }

  function createControls() {
    if (!player) return;

    host?.remove();

    host = document.createElement("div");
    host.id = HOST_ID;
    host.innerHTML = `
      <div class="yt-rgb-seek-controls">
        <button
          type="button"
          class="yt-rgb-seek"
          data-seek="-10"
          aria-label="Rewind 10 seconds"
          title="Rewind 10 seconds"
        >
          <span class="yt-rgb-symbol" aria-hidden="true">↶</span>
          <span class="yt-rgb-number">10</span>
        </button>

        <button
          type="button"
          class="yt-rgb-seek"
          data-seek="10"
          aria-label="Forward 10 seconds"
          title="Forward 10 seconds"
        >
          <span class="yt-rgb-symbol" aria-hidden="true">↷</span>
          <span class="yt-rgb-number">10</span>
        </button>
      </div>
    `;

    player.appendChild(host);

    host.addEventListener("click", (event) => {
      const button = event.target.closest("[data-seek]");
      if (!button || !host.contains(button)) return;

      event.preventDefault();
      event.stopPropagation();

      seek(Number(button.dataset.seek));
    });
  }

  function createAmbientLight() {
    if (!player) return;

    if (!settings.rgbEnabled) {
      ambientLight?.remove();
      ambientLight = null;
      return;
    }

    if (
      ambientLight &&
      ambientLight.parentElement === player
    ) {
      updateFullscreenState();
      return;
    }

    ambientLight?.remove();

    ambientLight = document.createElement("div");
    ambientLight.id = LIGHT_ID;
    ambientLight.setAttribute("aria-hidden", "true");

    player.appendChild(ambientLight);
    updateFullscreenState();
  }

  function updateFullscreenState() {
    if (!ambientLight) return;

    const fullscreen = Boolean(
      document.fullscreenElement &&
      (
        document.fullscreenElement === player ||
        document.fullscreenElement.contains(video)
      )
    );

    ambientLight.classList.toggle(
      "yt-rgb-fullscreen",
      fullscreen
    );
  }

  function showControls() {
    if (!host || !settings.enabled) return;

    host.classList.add("yt-rgb-visible");

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
      host?.classList.remove("yt-rgb-visible");
    }, 2200);
  }

  function render() {
    if (!settings.enabled) {
      host?.remove();
      host = null;

      ambientLight?.remove();
      ambientLight = null;

      clearTimeout(hideTimer);
      return;
    }

    const nextVideo = findVideo();
    if (!nextVideo) return;

    const nextPlayer = nextVideo.closest(".html5-video-player") ||
      nextVideo.closest("ytd-player") ||
      nextVideo.parentElement;

    if (!nextPlayer) return;

    if (nextVideo !== video || nextPlayer !== player) {
      host?.remove();
      ambientLight?.remove();

      host = null;
      ambientLight = null;
      video = nextVideo;
      player = nextPlayer;

      createControls();
    } else if (!host?.isConnected) {
      createControls();
    }

    createAmbientLight();
    showControls();
  }

  function isVisibleAndClickable(button) {
    if (!button?.isConnected || button.disabled) return false;

    const style = getComputedStyle(button);
    const rect = button.getBoundingClientRect();

    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) > 0 &&
      rect.width > 0 &&
      rect.height > 0 &&
      button.getAttribute("aria-disabled") !== "true";
  }

  function findSkipAdButton() {
    const selectors = [
      ".ytp-ad-skip-button",
      ".ytp-ad-skip-button-modern",
      ".ytp-skip-ad-button",
      "button[aria-label*='Skip ad' i]",
      "button[aria-label*='Skip Ads' i]"
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);

      for (const button of buttons) {
        if (isVisibleAndClickable(button)) return button;
      }
    }

    return null;
  }

  function handleKeyboard(event) {
    if (
      event.key.toLowerCase() !== "s" ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.isComposing ||
      isTyping(event.target)
    ) {
      return;
    }

    const skipButton = findSkipAdButton();

    if (!skipButton) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    skipButton.click();
  }

  document.addEventListener("keydown", handleKeyboard, true);

  document.addEventListener("mousemove", showControls, {
    passive: true
  });

  document.addEventListener("touchstart", showControls, {
    passive: true
  });

  document.addEventListener("fullscreenchange", () => {
    updateFullscreenState();
    render();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (const [key, change] of Object.entries(changes)) {
      settings[key] = change.newValue;
    }

    render();
  });

  function checkPage() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;

      host?.remove();
      ambientLight?.remove();

      host = null;
      ambientLight = null;
      video = null;
      player = null;
    }

    render();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(checkPage, 200);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  loadSettings();
  checkPage();
})();
