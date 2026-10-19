# YouTube RGB Controls

A lightweight Chrome extension that adds 10-second seek buttons and optional
animated ambient lighting to the YouTube video player. It also lets you skip a
visible ad with the `S` key.

## Features

- Rewind or forward the current video by 10 seconds using on-player buttons.
- Show the seek buttons when you move the mouse or touch the page; they fade
  away after a short period.
- Toggle animated RGB-style ambient lighting around the player. The effect also
  follows the edges of the screen in fullscreen mode.
- Press `S` to click YouTube's visible, enabled skip-ad button. The shortcut
  does not activate while typing in a text field or when Ctrl, Alt, or
  Command/Meta is held. It only works after YouTube makes an ad skippable;
  it cannot skip ads for which YouTube does not show an enabled skip button.
- Save settings automatically with Chrome's sync storage.
- Respect the operating system's reduced-motion preference.

The lighting is a CSS color animation; it does not analyze or react to audio.

## Install in Chrome

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose this repository's root folder (the folder
   containing `manifest.json`).
5. Open or refresh a YouTube page. Select the extension's toolbar icon to
   change its settings.

After changing the extension's files, use **Reload** on its card in
`chrome://extensions`, then refresh the YouTube tab.

## Settings and controls

The extension popup has two settings:

- **Video controls** — enables the on-player seek buttons and allows the
  ambient-light feature to be displayed.
- **RGB ambient lighting** — enables or disables the animated glow. Video
  controls must also be enabled for the glow to appear.

Both settings can be changed independently in the popup and are saved
automatically. The `S` skip-ad shortcut is independent of these two settings
and works only while YouTube displays an enabled skip button.

## Permissions and scope

The extension requests:

- **Storage** (`storage`) to save the two settings using Chrome sync storage.
- **YouTube site access** (`https://www.youtube.com/*`) to add controls and
  respond to the skip-ad shortcut on YouTube pages.

It does not request audio capture or access to other websites.

## Repository layout

```text
manifest.json       Extension metadata, permissions, and content-script setup
popup.html          Settings popup
scripts/
  content.js        YouTube player controls, settings, and skip-ad shortcut
  popup.js          Loads and saves popup settings
styles/
  content.css       Player controls and ambient-light appearance
  popup.css         Popup appearance
```

## Development

There is no build step or package installation. The extension runs directly
from the repository files when loaded unpacked in Chrome. The content script
and its stylesheet are registered in `manifest.json`.
