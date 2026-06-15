# AGENTS

## Project

LeanIX Accelerate — a Chrome Manifest V3 browser extension that injects custom export, print, and productivity features into the LeanIX enterprise architecture platform. Targets `https://*.leanix.net/*` and `https://*.leanix.com/*`.

**Repo:** `https://github.com/mitchelljfranklin/LeanIX-Accelerate`

## Files You Must Know About

| File | Purpose |
|---|---|
| `README.md` | Public-facing project documentation |
| `docs/USERGUIDE.md` | End-user guide for extension features |
| `AGENTS.md` | This file — AI agent context and rules |
| `SECURITY.md` | Vulnerability reporting process |
| `LICENSE` | GPL v3.0 |
| `manifest.json` | Chrome extension manifest (MV3) |
| `package.json` | npm metadata, version, dev scripts |
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.DS_Store`, `*.zip`, `*.crx`, `*.pem` |

## Tech Stack

- **Runtime:** Browser extension, no bundler — raw JS files loaded in manifest order
- **JS Style:** ES5-compatible `function` declarations inside IIFEs, `const`/`let` for variables, no arrow functions in object methods
- **CSS:** Single file `src/content/leanix.css`, all classes prefixed `lx-ext-`, no inline styles
- **Lint:** ESLint + Prettier (`npm run lint`)
- **Node:** >= 18 (dev tooling only, not needed at runtime)
- **Vendor:** SheetJS 0.20.3 at `src/shared/xlsx.full.min.js` (registers `window.XLSX`)

## Active Features

| Feature | Key | File | Pages |
|---|---|---|---|
| Data Export | `dataExport` | `src/content/features/data-export.js` | Factsheet & Inventory |
| Print Export | `printExport` | `src/content/features/print-export.js` | Document detail |
| Documents Export | `documentsExport` | `src/content/features/documents-export.js` | Doc list / Architecture Decisions |

## How the Extension Works

```
Page load → content scripts injected (in manifest order)
  → storage.js loads first (defines SettingsStore)
  → dom-utils.js loads second (defines DOMUtils)
  → xlsx.full.min.js loads third (defines window.XLSX)
  → data-export.js (registers on window.__leanixFeatures__)
  → print-export.js (registers on window.__leanixFeatures__)
  → documents-export.js (registers on window.__leanixFeatures__)
  → index.js runs last:
      1. Checks isLeanIXPage()
      2. Reads SettingsStore.getAll()
      3. Iterates featureOrder, calls init() on each enabled feature
```

Each feature sets up `MutationObserver` + `IntersectionObserver` to inject buttons that survive SPA navigation.

## Adding a Feature — Full Checklist

When adding, changing, or removing a feature, you MUST update ALL of the following:

### Code files (7 files)

| # | File | Action |
|---|---|---|
| 1 | `src/content/features/<name>.js` | Create/delete the feature file |
| 2 | `manifest.json` | Add/remove script from `content_scripts[0].js` array (before `index.js`) |
| 3 | `src/content/index.js` | Add/remove key from `featureOrder` array |
| 4 | `src/background/service-worker.js` | Add/remove `featureName: true` from default `features` object |
| 5 | `src/shared/storage.js` | Add/remove `featureName: true` from `FEATURE_DEFAULTS` object |
| 6 | `src/popup/popup.js` | Add/remove entry from `FEATURE_LIST` array |
| 7 | `src/options/options.js` | Add/remove entry from `FEATURE_LIST` array |

### README & docs updates (ALWAYS REQUIRED)

| File | Section | What to update |
|---|---|---|
| `README.md` | `## ✨ Features` | Add/remove a feature card in the 2×2 table |
| `README.md` | `### Contents` | Add/remove link if you added a section |
| `README.md` | `## ❓ FAQ` | If feature changes behavior users might ask about |
| `docs/USERGUIDE.md` | Feature section | Add/update the feature's usage instructions, tips, and what-to-expect |
| `docs/USERGUIDE.md` | `## Troubleshooting` | If the feature introduces new failure modes |

### CSS (if needed)
- Add styles to `src/content/leanix.css` using `lx-ext-` prefix
- Document the new class in the CSS Classes Reference table in this file

### Feature file template
```js
window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  window.__leanixFeatures__.myFeature = {
    init: function (DOM, settings) {
      // Check for existing element, set up observers, inject button
    },

    addExportButton: function (DOM) {
      // Guard with document.getElementById to prevent duplicates
      // Use DOM.createElement with className for styling
      // Attach click handlers with addEventListener
    },

    // ... export methods
  };

  function createMenuOption(label, onClick) {
    var element = document.createElement("div");
    element.className = "lx-ext-menu-item";
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }
})();
```

### SPA Navigation Pattern (required for every feature)
```js
init: function (DOM, settings) {
  var intersectionObserver = null;

  var observeTarget = function (el) {
    if (intersectionObserver) intersectionObserver.disconnect();
    intersectionObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          // add button, show container
        }
      }
    });
    intersectionObserver.observe(el);
  };

  // Check existing
  var existing = document.querySelector("target-selector");
  if (existing) observeTarget(existing);

  // Watch for re-addition during SPA navigation
  var mutObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && node.matches("target-selector")) {
          observeTarget(node);
          return;
        }
        if (node.querySelectorAll) {
          var found = node.querySelector("target-selector");
          if (found) { observeTarget(found); return; }
        }
      }
    }
  });
  mutObserver.observe(document.body, { childList: true, subtree: true });
}
```

## DOM Utilities API

### `DOMUtils.createElement(tag, attrs, children)`
Creates an element with attributes and children.
```js
var btn = DOMUtils.createElement("button", {
  id: "my-btn",
  className: "lx-ext-btn",       // sets element.className
  textContent: "Click me",       // sets element.textContent
  onClick: function (e) { ... }, // adds click listener (onXxx → xxx)
  "data-foo": "bar"              // fallback: element.setAttribute
}, ["text child", anotherElement]);
```

### `DOMUtils.waitForElement(selector, timeout)`
Returns a Promise that resolves when the element appears in the DOM.
```js
DOMUtils.waitForElement(".my-class", 5000).then(function (el) { ... });
```

### `DOMUtils.isLeanIXPage()`
Returns true if the hostname matches `leanix.net` or `leanix.com`.

### `DOMUtils.getPageType()`
Returns `"factsheet"`, `"inventory"`, `"reports"`, `"dashboard"`, `"search"`, or `"other"`.

## Settings API

```js
SettingsStore.getAll()               // → { features: {...}, theme: "default" }
SettingsStore.getFeature("myFeat")   // → true/false
SettingsStore.isFeatureEnabled("x")  // → true/false
SettingsStore.setFeature("x", false) // → Promise
SettingsStore.setAll({...})          // → Promise
SettingsStore.reset()                // → Promise (restores defaults)
SettingsStore.onChange(callback)     // listens for storage changes
```

## CSS Classes Reference

| Class | Used by | Purpose |
|---|---|---|
| `.lx-ext-container-fixed` | data-export | Fixed bottom-right container (hidden by default) |
| `.lx-ext-container-inline` | print-export, documents-export | Inline container for header button groups |
| `.lx-ext-btn` | data-export | Floating export button (14px, shadow) |
| `.lx-ext-btn-inline` | print-export, documents-export | Header button matching lx-button height (13px, 32px) |
| `.lx-ext-menu` | all three | Dropdown menu base (hidden by default) |
| `.lx-ext-menu-up` | data-export | Menu opens upward (button at bottom of viewport) |
| `.lx-ext-menu-down` | print-export, documents-export | Menu opens downward (button in header) |
| `.lx-ext-menu-item` | all three | Clickable menu option with hover highlight |

## Critical Rules

### Menu visibility toggling
```js
// CORRECT — use a boolean flag to track state
var menuOpen = false;

button.addEventListener("click", function () {
  if (menuOpen) {
    menu.style.display = "none";
    menuOpen = false;
  } else {
    menu.style.display = "block";
    menuOpen = true;
  }
});

// WRONG — element.style.display only reflects INLINE styles, not CSS classes
// If display:none is in a CSS class, style.display returns "" not "none"
if (menu.style.display === "none") { ... }  // BROKEN with CSS classes
```

**Critical:** `element.style.display` reads only inline style values. When `display: none` comes from a CSS class (not an inline `style=` attribute), `element.style.display` is `""` (empty string). Never use `style.display` to check visibility — use a boolean `menuOpen` flag instead.

### Button injection guard
Always check for existing button ID before injecting:
```js
if (document.getElementById("lx-ext-my-btn")) return;
```

### No inline styles
All visual styling goes in `leanix.css`. Use `className` not `style`/`style.cssText`.

### The `matches` guard
When checking `MutationObserver` added nodes, guard `node.matches`:
```js
if (node.matches && node.matches("selector")) { ... }
```
Text nodes and comment nodes don't have `.matches`.

### No data collection
This extension runs entirely in-browser. Never add analytics, telemetry, tracking, or external requests. The Privacy & Data section of README.md makes public promises about this. Do not violate them.

## SheetJS Usage

Library is at `src/shared/xlsx.full.min.js`, registers as `window.XLSX`.

```js
var wb = XLSX.utils.book_new();
var ws = XLSX.utils.aoa_to_sheet([["Col1", "Col2"], ["a", "b"]]);
ws["!cols"] = [{ wch: 20 }, { wch: 40 }];  // column widths
XLSX.utils.book_append_sheet(wb, ws, "SheetName");
var buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
var blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
// ... download via createObjectURL + <a> click
```

## Build Script

`scripts/build.js` creates three zip files in `dist/`:
- `leanix-extension-chrome.zip` — standard MV3 manifest
- `leanix-extension-edge.zip` — identical to Chrome
- `leanix-extension-firefox.zip` — adds `browser_specific_settings.gecko` with `id: "leanix-extension@example.com"`

`dist/` is gitignored.

## Commands

```bash
npm run lint          # Run ESLint on src/
npm run lint:fix      # Auto-fix lint issues
npm run build         # Build store-ready zips for Chrome, Edge, Firefox
```

## LeanIX DOM Reference

### Factsheet / Inventory table pages
- Table element: `lx-factsheets-table` (custom element)
- Inventory Tools button: `.contentWrapper` with `.textContent` span containing "Inventory Tools"
- Native Excel export: `.menuItemWrapper` containing "Export to Excel" text

### Document detail pages
- Document fields: `lx-document-fields-form`
- Header bar: `.headerUpdates`
- Editor blocks: `.editorBlock` with `:scope > .formTitle`
- Rich text editor: `lx-rich-text-editor` > `.ProseMirror`
- Date fields: `lx-document-date-select` > `.formTitle` + `p`
- Fact sheet lists: `lx-document-fact-sheet-list` > `tr.factSheetItem`
- User lists: `lx-document-users-list` > `.selectedUser`
- Close button: `button[aria-label="Close"]`

### Architecture Decisions / document list pages
- Page title: `[data-testid="header-title"]`
- Button container: `.tw-flex.tw-min-h-xxl` > `.tw-flex.tw-gap-xs.tw-text-nowrap`
- Table: `table.table-hover`
- Rows: `tr.documentsItem`
- Columns: `.displayIdColumn`, `.titleColumn a`, `.statusColumn lx-badge span`, `.ownerColumn lx-documents-list-creator span`, `.lastUpdatedColumn span`

## README Sections Reference

When updating the README, these are the sections in order:

1. Logo + Title + Tagline
2. Badge row (version, manifest, license, browsers)
3. Store badges (Chrome, Edge, Firefox "coming soon")
4. Star history link
5. Table of Contents
6. Why Accelerate? (before/after comparison)
7. Features (2×2 card table)
8. Quick Start (clone + install + load steps)
9. Supported Browsers (version table)
10. Commands (lint, build)
11. Contribute (ways, workflow, feature template, code conventions, project map, PR checklist)
12. FAQ (collapsible questions)
13. Privacy & Data
14. Contributors (table with avatars)
15. Security (link to SECURITY.md)
16. License

## User Guide Sections Reference

When updating `docs/USERGUIDE.md`, these are the sections in order:

1. Getting Started (install, popup overview)
2. Feature: Data Export (where, what, how, tips)
3. Feature: Print Export (where, what, included content, tips)
4. Feature: Documents Export (where, what, columns, tips)
5. Full Settings Page
6. Troubleshooting
7. Privacy

Any new feature gets its own section between #4 and #5 above, following the same template pattern (where it works, what it does, how to use with option table, what's included, tips).
