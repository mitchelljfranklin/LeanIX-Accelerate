# ModalUtils

Configurable modal dialog helper for uniform notifications, confirmations, and custom content within the LeanIX Accelerate extension.

---

## API

### `ModalUtils.show(options)`
Creates and immediately displays a modal. Returns the modal instance.

### `ModalUtils.create(options)`
Creates a modal instance without showing it. Call `.show()` to display.

---

## Options

| Option     | Type     | Default   | Description                    |                             |
| ------------| ----------| -----------| --------------------------------| -----------------------------|
| `title`    | string   | `""`      | Header title text              |                             |
| `content`  | string \ | Element   | —                              | Body content                |
| `width`    | string   | `"600px"` | `min-width` and `max-width`    |                             |
| `closable` | bool     | `true`    | Show close (×) button          |                             |
| `footer`   | bool \   | object    | `true`                         | `false` to hide all buttons |
| `onClose`  | function | —         | Called when close × is clicked |                             |

### Footer Object

| Key | Type | Default | Description |
|---|---|---|---|
| `cancelText` | string | `"Cancel"` | Cancel button label |
| `confirmText` | string | `"OK"` | Confirm button label |
| `confirmClass` | string | — | Extra CSS class on confirm button (e.g. `"lx-ext-btn-danger"`) |
| `onCancel` | function | — | Called when cancel is clicked (modal always hides after) |
| `onConfirm` | function | — | Called when confirm is clicked. Modal hides after unless callback returns `false` |

---

## Instance Methods

| Method | Description |
|---|---|
| `.show()` | Display the modal |
| `.hide()` | Hide the modal (does not remove from DOM) |
| `.destroy()` | Hide and remove from DOM |
| `.setTitle(text)` | Update header title |
| `.setContent(htmlOrElement)` | Replace body content |
| `.setConfirmText(text)` | Update confirm button label |
| `.setCancelText(text)` | Update cancel button label |
| `.setConfirmEnabled(bool)` | Enable/disable confirm button |
| `.getElement()` | Returns the modal `<div>` |

---

## Generated HTML

### Notification (single OK button)

```js
ModalUtils.show({
  title: "Export Complete",
  content: "Your file has been downloaded successfully.",
  footer: {
    confirmText: "OK",
    onConfirm: function () { console.log("acknowledged"); }
  }
});
```

Produces:

```html
<!-- Injected into document.body -->
<div id="lx-ext-modal-overlay" class="lx-ext-modal-overlay lx-ext-modal-visible" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999998;display:flex;justify-content:center;align-items:flex-start;padding-top:8vh;background:rgba(0,0,0,0.4);opacity:1;pointer-events:auto;transition:opacity 0.2s;">
  <div class="lx-ext-modal" role="dialog" style="position:relative;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;min-width:600px;max-width:600px;">
    <button type="button" class="lx-ext-modal-close" aria-label="Close" style="position:absolute;top:8px;right:8px;width:28px;height:28px;background:none;border:none;font-size:18px;color:#888;cursor:pointer;border-radius:4px;display:flex;align-items:center;justify-content:center;z-index:1;">&times;</button>

    <div class="lx-ext-modal-header" style="padding:18px 24px 14px;border-bottom:1px solid #e8e8e8;">
      <h2 class="lx-ext-modal-title" style="font-size:18px;font-weight:600;color:#222;margin:0;">Export Complete</h2>
    </div>

    <div class="lx-ext-modal-content" style="padding:20px 24px;font-size:14px;color:#333;line-height:1.5;overflow-y:auto;max-height:60vh;">
      Your file has been downloaded successfully.
    </div>

    <div class="lx-ext-modal-footer" style="display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid #e8e8e8;">
      <button type="button" class="lx-ext-btn-confirm" style="padding:8px 20px;font-size:14px;font-weight:500;background:#5c6ac4;color:#fff;border:none;border-radius:4px;cursor:pointer;">OK</button>
    </div>
  </div>
</div>
```

### Confirmation (cancel + confirm)

```js
ModalUtils.show({
  title: "Confirm Delete",
  content: "This action cannot be undone. Continue?",
  footer: {
    cancelText: "Cancel",
    confirmText: "Delete",
    confirmClass: "lx-ext-btn-danger",
    onCancel: function () { console.log("cancelled"); },
    onConfirm: function () {
      console.log("deleting...");
    }
  }
});
```

Produces:

```html
<div id="lx-ext-modal-overlay" class="lx-ext-modal-overlay lx-ext-modal-visible" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999998;display:flex;justify-content:center;align-items:flex-start;padding-top:8vh;background:rgba(0,0,0,0.4);opacity:1;pointer-events:auto;transition:opacity 0.2s;">
  <div class="lx-ext-modal" role="dialog" style="position:relative;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;min-width:600px;max-width:600px;">
    <button type="button" class="lx-ext-modal-close" aria-label="Close" style="position:absolute;top:8px;right:8px;width:28px;height:28px;background:none;border:none;font-size:18px;color:#888;cursor:pointer;border-radius:4px;display:flex;align-items:center;justify-content:center;z-index:1;">&times;</button>

    <div class="lx-ext-modal-header" style="padding:18px 24px 14px;border-bottom:1px solid #e8e8e8;">
      <h2 class="lx-ext-modal-title" style="font-size:18px;font-weight:600;color:#222;margin:0;">Confirm Delete</h2>
    </div>

    <div class="lx-ext-modal-content" style="padding:20px 24px;font-size:14px;color:#333;line-height:1.5;overflow-y:auto;max-height:60vh;">
      This action cannot be undone. Continue?
    </div>

    <div class="lx-ext-modal-footer" style="display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid #e8e8e8;">
      <button type="button" class="lx-ext-btn-cancel" style="padding:8px 20px;font-size:14px;font-weight:500;background:#f5f6fa;color:#555;border:1px solid #ddd;border-radius:4px;cursor:pointer;">Cancel</button>
      <button type="button" class="lx-ext-btn-confirm lx-ext-btn-danger" style="padding:8px 20px;font-size:14px;font-weight:500;background:#5c6ac4;color:#fff;border:none;border-radius:4px;cursor:pointer;">Delete</button>
    </div>
  </div>
</div>
```

### No footer (content only)

```js
ModalUtils.show({
  title: "About LeanIX Accelerate",
  content: "<strong>Disclaimer:</strong> LeanIX Accelerate is an independent, community-built extension. SAP LeanIX has no association with this extension and does not sanction its use. Use at your own discretion.",
  footer: false
});
```

Produces:

```html
<div id="lx-ext-modal-overlay" class="lx-ext-modal-overlay lx-ext-modal-visible" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999998;display:flex;justify-content:center;align-items:flex-start;padding-top:8vh;background:rgba(0,0,0,0.4);opacity:1;pointer-events:auto;transition:opacity 0.2s;">
  <div class="lx-ext-modal" role="dialog" style="position:relative;background:#fff;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;min-width:600px;max-width:600px;">
    <button type="button" class="lx-ext-modal-close" aria-label="Close" style="position:absolute;top:8px;right:8px;width:28px;height:28px;background:none;border:none;font-size:18px;color:#888;cursor:pointer;border-radius:4px;display:flex;align-items:center;justify-content:center;z-index:1;">&times;</button>

    <div class="lx-ext-modal-header" style="padding:18px 24px 14px;border-bottom:1px solid #e8e8e8;">
      <h2 class="lx-ext-modal-title" style="font-size:18px;font-weight:600;color:#222;margin:0;">About LeanIX Accelerate</h2>
    </div>

    <div class="lx-ext-modal-content" style="padding:20px 24px;font-size:14px;color:#333;line-height:1.5;overflow-y:auto;max-height:60vh;">
      <strong>Disclaimer:</strong> LeanIX Accelerate is an independent, community-built extension. SAP LeanIX has no association with this extension and does not sanction its use. Use at your own discretion.
    </div>
  </div>
</div>
```

---

## CSS Reference

| Class | Purpose |
|---|---|
| `.lx-ext-modal-overlay` | Full-screen backdrop, hidden by default |
| `.lx-ext-modal-visible` | Toggled on overlay to show (fade + pointer-events) |
| `.lx-ext-modal` | White dialog container with shadow |
| `.lx-ext-modal-close` | Close (×) button, top-right |
| `.lx-ext-modal-header` | Header row with bottom border |
| `.lx-ext-modal-title` | Title heading |
| `.lx-ext-modal-content` | Scrollable body area |
| `.lx-ext-modal-footer` | Right-aligned button group with top border |
| `.lx-ext-btn-cancel` | Light/outline cancel button |
| `.lx-ext-btn-confirm` | Primary confirm button (#5c6ac4) |

All CSS lives in `src/content/leanix.css` section 6 — Modal Dialog.
