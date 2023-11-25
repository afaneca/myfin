import { DialogUtils } from "./utils/dialogUtils.js";
import { TableUtils } from "./utils/tableUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { CategoryServices } from "./services/categoryServices.js";
import { StringUtils } from "./utils/stringUtils.js";
import { chartUtils } from "./utils/chartUtils.js";
import { Localization } from "./utils/localization.js";

export const Categories = {
  getCategories: (type = undefined) => {
    LoadingManager.showLoading()
    CategoryServices.getAllCategories(type,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        /*let debitList = []
        let creditList = []

        debitList = response.filter(item => item.type === 'D')
        creditList = response.filter(item => item.type === 'C')*/
        Categories.initMergedTable(response)
        /*Categories.initTables(debitList, creditList)*/
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
      })
  },
  initMergedTable: (catsList) => {
    $('#table-merged-wrapper').
      html(Categories.renderCreditCategoriesTable(catsList))
    TableUtils.setupStaticTable('#debit-categories-table', () => {
      // Click listener for edit cat click
      Categories.bindClickListenersForEditAction()
      // Click listener for edit cat click
      Categories.bindClickListenersForRemoveAction()
    })
    LoadingManager.hideLoading()
  },
  bindClickListenersForEditAction: () => {
    $('.table-action-icons.action-edit-cat').each(function () {
      $(this).on('click', function () {
        Categories.showEditCategoryModal(
          this.dataset.catName,
          this.dataset.catDescription,
          this.dataset.catColorGradient,
          this.dataset.catId,
          this.dataset.catStatus,
          this.dataset.excludeFromBudgets,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    $('.table-action-icons.action-remove-cat').each(function () {
      $(this).on('click', function () {
        Categories.showRemoveCategoryModal(
          this.dataset.catName,
          this.dataset.catId,
        )
      })
    })
  },
  initTables: (debitCatsList, creditCatsList) => {
    $('#table-debit-wrapper').
      html(Categories.renderDebitCategoriesTable(debitCatsList))
    $('#table-crebit-wrapper').
      html(Categories.renderCreditCategoriesTable(creditCatsList))

    TableUtils.setupStaticTable('#debit-categories-table')
    $('select.cat-color-select').select2()

    LoadingManager.hideLoading()
  },
  renderDebitCategoriesTable: (catsList) => {
    return `
            <table id="debit-categories-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Nome</th>
                <th>${Localization.getString('common.description')}</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${catsList.map(cats => Categories.renderCategoriesRow(cats)).join('')}
        </tbody>
        </table>
        `
  },
  renderCreditCategoriesTable: (catsList) => {
    return `
            <table id="debit-categories-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString('categories.color')}</th>
                <th>${Localization.getString('categories.name')}</th>
                <th>${Localization.getString('common.description')}</th>
                <th>${Localization.getString('categories.status')}</th>
                <th>${Localization.getString('common.actions')}</th>
            </tr>
        </thead>
        <tbody>
        ${catsList.map(cats => Categories.renderCategoriesRow(cats)).join('')}
        </tbody>
        </table>
        `
  },
  renderCategoriesRow: cats => {
    return `
            <tr data-id='${cats.category_id}'>
                <td>
                   ${Categories.renderColorColumn(cats.color_gradient)}
                </td>
                <td><div class="myfin-tooltip-trigger">${cats.name} ${cats.exclude_from_budgets === 1
      ? `<a><i class="tiny material-icons hoverable">do_not_disturb_on</i></a><span class="myfin-tooltip-text">${Localization.getString(
        'categories.excludedFromBudgets')}</span>`
      : ''}</div></td>
                <td>${cats.description}</td>
                <td><span class="${(cats.status === 'Ativa')
      ? 'badge green-text text-accent-4'
      : 'badge pink-text text-accent-1'} ">${cats.status}</span></td>
                <td>
                    <i data-cat-name="${StringUtils.escapeHtml(cats.name)}"
                       data-cat-description="${StringUtils.removeLineBreaksFromString(cats.description).replace(/["']/g, '')}"
                       data-cat-color-gradient="${cats.color_gradient}"
                       data-cat-id="${cats.category_id}"
                       data-cat-status="${StringUtils.removeLineBreaksFromString(cats.status).replace(/["']/g, '')}"
                       data-exclude-from-budgets="${cats.exclude_from_budgets}"
                       class="material-icons table-action-icons action-edit-cat">create</i>
                    <i data-cat-name="${StringUtils.escapeHtml(cats.name)}"
                     data-cat-id="${cats.category_id}" 
                     class="material-icons table-action-icons action-remove-cat" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
  },
  renderColorColumn: catColorGradient => {
    return `
            <div style="width:45px;height:25px;" class="${catColorGradient}-bg"></div>
        `
  },
  showAddCategoryModal: () => {
    $('#modal-global').modal('open')
    let txt = `
                <div class="row">
                    <h4 class="col s8">${Localization.getString('categories.addCategoryModalTitle')}</h4>
                    <div class="col s4 right-align">${Categories.renderColorPickerSelect(
      null)}</div>
                </div>
                
                 <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="category_name" type="text" class="validate">
                            <label for="category_name">${Localization.getString('categories.name')}</label>
                        </div>  
                        <div class="input-field col s4">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="category_status_select">
                                <option value="Ativa">${Localization.getString('categories.active')}</option>
                                <option value="Inativa">${Localization.getString('categories.inactive')}</option>
                            </select>
                            <label>${Localization.getString('categories.status')}</label>
                        </div>
                     </div>
                     <div class="row">
                        <div class="input-field col s9">
                            <i class="material-icons prefix">description</i>
                            <label for="category_description" class="active">${Localization.getString('categories.description')}</label>
                            <textarea id="category_description" maxlength="50" placeholder="${Localization.getString('common.description')}..." class="materialize-textarea"></textarea>
                        </div>
                        <div class="input-field col s3">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>${Localization.getString('common.excludeFromBudgets')}</span>
                            </label>
                        </div>
                     </div>
                        
                    </form>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
      'common.cancel')}</a>
    <a id="modal-add-cat-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
      'common.add')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#category_status_select').formSelect()
    $('#modal-add-cat-btn').click(() => Categories.addCategory())
    /*$('#category_type_select').formSelect();*/

    const colorGradientsArr = chartUtils.getColorGradientsArr(null)

    $('select.cat-color-picker-select').select2({
      minimumResultsForSearch: -1,
      data: colorGradientsArr,
      escapeMarkup: function (markup) {
        return markup
      },
      templateResult: function (data) {
        return data.html
      },
      templateSelection: function (data) {
        return data.text
      },
    })
  },
  addCategory: () => {
    const catName = StringUtils.removeLineBreaksFromString(
      $('input#category_name').val())
    const catDescription = StringUtils.removeLineBreaksFromString(
      $('textarea#category_description').val()).replace(/["']/g, '')
    /*const catType = $("select#category_type_select").val()*/
    const catColorGradient = $('select.cat-color-picker-select').val()
    let catNewStatus = $('select#category_status_select').val()
    const excludeFromBudgets = $('#exclude_from_budgets').is(':checked')

    if (!catName || catName === '' /*|| !catType || catType === ""*/) {
      DialogUtils.showErrorMessage(Localization.getString('common.fillAllFieldsTryAgain'))
      return
    }

    LoadingManager.showLoading()
    CategoryServices.addCategory(catName, catDescription, catColorGradient,
      catNewStatus, excludeFromBudgets,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString('categories.categorySuccessfullyAdded'))
        configs.goToPage('categories', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  showRemoveCategoryModal: (catName, catID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString('categories.deleteCategoryModalTitle', { name: catName })}</h4>
                <div class="row">
                    <p>${Localization.getString("categories.deleteCategoryModalSubtitle")}</p>
                    <b>${Localization.getString("categories.deleteCategoryModalAlert")}</b>

                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="modal-remove-cat-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-remove-cat-btn').click(() => Categories.removeCategory(catID))
    /* $('#category_type_select').formSelect();*/
  },
  removeCategory: (catID) => {
    if (!catID) {
      return
    }

    LoadingManager.showLoading()
    CategoryServices.removeCategory(catID,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("categories.categorySuccessfullyDeleted"))
        configs.goToPage('categories', null, true)
      }),
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      }
  },
  showEditCategoryModal: (
    catName, catDescription, catColorGradient, catID, catStatus, excludeFromBudgets) => {
    $('#modal-global').modal('open')
    let txt = `
                <div class="row">
                    <h4 class="col s8">${Localization.getString("categories.editCategoryModalTitle")}</h4>
                    <div class="col s4 right-align">${Categories.renderColorPickerSelect()}</div>
                </div>
                <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="category_name" type="text" class="validate">
                            <label for="category_name" class="active">${Localization.getString("categories.name")}</label>
                        </div>
                        <div class="input-field col s4">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="category_status_select">
                                <option value="" disabled selected>${Localization.getString("common.chooseAnOption")}</option>
                                <option ${(catStatus === 'Ativa')
      ? 'selected'
      : ''} value="Ativa">${Localization.getString("categories.active")}</option>
                                <option ${(catStatus === 'Inativa')
      ? 'selected'
      : ''} value="Inativa">${Localization.getString("categories.inactive")}</option>
                            </select>
                            <label>${Localization.getString("categories.status")}</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s9">
                            <i class="material-icons prefix">description</i>
                            <label for="category_description" class="active">${Localization.getString("categories.description")}</label>
                            <textarea id="category_description" maxlength="50" placeholder="${Localization.getString('common.description')}..." class="materialize-textarea"></textarea>
                        </div>
                        <div class="input-field col s3">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>${Localization.getString("common.excludeFromBudgets")}</span>
                            </label>
                        </div>
                    </div>                        
                </form>
            </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="modal-edit-cat-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.edit")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-edit-cat-btn').click(() => Categories.editCategory(catID))
    /*$('#category_type_select').formSelect();*/

    // AUTO-FILL INPUTS
    $('input#category_name').val(catName)
    $('textarea#category_description').val(catDescription)
    $('#category_status_select').formSelect()

    if (excludeFromBudgets === 1) {
      $('input#exclude_from_budgets').prop('checked', 'checked')
    }
    //$(`select#category_type_select_edit
    // option[value='${catType}']`).prop('selected', 'selected')
    // $('select#category_type_select').find('option[value=' + catType +
    // ']').prop('selected', true).trigger('change');

    const colorGradientsArr = chartUtils.getColorGradientsArr(catColorGradient)

    $('select.cat-color-picker-select').select2({
      minimumResultsForSearch: -1,
      data: colorGradientsArr,
      escapeMarkup: function (markup) {
        return markup
      },
      templateResult: function (data) {
        return data.html
      },
      templateSelection: function (data) {
        return data.text
      },
    })
  },
  renderColorPickerSelect: cat => {
    return `
            <style>
                /* Height fix for select2 */
                .select2-container .select2-selection--single, .select2-container--default .select2-selection--single .select2-selection__rendered, .select2-container--default .select2-selection--single .select2-selection__arrow {
                    height: 50px;
                }
                
                .select2-container--default .select2-selection--single .select2-selection__rendered {
                    line-height: 75px;
                }
            </style>
            <select style="width: 107px;" class="cat-color-picker-select">
                
            </select>
        `
  },
  editCategory: (catID) => {
    const catName = $('input#category_name').val()
    const catDescription = $('textarea#category_description').val()
    /* const catType = $("select#category_type_select").val()*/
    let catNewColorGradient = $('select.cat-color-picker-select').val()
    const excludeFromBudgets = $('#exclude_from_budgets').is(':checked')
    if (!catNewColorGradient) {
      catNewColorGradient = 'red-gradient'
    }
    let catNewStatus = $('select#category_status_select').val()

    if (!catName || catName === '' /*|| !catType || catType === ""*/) {
      DialogUtils.showErrorMessage(Localization.getString("common.fillAllFieldsTryAgain"))
      return
    }

    LoadingManager.showLoading()
    CategoryServices.editCategory(catID, catName, catDescription,
      catNewColorGradient, catNewStatus, excludeFromBudgets,
      () => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("categories.categorySuccessfullyUpdated"))
        configs.goToPage('categories', null, true)
      },
      () => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}

//# sourceURL=js/categories.js