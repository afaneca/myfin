'use strict';

const TextareaShortcuts = {
  setupTextareaShortcut: (textareaId, shortcutId, shortcutText) => {
    $(shortcutId)
      .click(function () {
        const currentCursorPos = document.getElementById(textareaId.replace('#', '')).selectionStart;
        const currentText = $(textareaId)
          .val();
        $(textareaId)
          .val(currentText.slice(0, currentCursorPos) + shortcutText + currentText.slice(currentCursorPos));
      });
  }
};

//# sourceURL=js/components/textareaShortcuts.js