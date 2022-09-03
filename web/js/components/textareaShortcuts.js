export const TextareaShortcuts = {
  /**
   * Binds a click listener to shortcutId and appends content to textarea at current cursor position when triggered
   * @param textareaId
   * @param shortcutId
   * @param shortcutText
   */
  setupTextareaShortcut: (textareaId, shortcutId, shortcutText) => {
    $(shortcutId)
      .click(() => TextareaShortcuts.addShortcutToTextarea(textareaId, shortcutText));
  },
  /**
   * Appends content to textarea at current cursor position when triggered
   * @param textareaId
   * @param shortcutText
   */
  addShortcutToTextarea: (textareaId, shortcutText) => {
    const currentCursorPos = document.getElementById(textareaId.replace('#', '')).selectionStart;
    const currentText = $(textareaId)
      .val();
    $(textareaId)
      .val(currentText.slice(0, currentCursorPos) + shortcutText + currentText.slice(currentCursorPos))
      .focus();
  },
};

//# sourceURL=js/components/textareaShortcuts.js