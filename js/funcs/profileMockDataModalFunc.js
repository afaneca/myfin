import { DialogUtils } from "../utils/dialogUtils.js";
import { Localization } from "../utils/localization.js";

export const ProfileMockDataModalFunc = {
  showMockDataConfirmationModal: (modalDivId, callback) => {
    DialogUtils.initStandardModal()
    $(modalDivId).modal('open')
    let txt = `
      <h4>${Localization.getString('profile.demoDataConfirmationTitle')}</h4>
      <div class="row">
          <b>${Localization.getString('profile.demoDataConfirmationSubtitle')}</b>
  
      </div>
      `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
            <a id="action-mock-data-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.confirm')}</a>`
    $(`${modalDivId} .modal-content`).html(txt)
    $(`${modalDivId} .modal-footer`).html(actionLinks)
    $('#action-mock-data-btn').click(() => callback())
  },
}
//# sourceURL=js/funcs/profileMockDataModalFunc.js