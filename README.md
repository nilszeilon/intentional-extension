# Intentional Chrome Extension

Be intentional while you surf the web. On each page load you’ll be prompted to state your intention before browsing. You can ignore specific domains or pause the extension.

## Installation
1. Clone or download this repo.
2. In Chrome, go to `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select this extension’s folder.
4. Ensure you provide icons:
   - Place a `48×48` PNG at `icons/icon48.png`
   - Place a `128×128` PNG at `icons/icon128.png`
5. The extension is now active.

## Usage
- On each new page (except ignored domains or when paused), a prompt appears asking for your intention.
- After entering your intention, the prompt disappears and will reappear after 15 minutes on the same site.
- Open **Extensions → Intentional → Options** to:
  - Add or remove **Ignored Domains** (e.g., `google.com`).
  - **Pause** the extension for a set number of minutes.