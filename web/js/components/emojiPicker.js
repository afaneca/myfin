export function buildEmojiPicker (containerId, triggerId, onEmojiClicked, hideByDefault = true) {
  let html = `
    <div id="emoji-picker-tooltip" style="z-index: 9999; position: absolute !important;">
        <emoji-picker></emoji-picker>
    </div>
  `
  $(containerId).html(html)
  setupEmojiPicker(triggerId, '#emoji-picker-tooltip', 'emoji-picker', onEmojiClicked, hideByDefault)
}

function setupEmojiPicker (triggerId, tooltipId, pickerId, onEmojiClicked, hideByDefault = true) {
  document.querySelector(pickerId).removeEventListener('emoji-click', callback)
  document.querySelector(pickerId).addEventListener('emoji-click', callback)

  function callback (event) {
    onEmojiClicked(event.detail.unicode)
    toggleEmojiTooltipVisibility(tooltipId, false)
  }

  // manage tooltip visibility
  $(document).click(function (e) {
    if ($(e.target).is(triggerId)) {
      toggleEmojiTooltipVisibility(tooltipId, true)
    }
    else if (!$(e.target).is(tooltipId) && $(e.target).closest(tooltipId).length === 0) {
      // hide tooltip when clicking anywhere outside the tooltip
      toggleEmojiTooltipVisibility(tooltipId, false)
    }
  })

  if (hideByDefault) {
    toggleEmojiTooltipVisibility(tooltipId, false)
  }
}

function toggleEmojiTooltipVisibility (tooltipId, isToShow = undefined) {
  if (isToShow) {
    $(tooltipId).slideDown()
  }
  else {
    $(tooltipId).slideUp()
  }

}

//# sourceURL=js/components/emojiPicker.js