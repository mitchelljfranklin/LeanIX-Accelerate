# AGENTS

## Project

LeanIX Accelerate — a Chrome Manifest V3 browser extension that injects custom export, print, and productivity features into the LeanIX enterprise architecture platform. Targets `https://*.leanix.net/*` and `https://*.leanix.com/*`.

## Tech Stack

- **Runtime:** Browser extension, no bundler — raw JS files loaded in manifest order
- **JS Style:** ES5-compatible `function` declarations inside IIFEs, `const`/`let` for variables, no arrow functions in object methods
- **CSS:** Single file `src/content/leanix.css`, all classes prefixed `lx-ext-`, no inline styles
- **Lint:** ESLint + Prettier (`npm run lint`)
- **Node:** >= 18 (dev tooling only, not needed at runtime)

## How the Extension Works

```
Page load → content scripts injected (in manifest order)
  → storage.js loads first (defines SettingsStore)
  → dom-utils.js loads second (defines DOMUtils)
  → xlsx.full.min.js loads third (defines window.XLSX)
  → feature files load (each registers on window.__leanixFeatures__)
  → index.js runs last:
      1. Checks ifLeanIXPage()
      2. Reads SettingsStore.getAll()
      3. Iterates featureOrder, calls init() on each enabled feature
```

Each feature sets up `MutationObserver` + `IntersectionObserver` to inject buttons that survive SPA navigation.

## Adding a Feature

### Step 1: Create the feature file
```
src/content/features/<name>.js
```

Template:
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

### Step 2: Register in 6 files
| File | What to add |
|---|---|
| `manifest.json` | Add script to `content_scripts[0].js` array (before `index.js`) |
| `src/content/index.js` | Add key to `featureOrder` array |
| `src/background/service-worker.js` | Add `featureName: true` to default `features` object |
| `src/shared/storage.js` | Add `featureName: true` to `FEATURE_DEFAULTS` object |
| `src/popup/popup.js` | Add entry to `FEATURE_LIST` array |
| `src/options/options.js` | Add entry to `FEATURE_LIST` array |

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
// CORRECT — must use explicit value to override CSS class
menu.style.display = "block";   // show
menu.style.display = "none";    // hide

// WRONG — empty string defers to CSS class which has display:none
menu.style.display = "";        // menu stays hidden!
```

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
- `leanix-extension-firefox.zip` — adds `browser_specific_settings.gecko`

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
