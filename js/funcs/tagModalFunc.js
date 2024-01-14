import { Localization } from '../utils/localization.js'
import { ValidationUtils } from '../utils/validationUtils.js'
import { DialogUtils } from '../utils/dialogUtils.js'

export const TagModalFunc = {
  showAddNewTagModal: (modalDiv = '#modal-global', addTagBtnClickCallback) => {
    $('#modal-global').modal('open')
    let txt = `<div class="row">
                    <h4 class="col s8">${Localization.getString(
      'tags.addTagModalTitle')}</h4>
                   
                </div>
                 <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="tag_name" type="text" class="validate">
                            <label for="tag_name">${Localization.getString(
      'tags.name')}</label>
                        </div>  
                     </div>
                     <div class="row">
                        <div class="input-field col s8">
                            <i class="material-icons prefix">description</i>
                            <label for="tag_description">${Localization.getString(
      'common.description')}</label>
                            <textarea id="tag_description" maxlength="50" placeholder="" class="materialize-textarea"></textarea>
                        </div>
                     </div>
                        
                    </form>
                </div>`;
    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
    <a id="modal-add-tag-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.add')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    $('#modal-add-tag-btn').click(() => {
      const name = $("#tag_name").val();
      const description = $("#tag_description").val();
      if(ValidationUtils.checkIfFieldsAreFilled([name])){
        addTagBtnClickCallback(name, description);
      } else {
        DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
      }
    });
  },
  showRemoveTagConfirmationModal: (modalDivId, tagId, removeTagCallback) => {
    $('#modal-global').modal('open')
    let txt = `
      <h4>${Localization.getString('tags.deleteTagModalTitle', { id: tagId })}</h4>
      <div class="row">
          <p>${Localization.getString("tags.deleteTagModalSubtitle")}</p>
          <b>${Localization.getString("tags.deleteTagModalAlert")}</b>
  
      </div>
      `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
            <a id="action-remove-tag-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.delete')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#action-remove-tag-btn').click(() => removeTagCallback(tagId))
  },
  showEditTagModal: (modalDiv = '#modal-global', tagId, tagName, tagDescription, editTagBtnClickCallback) => {
    $('#modal-global').modal('open')
    let txt = `<div class="row">
                    <h4 class="col s8">${Localization.getString(
      'tags.editTagModalTitle')}</h4>
                   
                </div>
                 <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="tag_name" type="text" class="validate">
                            <label for="tag_name" class="active">${Localization.getString(
      'tags.name')}</label>
                        </div>  
                     </div>
                     <div class="row">
                        <div class="input-field col s8">
                            <i class="material-icons prefix">description</i>
                            <label for="tag_description" class="active">${Localization.getString(
      'categories.description')}</label>
                            <textarea id="tag_description" maxlength="50" placeholder="${Localization.getString(
      'common.description')}..." class="materialize-textarea"></textarea>
                        </div>
                     </div>
                        
                    </form>
                </div>`;
    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
    <a id="modal-edit-tag-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.edit')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    $('#modal-edit-tag-btn').click(() => {
      const name = $("#tag_name").val();
      const description = $("#tag_description").val();
      if(ValidationUtils.checkIfFieldsAreFilled([name])){
        editTagBtnClickCallback(tagId, name, description);
      } else {
        DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
      }
    });

    // AUTO-FILL INPUTS
    $('input#tag_name').val(tagName)
    $('textarea#tag_description').val(tagDescription)
  },
}