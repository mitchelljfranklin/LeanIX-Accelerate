window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  const MENU_POLL_INTERVAL_MS = 200;
  const MENU_POLL_MAX_ATTEMPTS = 10;
  const MIN_TABLE_ROWS_FOR_HEADERS = 2;

  window.__leanixFeatures__.dataExport = {
    init: function (DOM, settings) {
      this.addExportButton(DOM);
    },

    addExportButton: function (DOM) {
      let container = null;
      let menu = null;
      let pageType = null;
      let intersectionObserver = null;
      var toggleGuard = false;

      const closeMenu = function () {
        if (menu) menu.style.display = "none";
      };

      document.addEventListener("mousedown", function (event) {
        if (toggleGuard) return;
        if (container && !container.contains(event.target)) {
          closeMenu();
        }
      });

      const ensureContainer = function () {
        if (container) return;
        pageType = DOM.getPageType();

        container = DOM.createElement("div", {
          id: "lx-ext-export-container",
          className: "lx-ext-container-fixed",
        });

        const button = DOM.createElement(
          "button",
          {
            id: "lx-ext-export-btn",
            className: "lx-ext-btn",
          },
          ["\u2B07 Export"]
        );

        menu = DOM.createElement("div", {
          id: "lx-ext-export-menu",
          className: "lx-ext-menu lx-ext-menu-up",
        });

        const exportModule = window.__leanixFeatures__.dataExport;
        const jsonOption = createMenuOption("\u2B07 Export as JSON", function () {
          closeMenu();
          exportModule.exportJSON(pageType);
        });
        const excelOption = createMenuOption("\u2B07 Export to Excel", function () {
          closeMenu();
          exportModule.exportExcel();
        });

        menu.appendChild(jsonOption);
        menu.appendChild(excelOption);

        button.addEventListener("mousedown", function () {
          menu.style.display = menu.style.display === "none" ? "block" : "none";
          toggleGuard = true;
          setTimeout(function () { toggleGuard = false; }, 0);
        });

        container.appendChild(menu);
        container.appendChild(button);
        document.body.appendChild(container);
      };

      const observeTable = function (tableEl) {
        if (intersectionObserver) intersectionObserver.disconnect();
        ensureContainer();

        intersectionObserver = new IntersectionObserver(function (entries) {
          for (const entry of entries) {
            container.style.display = entry.isIntersecting ? "block" : "none";
          }
        });
        intersectionObserver.observe(tableEl);
      };

      const existing = document.querySelector("lx-factsheets-table");
      if (existing) observeTable(existing);

      const mutObserver = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (node.matches && node.matches("lx-factsheets-table")) {
              observeTable(node);
              return;
            }
            if (node.querySelectorAll) {
              const table = node.querySelector("lx-factsheets-table");
              if (table) { observeTable(table); return; }
            }
          }
        }
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    },

    exportJSON: function (pageType) {
      let data;

      if (pageType === "factsheet") {
        data = this.extractFactSheetData();
      } else if (pageType === "inventory") {
        data = this.extractInventoryData();
      } else {
        data = { url: window.location.href, title: document.title };
      }

      this.downloadJSON(data, `leanix-${pageType}-${Date.now()}.json`);
    },

    triggerExport: function (pageType) {
      this.exportJSON(pageType);
    },

    exportExcel: function () {
      const wrappers = document.querySelectorAll(".contentWrapper");
      for (const wrapper of wrappers) {
        const span = wrapper.querySelector(".textContent");
        if (span && /inventory\s+tools/i.test(span.textContent)) {
          wrapper.click();
          break;
        }
      }

      const checkForMenuItem = function (attempts) {
        if (attempts <= 0) return;
        const items = document.querySelectorAll(".menuItemWrapper");
        for (const item of items) {
          const span = item.querySelector("span");
          if (span && /export\s+to\s+excel/i.test(span.textContent)) {
            item.click();
            return;
          }
        }
        setTimeout(function () {
          checkForMenuItem(attempts - 1);
        }, MENU_POLL_INTERVAL_MS);
      };

      checkForMenuItem(MENU_POLL_MAX_ATTEMPTS);
    },

    extractFactSheetData: function () {
      const fields = {};
      const rows = document.querySelectorAll('[class*="field"], [class*="Field"], [class*="attribute"]');
      rows.forEach(function (row) {
        const label = row.querySelector('[class*="label"], [class*="Label"], label, dt');
        const value = row.querySelector('[class*="value"], [class*="Value"], dd, .value');
        if (label && value) {
          fields[label.textContent.trim()] = value.textContent.trim();
        }
      });

      return {
        url: window.location.href,
        title: document.title,
        type: "factsheet",
        exportedAt: new Date().toISOString(),
        fields: fields,
      };
    },

    extractInventoryData: function () {
      const rows = [];
      const tableRows = document.querySelectorAll("table tr, [role='row']");

      if (tableRows.length > MIN_TABLE_ROWS_FOR_HEADERS) {
        const headers = [];
        tableRows[0].querySelectorAll("th, [role='columnheader']").forEach(function (headerCell) {
          headers.push(headerCell.textContent.trim());
        });

        for (let rowIndex = 1; rowIndex < tableRows.length; rowIndex++) {
          const row = {};
          const cells = tableRows[rowIndex].querySelectorAll("td, [role='cell']");
          cells.forEach(function (cell, colIndex) {
            row[headers[colIndex] || `col_${colIndex}`] = cell.textContent.trim();
          });
          if (Object.keys(row).length > 0) rows.push(row);
        }
      }

      return {
        url: window.location.href,
        title: document.title,
        type: "inventory",
        exportedAt: new Date().toISOString(),
        totalRows: rows.length,
        rows: rows,
      };
    },

    downloadJSON: function (data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
      URL.revokeObjectURL(url);
    },
  };

  function createMenuOption(label, onClick) {
    const element = document.createElement("div");
    element.className = "lx-ext-menu-item";
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }
})();
