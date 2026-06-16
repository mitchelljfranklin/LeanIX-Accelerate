# LeanIX Accelerate v1.0.0

Initial release — three one-click export features for the LeanIX enterprise architecture platform.

---

## What's Included

### Data Export
Factsheets and Inventory pages get a floating export button in the bottom-right corner. Export table data as JSON with one click, or trigger the native Excel export without navigating menus.

### Document Export
Document detail pages get an inline export button in the document header. Two export options: **Print to PDF** with full formatting (fields, rich text, dates, fact sheet lists, users), or download a structured **Excel workbook** (.xlsx) with the same content broken into sheets.

### Documents List Export
Architecture Decisions and document list pages get an export button in the page header. Downloads the visible document list — ID, Title, Status, Creator, and Last Updated — as a clean Excel spreadsheet.

### Smart Controls
- **Extension popup** — toggle any feature on/off with one click
- **Full settings page** — reset all features to defaults in one click
- Features and their buttons survive LeanIX SPA navigation without page reloads

---

## Technical Details

| Detail | Value |
|---|---|
| Manifest version | V3 |
| Permissions | `storage`, `activeTab` |
| Host permissions | `https://*.leanix.net/*`, `https://*.leanix.com/*` |
| Libraries | SheetJS 0.20.3 (bundled) |
| Min browser | Chrome 88+, Edge 88+ |
| License | GPL v3.0 |

All processing happens in-browser. No telemetry, no tracking, no external requests.

---

## Installation

```bash
git clone https://github.com/mitchelljfranklin/LeanIX-Accelerate.git
cd LeanIX-Accelerate
npm install
```

Then load unpacked:
1. Open `chrome://extensions` in Chrome or Edge
2. Enable **Developer mode**
3. Click **Load unpacked** → select the project folder

---

## Known Limitations

- Firefox support not yet available (Manifest V3 compatibility in progress)
- Print export captures visible DOM only — not a server-side PDF render
- Documents List Export exports the currently visible page only (server-side pagination requires clicking through pages)
- Not yet published on Chrome Web Store or Edge Add-ons (coming soon)

---

## Upcoming

- CSV export option for Data Export
- Firefox compatibility
- Chrome Web Store & Edge Add-ons publication
- Additional LeanIX page support (Reports, Dashboard)
