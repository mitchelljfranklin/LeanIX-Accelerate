var ModalUtils = (function () {
  "use strict";

  var OVERLAY_ID = "lx-ext-modal-overlay";

  function createOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "lx-ext-modal-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.zIndex = "9999998";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "flex-start";
    overlay.style.paddingTop = "8vh";
    overlay.style.background = "rgba(0, 0, 0, 0.4)";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.transition = "opacity 0.2s";
    document.body.appendChild(overlay);
    return overlay;
  }

  function removeOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function ModalInstance(options) {
    var overlay = createOverlay();
    var dialogEl = null;
    var closeButton = null;
    var headerEl = null;
    var titleEl = null;
    var contentEl = null;
    var footerEl = null;
    var cancelBtn = null;
    var confirmBtn = null;
    var self = this;
    var destroyed = false;

    var defaultOptions = {
      title: "",
      width: "600px",
      closable: true,
      onClose: undefined,
      footer: true,
    };

    options = options || {};

    function getOption(key) {
      return options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    function build() {
      dialogEl = document.createElement("div");
      dialogEl.className = "lx-ext-modal";
      dialogEl.setAttribute("role", "dialog");
      dialogEl.style.position = "relative";
      dialogEl.style.background = "#fff";
      dialogEl.style.borderRadius = "6px";
      dialogEl.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
      dialogEl.style.display = "flex";
      dialogEl.style.flexDirection = "column";
      dialogEl.style.overflow = "hidden";
      dialogEl.style.minWidth = getOption("width");
      dialogEl.style.maxWidth = getOption("width");

      if (getOption("closable")) {
        closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "lx-ext-modal-close";
        closeButton.setAttribute("aria-label", "Close");
        closeButton.style.position = "absolute";
        closeButton.style.top = "8px";
        closeButton.style.right = "8px";
        closeButton.style.width = "28px";
        closeButton.style.height = "28px";
        closeButton.style.background = "none";
        closeButton.style.border = "none";
        closeButton.style.fontSize = "18px";
        closeButton.style.color = "#888";
        closeButton.style.cursor = "pointer";
        closeButton.style.borderRadius = "4px";
        closeButton.style.display = "flex";
        closeButton.style.alignItems = "center";
        closeButton.style.justifyContent = "center";
        closeButton.style.zIndex = "1";
        closeButton.innerHTML = "\u00D7";
        closeButton.addEventListener("click", function () {
          self.hide();
          if (typeof getOption("onClose") === "function") {
            getOption("onClose")();
          }
        });
        dialogEl.appendChild(closeButton);
      }

      if (getOption("title")) {
        headerEl = document.createElement("div");
        headerEl.className = "lx-ext-modal-header";
        headerEl.style.padding = "18px 24px 14px";
        headerEl.style.borderBottom = "1px solid #e8e8e8";
        titleEl = document.createElement("h2");
        titleEl.className = "lx-ext-modal-title";
        titleEl.style.fontSize = "18px";
        titleEl.style.fontWeight = "600";
        titleEl.style.color = "#222";
        titleEl.style.margin = "0";
        titleEl.textContent = getOption("title");
        headerEl.appendChild(titleEl);
        dialogEl.appendChild(headerEl);
      }

      contentEl = document.createElement("div");
      contentEl.className = "lx-ext-modal-content";
      contentEl.style.padding = "20px 24px";
      contentEl.style.fontSize = "14px";
      contentEl.style.color = "#333";
      contentEl.style.lineHeight = "1.5";
      contentEl.style.overflowY = "auto";
      contentEl.style.maxHeight = "60vh";

      if (options.content) {
        setContent(options.content);
      }

      dialogEl.appendChild(contentEl);

      if (getOption("footer") !== false) {
        footerEl = document.createElement("div");
        footerEl.className = "lx-ext-modal-footer";
        footerEl.style.display = "flex";
        footerEl.style.justifyContent = "flex-end";
        footerEl.style.gap = "8px";
        footerEl.style.padding = "14px 24px";
        footerEl.style.borderTop = "1px solid #e8e8e8";

        var footerConfig = typeof options.footer === "object" ? options.footer : {};
        var showCancel = footerConfig.cancelText !== undefined || options.cancelText;
        var showConfirm = footerConfig.confirmText !== undefined || options.confirmText !== undefined || !options.cancelText;

        if (showCancel) {
          var cancelLabel = footerConfig.cancelText || options.cancelText || "Cancel";
          cancelBtn = document.createElement("button");
          cancelBtn.type = "button";
          cancelBtn.className = "lx-ext-btn-cancel";
          cancelBtn.style.padding = "8px 20px";
          cancelBtn.style.fontSize = "14px";
          cancelBtn.style.fontWeight = "500";
          cancelBtn.style.background = "#f5f6fa";
          cancelBtn.style.color = "#555";
          cancelBtn.style.border = "1px solid #ddd";
          cancelBtn.style.borderRadius = "4px";
          cancelBtn.style.cursor = "pointer";
          cancelBtn.textContent = cancelLabel;
          cancelBtn.addEventListener("click", function () {
            var onCancel = footerConfig.onCancel || options.onCancel;
            if (typeof onCancel === "function") {
              onCancel();
            }
            self.hide();
          });
          footerEl.appendChild(cancelBtn);
        }

        if (showConfirm) {
          var confirmLabel = footerConfig.confirmText || options.confirmText || "OK";
          confirmBtn = document.createElement("button");
          confirmBtn.type = "button";
          confirmBtn.className = "lx-ext-btn-confirm";
          if (footerConfig.confirmClass || options.confirmClass) {
            confirmBtn.className += " " + (footerConfig.confirmClass || options.confirmClass);
          }
          confirmBtn.style.padding = "8px 20px";
          confirmBtn.style.fontSize = "14px";
          confirmBtn.style.fontWeight = "500";
          confirmBtn.style.background = "#5c6ac4";
          confirmBtn.style.color = "#fff";
          confirmBtn.style.border = "none";
          confirmBtn.style.borderRadius = "4px";
          confirmBtn.style.cursor = "pointer";
          confirmBtn.textContent = confirmLabel;
          confirmBtn.addEventListener("click", function () {
            var onConfirm = footerConfig.onConfirm || options.onConfirm;
            var hide = true;
            if (typeof onConfirm === "function") {
              hide = onConfirm() !== false;
            }
            if (hide) {
              self.hide();
            }
          });
          footerEl.appendChild(confirmBtn);
        }

        dialogEl.appendChild(footerEl);
      }

      overlay.appendChild(dialogEl);

      overlay.addEventListener("click", function (event) {
        if (event.target !== overlay) return;
        if (!getOption("closable")) return;
        self.hide();
        if (typeof getOption("onClose") === "function") {
          getOption("onClose")();
        }
      });
    }

    function setContent(newContent) {
      while (contentEl.firstChild) {
        contentEl.removeChild(contentEl.firstChild);
      }
      if (typeof newContent === "string") {
        contentEl.innerHTML = newContent;
      } else if (newContent && newContent.nodeType) {
        contentEl.appendChild(newContent);
      }
    }

    this.show = function () {
      if (destroyed) return;
      if (!dialogEl) build();
      overlay.classList.add("lx-ext-modal-visible");
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    };

    this.hide = function () {
      if (destroyed) return;
      overlay.classList.remove("lx-ext-modal-visible");
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    };

    this.destroy = function () {
      if (destroyed) return;
      this.hide();
      removeOverlay();
      destroyed = true;
    };

    this.setTitle = function (title) {
      if (!titleEl) return;
      titleEl.textContent = title;
    };

    this.setContent = function (newContent) {
      if (!contentEl) return;
      setContent(newContent);
    };

    this.setConfirmText = function (text) {
      if (!confirmBtn) return;
      confirmBtn.textContent = text;
    };

    this.setCancelText = function (text) {
      if (!cancelBtn) return;
      cancelBtn.textContent = text;
    };

    this.setConfirmEnabled = function (enabled) {
      if (!confirmBtn) return;
      confirmBtn.disabled = !enabled;
    };

    this.getElement = function () {
      return dialogEl;
    };
  }

  return {
    create: function (options) {
      return new ModalInstance(options);
    },

    show: function (options) {
      var modal = new ModalInstance(options);
      modal.show();
      return modal;
    },
  };
})();
