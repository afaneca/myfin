export const MenuUtils = {
  changeActiveMenu (item) {
    $('.menu-item').each(function () {

      var itemID = $(this)[0].id
      var itemName = itemID.replace(/menu-item-/g, '')
      if (itemName === item) {
        $('#' + itemID).removeClass('side-nav-menu-inactive')
        $('#' + itemID).addClass('side-nav-menu-active')
      }
      else {
        $('#' + itemID).addClass('side-nav-menu-inactive')
        $('#' + itemID).removeClass('side-nav-menu-active')
      }
    })
  },
}

window.MenuUtils = MenuUtils