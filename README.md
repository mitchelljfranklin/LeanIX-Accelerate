<p align="center">
  <img src="docs/LeanIXAcc%20Logo.png" alt="LeanIX Accelerate" width="128" />
</p>

<h1 align="center">LeanIX Accelerate</h1>

<p align="center">
  Unlock new levels of efficiency and productivity — the ultimate browser extension for LeanIX users.
</p>

`🔖 v1.0.0` `🧩 Manifest V3` `📜 GPL 3.0` `🌐 Chrome` `🌐 Edge` `🌐 Firefox`

---

## Why Accelerate?

LeanIX is powerful, but everyday workflows involve repetitive clicks — exporting tables, printing documents, downloading the same data over and over. **LeanIX Accelerate** injects one-click export buttons exactly where you need them, saving you time on every interaction.

| Without Accelerate | With Accelerate |
|---|---|
| Navigate menus → find export → click → wait → repeat | One click, done |
| Copy-paste data manually into spreadsheets | Auto-generate `.xlsx` or `.json` |
| Screenshot or print-preview dance for documents | Formatted print with one button |

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

---

## 📦 Project Structure

```
LeanIX-Accelerate/
├── manifest.json                  # Chrome MV3 manifest
├── package.json                   # Dev scripts & deps
├── icons/                         # 16/48/128px extension icons
├── scripts/build.js               # Store-ready zip builder
├── docs/                          # Screenshots, logo, store assets
└── src/
    ├── background/service-worker.js   # Settings init & message routing
    ├── shared/
    │   ├── storage.js                 # chrome.storage.sync wrapper
    │   ├── dom-utils.js               # DOM helpers & element factory
    │   └── xlsx.full.min.js           # SheetJS for .xlsx generation
    ├── content/
    │   ├── index.js                   # Feature loader & orchestrator
    │   ├── leanix.css                 # All extension UI styles
    │   └── features/
    │       ├── data-export.js         # Table → JSON/Excel
    │       ├── print-export.js        # Document → Print/Excel
    │       └── documents-export.js    # Doc list → Excel
    ├── popup/                         # Extension toolbar popup
    └── options/                       # Full settings page
```

---

## 🛠 Commands

| Command | What it does |
|---|---|
| `npm run lint` | Run ESLint across `src/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Create `.zip` files for Chrome, Edge & Firefox stores |

---

## 🔧 How It Works

Each feature watches for its target DOM element using `MutationObserver` (for SPA navigation resilience) and `IntersectionObserver` (for visibility detection). When the right element appears, the feature injects a styled button with a dropdown menu. All settings persist via `chrome.storage.sync`.

---

## 📄 License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
