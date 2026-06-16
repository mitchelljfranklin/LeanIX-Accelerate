window.__leanixFeatures__ = window.__leanixFeatures__ || {};

(function () {
  "use strict";

  var STORAGE_KEY = "leanix_last_seen_version";

  window.__leanixFeatures__.updateNotification = {
    init: function (DOM, settings) {
      try {
        var currentVersion = chrome.runtime.getManifest().version;

        chrome.storage.sync.get(STORAGE_KEY, function (result) {
          var lastSeen = result[STORAGE_KEY] || "";

          if (lastSeen === currentVersion) return;

          showChangelog(currentVersion);
          chrome.storage.sync.set({ [STORAGE_KEY]: currentVersion });
        });
      } catch (e) {
        // Ignore — modal.js may not be loaded or getManifest unavailable
      }
    },

    testReset: function () {
      chrome.storage.sync.remove(STORAGE_KEY, function () {
        ModalUtils.show({
          title: "Test Reset",
          content: "Last seen version cleared. Reload the page to see the update notification.",
          footer: { confirmText: "OK" },
        });
      });
    },
  };

  function showChangelog(version) {
    var entry = CHANGELOG[version];
    if (!entry) return;

    var contentHtml = "<p>" + entry.title + "</p>";
    contentHtml += '<ul style="list-style-type:disc;padding-left:20px;">';
    entry.changes.forEach(function (change) {
      contentHtml += "<li>" + change + "</li>";
    });
    contentHtml += "</ul>";

    ModalUtils.show({
      title: "What\u2019s New",
      content: contentHtml,
      footer: {
        confirmText: "Got it",
      },
    });
  }

  var CHANGELOG = {
    "1.0.0": {
      title: "LeanIX Accelerate is here! Here\u2019s what\u2019s included in the initial release:",
      changes: [
        "Floating Data Export button on Factsheet and Inventory pages — export as JSON or Excel in one click",
        "Document Print Export — print formatted documents to PDF from any document detail page",
        "Documents List Export — download Architecture Decision lists as Excel spreadsheets",
        "Extension popup with one-click feature toggles",
        "Full settings page with reset-to-defaults",
      ],
    },
    "1.0.5": {
      title: "v1.0.5 brings new utilities and polish:",
      changes: [
        "ModalUtils — uniform modal dialog system for notifications and confirmations",
        "Update Notification feature — see what\u2019s new after each update",
        "Disclaimer on options page now matches README",
        "Bug fix: Export button no longer appears on Surveys pages",
        "All modal elements use inline styles to prevent platform CSS conflicts",
      ],
    },
  };
})();
