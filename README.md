<p align="center">
  <img src="docs/LeanIXAcc%20Logo.png" alt="LeanIX Accelerate" width="128" />
</p>

<h1 align="center">LeanIX Accelerate</h1>

<p align="center">
  Unlock new levels of efficiency and productivity — the ultimate browser extension for LeanIX users.
</p>

<p align="center">
  <code>🔖 v1.0.0</code>
  <code>🧩 Manifest V3</code>
  <code>📜 GPL 3.0</code>
  <code>🌐 Chrome</code>
  <code>🌐 Edge</code>
  <code>🌐 Firefox</code>
</p>

---

### Contents

[Why Accelerate?](#why-accelerate) ·
[Features](#-features) ·
[Quick Start](#-quick-start) ·
[Commands](#-commands) ·
[Contribute](#-contribute) ·
[Privacy & Data](#-privacy--data) ·
[License](#-license)

---

## Why Accelerate?<a name="why-accelerate"></a>

LeanIX is powerful, but everyday workflows involve repetitive clicks — exporting tables, printing documents, downloading the same data over and over. **LeanIX Accelerate** injects one-click export buttons exactly where you need them, saving you time on every interaction.

| Without Accelerate | With Accelerate |
|---|---|
| Navigate menus → find export → click → wait → repeat | One click, done |
| Copy-paste data manually into spreadsheets | Auto-generate `.xlsx` or `.json` |
| Screenshot or print-preview dance for documents | Formatted print with one button |

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📊 Data Export</h3>
      <p><strong>Factsheet & Inventory pages</strong></p>
      <p>Floating export button appears automatically. Export table data as <strong>JSON</strong> or trigger the native <strong>Excel</strong> export in one click.</p>
    </td>
    <td width="50%">
      <h3>📄 Document Export</h3>
      <p><strong>Document detail pages</strong></p>
      <p>Export button injected into the document header. <strong>Print to PDF</strong> with full formatting, or download a structured <strong>Excel workbook</strong> with all sections, dates, fact sheet lists, and users.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📋 Document List Export</h3>
      <p><strong>Architecture Decisions & list pages</strong></p>
      <p>Export button in the page header. Downloads the visible document list — <strong>ID, Title, Status, Creator, Last Updated</strong> — as a clean <code>.xlsx</code> spreadsheet.</p>
    </td>
    <td width="50%">
      <h3>⚙️ Smart Controls</h3>
      <p><strong>Popup & full settings page</strong></p>
      <p>Toggle any feature on/off from the extension popup. Full settings panel with reset-to-defaults. Buttons survive page navigation — no reloads needed.</p>
    </td>
  </tr>
</table>

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🚀 Quick Start

```bash
git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git
cd LeanIX-Accelerate
npm install
```

Then:
1. Open `chrome://extensions` in Chrome or Edge
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** → select the project folder
4. Navigate to your LeanIX instance — buttons appear automatically

> **Firefox users:** Run `npm run build` and load `dist/leanix-extension-firefox.zip` via `about:debugging`.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🛠 Commands

| Command | What it does |
|---|---|
| `npm run lint` | Run ESLint across `src/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Create `.zip` files for Chrome, Edge & Firefox stores |

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🤝 Contribute

LeanIX Accelerate is built for practitioners, by practitioners. Found a bug? Have a feature idea? Know a page that needs an export button? Contributions are welcome.

### Ways to contribute
- **Report a bug** — [Open an issue](https://github.com/mitchelljfranklin/LeanIX-Accelerate/issues/new) describing what broke and where
- **Request a feature** — Describe the workflow friction and what button/export would solve it
- **Submit a PR** — Fork, branch, code, and open a pull request (see below)
- **Share selectors** — Know the DOM structure of a LeanIX page that needs love? Drop it in an issue with the relevant HTML

### Development workflow

```bash
git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git
cd LeanIX-Accelerate
npm install
```

Load the extension unpacked in Chrome/Edge:
1. `chrome://extensions` → **Developer mode** on
2. **Load unpacked** → select the project folder
3. Make changes → click the reload icon on the extension card
4. Refresh your LeanIX page

### Adding a new feature

Every feature follows the same pattern. Here's the checklist:

**1. Create the feature file** at `src/content/features/<name>.js`

```js
window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  window.__leanixFeatures__.myFeature = {
    init: function (DOM, settings) {
      // MutationObserver + IntersectionObserver to survive SPA nav
    },
    addButton: function (DOM) {
      // Guard with document.getElementById to prevent duplicates
      // Use DOM.createElement with className, never inline styles
    },
    // ... export methods
  };
})();
```

**2. Register in 6 files:**

| File | Add |
|---|---|
| `manifest.json` | Script to `content_scripts[0].js` array (before `index.js`) |
| `src/content/index.js` | Key to `featureOrder` array |
| `src/background/service-worker.js` | `featureName: true` to default `features` object |
| `src/shared/storage.js` | `featureName: true` to `FEATURE_DEFAULTS` |
| `src/popup/popup.js` | Entry to `FEATURE_LIST` array |
| `src/options/options.js` | Entry to `FEATURE_LIST` array |

**3. Add CSS** to `src/content/leanix.css` using the `lx-ext-` prefix. No inline styles.

**4. Lint before committing:** `npm run lint`

### Code conventions
- **JS style**: `function` keyword, `const`/`let`, IIFEs — no arrow functions in object methods
- **CSS**: All styles in `leanix.css` with `lx-ext-` prefix — zero inline styles
- **SPA resilience**: Every feature MUST use `MutationObserver` + `IntersectionObserver` (see existing features for the pattern)
- **Button guards**: Check `document.getElementById()` before injecting
- **Menu toggling**: Use `"block"` / `"none"` — never empty string (won't override CSS)
- **Vendor library**: SheetJS (`XLSX`) at `src/shared/xlsx.full.min.js` for `.xlsx` generation

### Project as a map

```
LeanIX-Accelerate/
│
├── manifest.json              ← Extension identity, permissions, script order
├── package.json               ← npm scripts: lint, build
│
├── src/
│   ├── background/
│   │   └── service-worker.js  ← Installs defaults, routes messages, logs pages
│   │
│   ├── shared/
│   │   ├── storage.js         ← SettingsStore class — get/set feature toggles
│   │   ├── dom-utils.js       ← DOMUtils — createElement, waitForElement, etc.
│   │   └── xlsx.full.min.js   ← SheetJS for .xlsx file generation
│   │
│   ├── content/
│   │   ├── index.js           ← Entry point — loads features in order
│   │   ├── leanix.css         ← ALL extension UI styles (lx-ext- prefix)
│   │   └── features/
│   │       ├── data-export.js      ← Facts table → JSON / native Excel
│   │       ├── print-export.js     ← Document → Print / Excel workbook
│   │       └── documents-export.js ← Doc list → Excel spreadsheet
│   │
│   ├── popup/                 ← Extension icon click → toggle features
│   └── options/               ← Full settings page → toggle + reset
│
├── icons/                     ← 16/48/128px extension icons
├── scripts/build.js           ← npm run build → dist/*.zip for stores
└── docs/                      ← Screenshots, logo, store listing assets
```

### Before you PR
- [ ] `npm run lint` passes
- [ ] Feature survives SPA navigation (navigate away and back — button reappears)
- [ ] Button has unique `id`, guarded with `document.getElementById`
- [ ] No inline styles — everything in `leanix.css`
- [ ] Registered in all 6 registration files
- [ ] Tested on Chrome and Edge

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 🔒 Privacy & Data

**LeanIX Accelerate does not collect, transmit, or store any data from your LeanIX environment.** Period.

- The extension runs entirely in your browser. No data ever leaves your machine.
- No analytics, no telemetry, no tracking, no external servers.
- No third-party services are contacted at runtime (the only external requests made are those already present on your LeanIX page).
- The only data stored is your feature-toggle preferences, saved locally via `chrome.storage.sync` so they follow you across browsers you're signed into.
- Permission `clipboardWrite` is declared solely for potential future copy-to-clipboard functionality — it is not currently used.
- Permission `activeTab` and host permissions for `*.leanix.net` / `*.leanix.com` are required to inject the UI buttons onto LeanIX pages.

You can verify all of this yourself — the source is 100% open and right here.

<p align="right"><sub><a href="#">⬆ back to top</a></sub></p>

---

## 📄 License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
