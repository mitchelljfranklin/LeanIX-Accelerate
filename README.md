# LeanIX Accelerate

Browser extension (Manifest V3) that supercharges the LeanIX enterprise architecture platform with export, print, and productivity features.

## Features

### Data Export
**Where:** Factsheet and inventory pages with the `lx-factsheets-table` element visible.

Adds a floating Export button (bottom-right). Dropdown options:
- **Export as JSON** — Downloads structured JSON of all visible fields (factsheet) or table rows (inventory)
- **Export to Excel** — Clicks the native LeanIX "Inventory Tools > Export to Excel" menu item

The button appears/hides reactively as you navigate between views. Falls back to a generic page export when no specific data is available.

### Print Export
**Where:** Document detail pages with `lx-document-fields-form` visible.

Adds an Export button in the document header bar (next to the Edit/Close buttons). Dropdown options:
- **Export to Print** — Opens a formatted HTML document with all sections (rich text editor blocks, dates, fact sheet lists, user lists) and triggers browser print dialog for PDF/paper output
- **Export to Excel** — Downloads a proper `.xlsx` workbook with all document sections as labeled rows using SheetJS

### Documents Export
**Where:** Architecture Decisions and other document list pages with `table.table-hover`.

Adds an Export button in the page header button group (next to "New Decision"). Downloads the visible document list (ID, Title, Status, Creator, Last Updated) as a `.xlsx` file.

### Popup
Click the extension icon to toggle individual features on/off without opening the full settings page. Includes a "Reload Page" button to apply changes immediately.

### Options
Full settings page accessible via the popup's "Configure" button or `chrome://extensions` > Details > Extension options. Toggle individual features and reset all settings to defaults.

## Project Structure

```
leanix-extension/
├── .gitignore
├── AGENTS.md                       # AI agent context and development guide
├── LICENSE                         # GPL v3
├── README.md                       # This file
├── manifest.json                   # Chrome MV3 extension manifest
├── package.json                    # Dev dependencies and scripts
├── icons/                          # Extension icons (16px, 48px, 128px)
├── scripts/
│   └── build.js                    # Builds store-ready zip files
├── docs/                           # Screenshots and store listing assets
└── src/
    ├── background/
    │   └── service-worker.js       # Settings init, message router, tab logging
    ├── shared/
    │   ├── storage.js              # SettingsStore class (chrome.storage.sync wrapper)
    │   ├── dom-utils.js            # DOMUtils: waitForElement, createElement, etc.
    │   └── xlsx.full.min.js        # SheetJS 0.20.3 (vendor)
    ├── content/
    │   ├── index.js                # Entry point — loads enabled features
    │   ├── leanix.css              # All extension UI styles
    │   └── features/
    │       ├── data-export.js      # Factsheet/inventory table export
    │       ├── print-export.js     # Document print and Excel export
    │       └── documents-export.js # Document list Excel export
    ├── popup/
    │   ├── popup.html
    │   ├── popup.js
    │   └── popup.css
    └── options/
        ├── options.html
        ├── options.js
        └── options.css
```

## Installation

### Development
1. `npm install`
2. Open `chrome://extensions` in Chrome/Edge
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project root
5. The extension activates on `*.leanix.net` and `*.leanix.com`

### Reload After Changes
Click the reload icon on the extension card in `chrome://extensions`, then refresh the LeanIX page.

## Commands

| Command | Description |
|---|---|
| `npm run lint` | Run ESLint on `src/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Build store-ready zip files for Chrome, Edge, Firefox |

## Build Output

`npm run build` creates three zip files in `dist/`:

| File | Notes |
|---|---|
| `leanix-extension-chrome.zip` | Chrome Web Store |
| `leanix-extension-edge.zip` | Edge Add-ons (identical to Chrome) |
| `leanix-extension-firefox.zip` | Firefox Add-ons (adds `browser_specific_settings.gecko`) |

## Architecture

### Feature System
Each feature is an IIFE that attaches to `window.__leanixFeatures__`:

```js
window.__leanixFeatures__.myFeature = {
  init: function (DOM, settings) { /* setup observers, inject buttons */ }
};
```

The entry point (`src/content/index.js`) reads enabled features from `SettingsStore` and calls each `init()` in order.

### Settings Storage
Settings are persisted via `chrome.storage.sync` under the key `leanix_extension_settings`. The `SettingsStore` class provides get/set/reset methods and a change listener.

### SPA Navigation Resilience
All features handle LeanIX's single-page navigation by:
1. Checking if the target DOM element already exists
2. Watching `document.body` with `MutationObserver` for re-added elements
3. Using `IntersectionObserver` for visibility toggling
4. Guarding button injection with unique IDs to prevent duplicates

### CSS Conventions
All extension styles use the `lx-ext-` prefix and live in a single `leanix.css` file. No inline styles anywhere. Menu visibility is toggled via JS `element.style.display = "block"/"none"` (must explicitly override CSS `display: none` with a value, never empty string).

## License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
