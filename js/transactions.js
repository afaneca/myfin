import { LayoutUtils } from './utils/layoutUtils.js'
import { LocalDataManager } from './utils/localDataManager.js'
import { ValidationUtils } from './utils/validationUtils.js'
import { DialogUtils } from './utils/dialogUtils.js'
import { PickerUtils } from './utils/pickerUtils.js'
import { TableUtils } from './utils/tableUtils.js'
import { LoadingManager } from './utils/loadingManager.js'
import { TransactionServices } from './services/transactionServices.js'
import { DateUtils } from './utils/dateUtils.js'
import { StringUtils } from './utils/stringUtils.js'
import { Localization } from './utils/localization.js'
import { ToggleComponent } from './components/toggleComponent.js'
import { configs } from './configs.js'
import { TagServices } from './services/tagServices.js'

let transactionsTableInstance = null

export var Transactions = {
  setupTransactionsTable: (fetchLimit = MYFIN.TRX_FETCH_LIMIT) => {
    let resetFilters = configs.getUrlArgs()?.hasOwnProperty('resetFilters') ??
      false
    $('#table-transactions-wrapper').html(Transactions.renderTable())
    if (resetFilters) TableUtils.resetDynamicTableState(
      transactionsTableInstance, true)
    transactionsTableInstance = TableUtils.setupDynamicTable(
      '#transactions-table',
      fetchLimit,
      Transactions.getColumnsRenderingArray(),
      (page, searchQuery, callback) => {
        LoadingManager.showLoading()
        TransactionServices.getTransactionsByPage(page, fetchLimit,
          searchQuery,
          (resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            callback({
              data: resp.results,
              recordsTotal: resp.total_count,
              recordsFiltered: resp.filtered_count,
            })
          }, (err) => {LoadingManager.hideLoading()})
      }, () => {
        // Click listener for edit trx click
        Transactions.bindClickListenersForEditAction()
        // Click listener for delete trx click
        Transactions.bindClickListenersForRemoveAction()
      }, null, {},
    )
  },
  getColumnsRenderingArray: () => {
    return [
      {
        data: Transactions.buildDateColumnForTable,
      },
      {
        data: Transactions.buildFlowColumnForTable,
      },
      {
        data: Transactions.buildDescriptionColumnForTable,
      },
      {
        data: Transactions.buildAmountColumnForTable,
      }, {
        data: Transactions.buildActionsColumnForTable,
      }]
  },
  buildDateColumnForTable: (trx, type, val, meta) =>
    `<div style="text-align: center;">
        <span><b>${DateUtils.getDayNumberFromUnixTimestamp(trx.date_timestamp)}</b></span><br>
        ${DateUtils.getMonthShortStringFromUnixTimestamp(
      trx.date_timestamp)} '${DateUtils.getShortYearFromUnixTimestamp(
      trx.date_timestamp)}</div>`,
  buildFlowColumnForTable: (
    trx, type, val, meta) => `${Transactions.formatTypeToString(trx.type,
    trx.account_from_name, trx.account_to_name)}`,
  buildDescriptionColumnForTable: (trx, type, val, meta) => {
    return `${trx.is_essential == true
      ? LayoutUtils.buildEssentialTransactionBadge()
      : ''}  
          ${trx.description}
          <p><i class="inline-icon material-icons">folder_shared</i>  ${(trx.category_name)
      ? trx.category_name
      : `<span class=\'medium-gray-color\'>${Localization.getString(
        'common.noCategory')}</span>`}&nbsp;&nbsp;&nbsp;<i class="inline-icon material-icons">business</i> ${(trx.entity_name)
      ? trx.entity_name
      : `<span class=\'medium-gray-color\'>${Localization.getString(
        'common.noEntity')}</span>`}</p>

        <p>${trx.tags.map((tag) => Transactions.buildTagChipForTable(tag)).
      join('')}</p>`
  },
  buildTagChipForTable: (tag) => {
    return `
      <div class="chip">
        ${tag.name}
      </div>
    `
  },
  buildAmountColumnForTable: (
    trx, type, val, meta) => `${Transactions.formatCurrencyColumn(trx.type,
    StringUtils.formatMoney(trx.amount))}`,
  buildActionsColumnForTable: (trx, type, val, meta) =>
    `<i id="edit-${trx.transaction_id}"
         data-trx-id="${trx.transaction_id}"
         data-trx-amount="${trx.amount}"
         data-date-timestamp="${trx.date_timestamp}"
         data-entity-id="${trx.entity_id ? trx.entity_id : ''}"
         data-category-id="${trx.categories_category_id
      ? trx.categories_category_id
      : ''}"
         data-account-from-id="${trx.accounts_account_from_id
      ? trx.accounts_account_from_id
      : ''}"
         data-account-to-id="${trx.accounts_account_to_id
      ? trx.accounts_account_to_id
      : ''}"
         data-trx-type="${trx.type}"
         data-description="${StringUtils.removeLineBreaksFromString(
      trx.description)}"
         data-tags-array="${encodeURIComponent(JSON.stringify(trx.tags))}"
         data-is-essential="${trx.is_essential}"
         class="material-icons table-action-icons action-edit-trx">create</i>
        <i data-trx-id="${trx.transaction_id}"
          class="material-icons table-action-icons action-delete-trx"
          style="margin-left:10px">delete</i>
    `,
  bindClickListenersForEditAction: () => {
    $('.table-action-icons.action-edit-trx').each(function () {
      $(this).on('click', function () {
        Transactions.showEditTransactionModal(
          this.dataset.trxId,
          this.dataset.trxAmount,
          this.dataset.dateTimestamp,
          this.dataset.entityId,
          this.dataset.categoryId,
          this.dataset.accountFromId,
          this.dataset.accountToId,
          this.dataset.trxType,
          this.dataset.description,
          this.dataset.isEssential,
          JSON.parse(decodeURIComponent(this.dataset.tagsArray)),
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    $('.table-action-icons.action-delete-trx').each(function () {
      $(this).on('click', function () {
        Transactions.showRemoveTransactionModal(this.dataset.trxId)
      })
    })
  },
  renderTable: () => {
    return `
            <table id="transactions-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString('common.date')}</th>
                <th>${Localization.getString('transactions.flow')}</th>
                <th>${Localization.getString('common.description')}</th>
                <th>${Localization.getString('common.value')}</th>
                <th>${Localization.getString('common.actions')}</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
        </table>
        `
  },
  formatCurrencyColumn: (type, formattedCurrencyString) => {
    switch (type) {
      case 'I':
        return `<span style="height: auto !important;font-weight: bold;" class='badge green-text text-accent-6'>${formattedCurrencyString}</span>`
        break
      case 'E':
        return `<span style="height: auto !important;font-weight: bold;" class='badge pink-text text-accent-1'>${formattedCurrencyString}</span>`
        break
      case 'T':
      default:
        return `<spa style="height: auto !important;font-weight: bold;" class='badge orange-text text-accent-2'>${formattedCurrencyString}</span>`
        break
    }
  },
  formatTypeToString: (type, acc_from, acc_to) => {
    //'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5
    // pink-text text-accent-1'
    let str = type

    if (!acc_from || acc_from ==
      '') {
      acc_from = `<span style="color:gray">Conta Externa</span>`
    }
    if (!acc_to || acc_to ==
      '') {
      acc_to = `<span style="color:gray">Conta Externa</span>`
    }

    //return `<span style="height: auto !important;">(${acc_from} <br>⮕
    // ${acc_to})</span></span>`;
    return `<span style="height: auto !important;"><i class="inline-icon material-icons">arrow_back</i>${acc_from}<br><i class="inline-icon material-icons">arrow_forward</i>${acc_to}</span>`

    /*switch (type) {
        case 'I':
            return `<span style="height: auto !important;" class='badge green lighten-5 green-text text-accent-6'>(${acc_from} ⮕ ${acc_to})</span></span>`
            break;
        case 'E':
            return `<span style="height: auto !important;" class='badge pink lighten-5 pink-text text-accent-1'>(${acc_from} ⮕ ${acc_to})</span>`
            break;
        case 'T':
            return `<spa style="height: auto !important;"n class='badge brown darken-2 white-text text-accent-2'>(${acc_from} ⮕ ${acc_to})</span>`
            break;
    }


    return `<span style="height: auto !important;" class='badge brown darken-2 white-text text-accent-2'>(${acc_from} ⮕ ${acc_to})</span>`*/

    /* return str; */
  },
  showAddTransactionModal: () => {
    LoadingManager.showLoading()
    const lastTrxInputData = LocalDataManager.getLastTrxInputData()
    TransactionServices.getAddTransactionStep0(
      (response) => {
        LoadingManager.hideLoading()
        const entitiesArr = response['entities']
        const categoriesArr = response['categories']
        const typesArr = response['type']
        const accountsArr = response['accounts']
        const tagsArr = response['tags']

        $('#modal-global').modal('open')
        let txt = `
                <div class="row row-no-margin-bottom">
                    <div class="input-field col s6">
                        <h4>${Localization.getString(
          'transactions.addNewTransaction')}</h4>
                        <p id="cb-essential-wrapper" class="scale-transition scale-out">
                          <label>
                            <input id="cb-essential" type="checkbox" class="checkbox-indigo filled-in" />
                            <span>${Localization.getString(
          'transactions.essential')}</span>
                          </label>
                        </p>
                    </div>
                    <div class="input-field" style="float:right;display: grid;margin-bottom: 0px !important;">
                        <span class="select2-top-label col s12" style="float:right;text-align: end;width: fit-content;">${Localization.getString(
          'investments.typeOfTransaction')}</span>
                        <div id="type-toggle-wrapper" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                        <a id="auto-categorize-btn" class="waves-effect waves-light btn purple-gradient-bg scale-transition scale-out"
                        style="margin: 10px 0;"><i class="material-icons left">lightbulb_outline</i>${Localization.getString(
          'transactions.autoCategorize')}</a>
                    </div>
                 
                </div>
                
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount">${Localization.getString(
          'common.value')} (€)</label>
                            </div>
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label for="trx_date">${Localization.getString(
          'transactions.dateOfTransaction')}</label>
                            </div>     
                            <div class="col s7">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">description</i>
                                    <textarea id="trx-description" class="materialize-textarea"></textarea>
                                    <label for="trx-description">${Localization.getString(
          'common.description')}</label>
                                </div>
                            </div>                        
                        </div>
                        <div class="row row-no-margin-bottom col s12">                     
                            <div class="input-field col s6">
                            <span class="select2-top-label">${Localization.getString(
          'transactions.originAccount')}</span>
                                <select class="select-trxs-account_from" name="accounts" style="width: 100%;">
                                    <option disabled selected value="-1">${Localization.getString(
          'transactions.originAccount')}</option>
                                    ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                </select>
                                
                            </div>
                            <div class="input-field col s6">
                                <span class="select2-top-label">${Localization.getString(
          'transactions.destinationAccount')}</span>
                                <select class="select-trxs-account_to" name="accounts" style="width: 100%;">
                                    <option disabled selected value="-1">${Localization.getString(
          'transactions.destinationAccount')}</option>
                                    ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                </select>
                            </div>
                         
                        </div>
                        <div class="row row-no-margin-bottom col s12">
                            <div class="input-field col s6">
                                <span class="select2-top-label">${Localization.getString(
          'transactions.category')}</span>
                                <select class="select-trxs-categories" name="categories" style="width: 100%;">
                                    ${categoriesArr.map(
          cat => Transactions.renderCategoriesSelectOptions(cat)).join('')}
                                </select>
                            </div>
                            <div class="input-field col s6">
                                <span class="select2-top-label">${Localization.getString(
          'transactions.entity')}</span>
                                <select class="select-trxs-entities" name="entities" style="width: 100%;">
                                    ${entitiesArr.map(
          entity => Transactions.renderEntitiesSelectOptions(entity)).
          join('')}
                                </select>
                            </div> 
                        </div> 
                        <div class="row row-no-margin-bottom col s12 input-field" style="margin: 0 auto;">
                            <div id="tags-chips-input" class="chips chips-autocomplete"></div>
                        </div>                                
                    </form>
                </div>
                `

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
          'common.cancel')}</a>
                    <a id="modal-action-add-trx" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString(
          'common.add')}</a>`
        $('#modal-global .modal-content').html(txt)
        $('#modal-global .modal-footer').html(actionLinks)
        $('#modal-action-add-trx').click(() => Transactions.addTransaction())
        $('#auto-categorize-btn').
          click(() => Transactions.autoCategorizeButtonClicked())

        $('select.select-trxs-entities').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: `${Localization.getString('common.noEntity')}`,
        })
        $('select.select-trxs-account_to').
          select2({ dropdownParent: '#modal-global' })
        $('select.select-trxs-account_from').
          select2({ dropdownParent: '#modal-global' })

        const options = [
          {
            id: MYFIN.TRX_TYPES.INCOME,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.INCOME),
          },
          {
            id: MYFIN.TRX_TYPES.EXPENSE,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.EXPENSE),
          }, {
            id: MYFIN.TRX_TYPES.TRANSFER,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.TRANSFER),
          },
        ]
        const selectedType = lastTrxInputData
          ? lastTrxInputData.trxType
          : MYFIN.TRX_TYPES.INCOME
        ToggleComponent.buildToggle('add-transaction-type',
          'type-toggle-wrapper', options, selectedType,
          (selectedOption) => {
            Transactions.toggleEssentialCheckboxVisibility(selectedOption)
            Transactions.manageAccountsSelectAvailability()
          })

        Transactions.toggleEssentialCheckboxVisibility(
          ToggleComponent.getSelectedOptionId('add-transaction-type'))

        $('select.select-trxs-categories').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: `${Localization.getString('common.noCategory')}`,
        })
        $('.datepicker').datepicker({
          defaultDate: new Date(),
          setDefaultDate: true,
          format: 'dd/mm/yyyy',
          i18n: PickerUtils.getDatePickerDefault18nStrings(),
        })

        if (lastTrxInputData) {
          // Auto-fill fields with last trx input data
          $('select.select-trxs-entities').
            val(lastTrxInputData.entityId).
            trigger('change')
          $('select.select-trxs-account_to').
            val(lastTrxInputData.accountToId).
            trigger('change')
          $('select.select-trxs-account_from').
            val(lastTrxInputData.accountFromId).
            trigger('change')
          $('select.select-trxs-categories').
            val(lastTrxInputData.categoryId).
            trigger('change')
        }
        $('textarea#trx-description').on('change keyup paste', () => {
          const description = $('textarea#trx-description').val()
          if (description !== '') {
            LayoutUtils.scaleInElement('a#auto-categorize-btn')
          } else {
            LayoutUtils.scaleOutElement('a#auto-categorize-btn')
          }
        })
        Transactions.setupTagsChipsAutoComplete('#tags-chips-input', tagsArr,
          [])
        Transactions.manageAccountsSelectAvailability()
      },
      (error) => {
        LoadingManager.hideLoading()
      })

  },
  setupTagsChipsAutoComplete: (locatorId, fullTagsList, selectedTagsList) => {
    let chipsData = {}
    for (const tag of fullTagsList) {
      chipsData[`${tag.name}`] = null
    }

    $(locatorId).chips({
      placeholder: Localization.getString('transactions.addATagPlaceholder'),
      secondaryPlaceholder: Localization.getString(
        'transactions.addAnotherTagPlaceholder'),
      autocompleteOptions: {
        data: chipsData,
        limit: 10,
        minLength: 1,
      },
    })

    for (const tag of selectedTagsList) {
      $(locatorId).chips('addChip', {
        tag: `${tag.name}`,
      })
    }
  },
  toggleEssentialCheckboxVisibility: (selectedId) => {
    if (selectedId === MYFIN.TRX_TYPES.EXPENSE) {
      LayoutUtils.scaleInElement('p#cb-essential-wrapper')
    } else {
      LayoutUtils.scaleOutElement('p#cb-essential-wrapper')
    }
  },
  autoCategorizeButtonClicked: () => {
    const description = $('textarea#trx-description').val()
    const amount = $('input#trx_amount').val()
    const type = ToggleComponent.getSelectedOptionId('add-transaction-type')
    const accountFromId = $('select.select-trxs-account_from').val()
    const accountToId = $('select.select-trxs-account_to').val()

    LoadingManager.showLoading()
    TransactionServices.autoCategorizeTrx(description, amount ? amount : 0,
      type,
      parseInt(accountFromId ? accountFromId : -1),
      parseInt(accountToId ? accountToId : -1),
      (fillData) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Transactions.autoFillAddNewTransactionFields(fillData)
      }, (err) => {
        // ERROR
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  autoFillAddNewTransactionFields: (fillData) => {
    if (fillData['selectedCategoryID']) {
      $('select.select-trxs-categories').
        val(fillData['selectedCategoryID']).
        change()
    }
    if (fillData['selectedEntityID']) {
      $('select.select-trxs-entities').
        val(fillData['selectedEntityID']).
        change()
    }
    if (fillData['selectedAccountFromID']) {
      $('select.select-trxs-account_from').
        val(fillData['selectedAccountFromID']).
        change()
    }
    if (fillData['selectedAccountToID']) {
      $('select.select-trxs-account_to').
        val(fillData['selectedAccountToID']).
        change()
    }
    if (fillData['isEssential'] == true) {
      $('input#cb-essential').prop('checked', 'checked').change()
    }
  },
  manageAccountsSelectAvailability: () => {
    const accountFromSelect = $('select.select-trxs-account_from')
    const accountToSelect = $('select.select-trxs-account_to')
    const trxTypeSelect = ToggleComponent.getSelectedOptionId(
      'add-transaction-type')
    const accountFromSelect2 = $('select.select-trxs-account_from2')
    const accountToSelect2 = $('select.select-trxs-account_to2')
    let trxTypeSelect2 = undefined
    try {
      trxTypeSelect2 = ToggleComponent.getSelectedOptionId(
        'edit-transaction-type2')
    } catch (e) {}

    Transactions.handleAccountsSelectAvailability(accountFromSelect,
      accountToSelect, trxTypeSelect)

    if (trxTypeSelect2) {
      Transactions.handleAccountsSelectAvailability(accountFromSelect2,
        accountToSelect2, trxTypeSelect2)
    }
  },
  handleAccountsSelectAvailability: (
    accountFromSelect, accountToSelect, selectedType) => {

    switch (selectedType) {
      case 'E':
        // EXPENSE
        accountFromSelect.prop('disabled', false)
        accountToSelect.prop('disabled', true)
        accountToSelect.val('').trigger('change')
        break
      case 'I':
        // INCOME
        accountFromSelect.prop('disabled', true)
        accountToSelect.prop('disabled', false)
        accountFromSelect.val('').trigger('change')
        break
      case 'T':
        // TRANSFER
        accountFromSelect.prop('disabled', false)
        accountToSelect.prop('disabled', false)
    }
  },
  renderEntitiesSelectOptions: (entity) => `
        <option value="${entity.entity_id}">${entity.name}</option>
    `,
  renderAccountsSelectOptions: (acc) => `
        <option value="${acc.account_id}">${acc.name}</option>
    `,
  mapTransactionTypeLetterToPrintableName: (letter) => {
    switch (letter) {
      case MYFIN.TRX_TYPES.EXPENSE:
        return Localization.getString('transactions.expense')
      case MYFIN.TRX_TYPES.INCOME:
        return Localization.getString('transactions.income')
      case MYFIN.TRX_TYPES.TRANSFER:
        return Localization.getString('transactions.transfer')
    }
  },
  renderCategoriesSelectOptions: (cat) => `
        <option value="${cat.category_id}">${cat.name}</option>
    `,
  getSelectedTags: (locatorId) => {
    const tags = M.Chips.getInstance($(locatorId)).chipsData
    const tagsArr = []

    for (const tag of tags) {
      tagsArr.push(tag.tag)
    }

    return tagsArr
  },
  addTransaction: () => {
    const amount = $('input#trx_amount').val()
    const type = ToggleComponent.getSelectedOptionId('add-transaction-type')
    const isEssential = $('input#cb-essential').is(':checked')
    const tagsArr = Transactions.getSelectedTags('#tags-chips-input')
    let account_from_id
    let account_to_id
    switch (type) {
      case 'E':
        account_from_id = $('select.select-trxs-account_from').val()
        break
      case 'I':
        account_to_id = $('select.select-trxs-account_to').val()
        break
      default:
        account_from_id = $('select.select-trxs-account_from').val()
        account_to_id = $('select.select-trxs-account_to').val()
        break
    }

    const description = StringUtils.removeLineBreaksFromString(
      $('textarea#trx-description').val())
    const entID = $('select.select-trxs-entities').val()
    const catID = $('select.select-trxs-categories').val()
    const date_timestamp = DateUtils.convertDateToUnixTimestamp(
      $('.datepicker').val())

    if (!ValidationUtils.checkIfFieldsAreFilled(
      [amount, type, date_timestamp])) {
      DialogUtils.showErrorMessage(
        Localization.getString('common.fillAllFieldsTryAgain'))
      return
    }

    if (amount <= 0) {
      DialogUtils.showErrorMessage(Localization.getString(
        'transactions.valueFieldMustHaveValueOverZero'))
      return
    }

    LoadingManager.showLoading()
    LocalDataManager.setLastTrxInputData(type, account_from_id, account_to_id,
      catID, entID)
    TransactionServices.addTransaction(amount, type, description, entID,
      account_from_id, account_to_id, catID, date_timestamp, isEssential,
      tagsArr,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString(
          'transactions.transactionsSuccessfullyAdded'))
        configs.goToPage('transactions', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  showRemoveTransactionModal: (trxID) => {

    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString(
      'transactions.deleteTransactionModalTitle', { id: trxID })}</h4>
                <div class="row">
                    <p data-i18n="transactions.deleteTransactionModalSubtitle">${Localization.getString(
      'transactions.deleteTransactionModalSubtitle')}</p>
                    <b data-i18n="transactions.deleteTransactionModalAlert">${Localization.getString(
      'transactions.deleteTransactionModalAlert')}</b>

                </div>
                `

    let actionLinks = `<a class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text" data-i18n="common.cancel">${Localization.getString(
      'common.cancel')}</a>
            <a data-trx-id="${trxID}" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text modal-action-delete-trx" data-i18n="common.delete">${Localization.getString(
      'common.delete')}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)

    // Click listener for delete trx click
    $('.modal-action-delete-trx').each(function () {
      $(this).on('click', function () {
        Transactions.removeTransaction(this.dataset.trxId)
      })
    })
  },
  removeTransaction: (trxID) => {
    if (!trxID) {
      return
    }

    LoadingManager.showLoading()
    TransactionServices.removeTransaction(trxID,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString(
          'transactions.transactionSuccessfullyDeleted'))
        configs.goToPage('transactions', null, true)
      }),
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      }
  },
  showEditTransactionModal: (
    trxID, selectedAmount, selectedDateTimestamp, selectedEntityID,
    selectedCategoryID, selectedAccountFromID, selectedAccountToID,
    selectedTypeID, selectedDescription, isEssential, selectedTagsArr) => {
    LoadingManager.showLoading()
    TransactionServices.getAddTransactionStep0(
      (response) => {
        LoadingManager.hideLoading()
        const entitiesArr = response['entities']
        const categoriesArr = response['categories']
        const typesArr = response['type']
        const accountsArr = response['accounts']
        const tagsArr = response['tags']

        $('#modal-global').modal('open')
        let txt = `
                    <div class="row row-no-margin-bottom">
                        <div class="input-field col s6">
                            <h4>${Localization.getString(
          'transactions.editTransactionModalTitle', { id: trxID })}</b></h4>
                            <p id="cb-essential-wrapper" class="scale-transition ${!selectedAccountToID
          ? 'scale-in'
          : 'scale-out'}">
                          <label>
                            <input id="cb-essential" type="checkbox"
                             ${isEssential == true ? 'checked="checked"' : ''}
                             class="checkbox-indigo filled-in" />
                            <span>${Localization.getString(
          'transactions.essential')}</span>
                          </label>
                        </p>
                        </div>
                        <div class="input-field" style="float:right;display: grid;margin-bottom: 0px !important;">
                          <span class="select2-top-label col s12" style="float:right;text-align: end;width: fit-content;">${Localization.getString(
          'investments.typeOfTransaction')}</span>
                          <div id="type-toggle-wrapper" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                          <a id="auto-categorize-btn" class="waves-effect waves-light btn purple-gradient-bg scale-transition scale-out"
                          style="margin: 10px 0;"><i class="material-icons left">lightbulb_outline</i>${Localization.getString(
          'transactions.autoCategorize')}</a>
                        </div>
                    </div>
                    <form class="col s12">
                        <div class="row row-no-margin-bottom">
                            <div class="input-field col s2">
                                <i class="material-icons prefix">euro_symbol</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount" class="active">${Localization.getString(
          'common.value')} (€)</label>
                            </div>
                            
                             <div class="input-field col s3">
                                <i class="material-icons prefix">date_range</i>
                                <input id="trx_date" type="text" class="datepicker input-field">
                                <label for="trx_date" data-i18n="transactions.dateOfTransaction">${Localization.getString(
          'transactions.dateOfTransaction')}</label>
                            </div>
                            <div class="col s7">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">description</i>
                                    <textarea id="trx-description" class="materialize-textarea"></textarea>
                                    <label class="active" for="trx-description">${Localization.getString(
          'common.description')}</label>
                                </div>
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom col s12">                     
                            <div class="input-field col s6">
                                <span class="select2-top-label" data-i18n="transactions.originAccount"></span>
                                <select class="select-trxs-account_from" name="accounts" style="width: 100%;">
                                    <option disabled selected value="-1" data-i18n="transactions.originAccount"></option>
                                    ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                </select>
                                
                            </div>
                            <div class="input-field col s6">
                                <span class="select2-top-label" data-i18n="transactions.destinationAccount"></span>
                                <select class="select-trxs-account_to" name="accounts" style="width: 100%;">
                                    <option disabled selected value="-1" data-i18n="transactions.destinationAccount"></option>
                                    ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                </select>
                            </div>
                        </div>
                        <div class="row row-no-margin-bottom col s12">
                            <div class="input-field col s6">
                                <span class="select2-top-label" data-i18n="transactions.category"></span>
                                <select class="select-trxs-categories" name="categories" style="width: 100%;">
                                    ${categoriesArr.map(
          cat => Transactions.renderCategoriesSelectOptions(cat)).join('')}
                                </select>
                            </div>
                            <div class="input-field col s6">
                                <span class="select2-top-label" data-i18n="transactions.entity"></span>
                                <select class="select-trxs-entities" name="entities" style="width: 100%;">
                                    ${entitiesArr.map(
          entity => Transactions.renderEntitiesSelectOptions(entity)).
          join('')}
                                </select>
                            </div> 
                        </div>
                       <div class="row row-no-margin-bottom col s12 input-field" style="margin: 0 auto;">
                            <div id="tags-chips-input" class="chips chips-autocomplete"></div>
                        </div>    
                        <div id="split-trx-wrapper" style="display: none;">
                            <hr>
                            <div class="row row-no-margin-bottom">
                                <div class="input-field col s2">
                                    <i class="material-icons prefix">euro_symbol</i>
                                    <input id="trx_amount_2" type="number" step=".01" class="validate" style="width: auto;">
                                    <label for="trx_amount_2">${Localization.getString(
          'common.value')} (€)</label>
                                </div>
                                <div class="input-field col s5 offset-s1">
                                    <i class="material-icons prefix">description</i>
                                    <textarea id="trx-description2" class="materialize-textarea"></textarea>
                                    <label for="trx-description2">${Localization.getString(
          'common.description')}</label>
                                </div>
                                <div class="input-field" style="float:right;display: grid;margin-bottom: 0px !important;">
                                    <span class="select2-top-label col s12" style="float:right;text-align: end;width: fit-content;">${Localization.getString(
          'investments.typeOfTransaction')}</span>
                                    <div id="type2-toggle-wrapper" class="col s12" style="margin-left: 10px;float: right;width: fit-content;"></div>
                                </div>
                            </div>
                            
                            <div class="row row-no-margin-bottom">                     
                                <div class="input-field col s6">
                                    <span class="select2-top-label" data-i18n="transactions.originAccount"></span>
                                    <select class="select-trxs-account_from2" name="accounts" style="width: 100%;">
                                        <option disabled selected value="-1" data-i18n="transactions.originAccount"></option>
                                        ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                    </select>
                                    
                                </div>
                                <div class="input-field col s6">
                                    <span class="select2-top-label" data-i18n="transactions.destinationAccount"></span>
                                    <select class="select-trxs-account_to2" name="accounts" style="width: 100%;">
                                        <option disabled selected value="-1" data-i18n="transactions.destinationAccount"></option>
                                        ${accountsArr.map(
          account => Transactions.renderAccountsSelectOptions(account)).
          join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="row row-no-margin-bottom">
                                <div class="input-field col s6">
                                    <span class="select2-top-label" data-i18n="transactions.category"></span>
                                    <select class="select-trxs-categories2" name="categories" style="width: 100%;">
                                        ${categoriesArr.map(
          cat => Transactions.renderCategoriesSelectOptions(cat)).join('')}
                                    </select>
                                </div>
                                <div class="input-field col s6">
                                    <span class="select2-top-label" data-i18n="transactions.entity"></span>
                                    <select class="select-trxs-entities2" name="entities" style="width: 100%;">
                                        ${entitiesArr.map(
          entity => Transactions.renderEntitiesSelectOptions(entity)).
          join('')}
                                    </select>
                                </div> 
                            </div>
                            <p>
                                      <label>
                                        <input id="cb-essential-split" type="checkbox"
                                         ${isEssential == true
          ? 'checked="checked"'
          : ''}
                                         class="checkbox-indigo filled-in" />
                                        <span>${Localization.getString(
          'transactions.essential')}</span>
                                      </label>
                                    </p>
                            <div class="row row-no-margin-bottom col s12 input-field" style="margin: 0 auto;">
                            <div id="split-tags-chips-input" class="chips chips-autocomplete"></div>
                        </div> 
                        </div>
                    </form>
                </div>
                `

        let actionLinks = `<a id="split-trx-btn" class="waves-effect waves-light btn right-align transparent-bordered-btn-blue" onclick="" style="margin: 10px; float:left;"><i class="material-icons left"><span id="split-trx-btn-icon-id">call_split</span></i><span id="split-trx-btn-text" data-i18n="transactions.splitTransaction">${Localization.getString(
          'transactions.splitTransaction')}</span></a><a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString(
          'common.cancel')}</a>
                    <a data-trx-id="${trxID}" class="waves-effect waves-orange btn-flat enso-salmon-bg enso-border white-text modal-action-edit-trx">${Localization.getString(
          'common.edit')}</a>`

        $('#modal-global .modal-content').html(txt)
        $('#modal-global .modal-footer').html(actionLinks)

        $('select.select-trxs-entities').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: Localization.getString('common.noEntity'),
        })
        $('select.select-trxs-entities2').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: Localization.getString('common.noEntity'),
        })
        $('select.select-trxs-account_to').
          select2({ dropdownParent: '#modal-global' })
        $('select.select-trxs-account_from').
          select2({ dropdownParent: '#modal-global' })
        $('select.select-trxs-account_to2').
          select2({ dropdownParent: '#modal-global' })
        $('select.select-trxs-account_from2').
          select2({ dropdownParent: '#modal-global' })

        $('select.select-trxs-categories').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: Localization.getString('common.noCategory'),
        })
        $('select.select-trxs-categories2').select2({
          dropdownParent: '#modal-global',
          allowClear: true,
          placeholder: Localization.getString('common.noCategory'),
        })
        $('.datepicker').datepicker({
          defaultDate: new Date(
            DateUtils.convertUnixTimestampToDateFormat(
              selectedDateTimestamp)),
          setDefaultDate: true,
          format: 'dd/mm/yyyy',
          i18n: PickerUtils.getDatePickerDefault18nStrings(),
        })

        const options = [
          {
            id: MYFIN.TRX_TYPES.INCOME,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.INCOME),
          },
          {
            id: MYFIN.TRX_TYPES.EXPENSE,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.EXPENSE),
          }, {
            id: MYFIN.TRX_TYPES.TRANSFER,
            name: Transactions.mapTransactionTypeLetterToPrintableName(
              MYFIN.TRX_TYPES.TRANSFER),
          },
        ]
        ToggleComponent.buildToggle('add-transaction-type',
          'type-toggle-wrapper', options, selectedTypeID,
          (selectedOption) => {
            Transactions.toggleEssentialCheckboxVisibility(selectedOption)
            Transactions.manageAccountsSelectAvailability()
          })
        Transactions.toggleEssentialCheckboxVisibility(
          ToggleComponent.getSelectedOptionId('add-transaction-type'))

        ToggleComponent.buildToggle('edit-transaction-type2',
          'type2-toggle-wrapper', options, selectedTypeID,
          (selectedOption) => {
            Transactions.manageAccountsSelectAvailability()
          })

        Transactions.setupTagsChipsAutoComplete('#tags-chips-input', tagsArr,
          selectedTagsArr)
        Transactions.setupTagsChipsAutoComplete('#split-tags-chips-input',
          tagsArr,
          [])

        // AUTO-FILL
        $('input#trx_amount').val(selectedAmount)
        $('textarea#trx-description').val(selectedDescription)
        $('select.select-trxs-entities').
          val(selectedEntityID).
          trigger('change')
        $('select.select-trxs-account_to').
          val(selectedAccountToID).
          trigger('change')
        $('select.select-trxs-account_from').
          val(selectedAccountFromID).
          trigger('change')

        $('select.select-trxs-categories').
          val(selectedCategoryID).
          trigger('change')

        $('select.select-trxs-categories2').
          val(selectedCategoryID).
          trigger('change')
        $('select.select-trxs-entities2').
          val(selectedEntityID).
          trigger('change')
        $('select.select-trxs-account_to2').
          val(selectedAccountToID).
          trigger('change')
        $('select.select-trxs-account_from2').
          val(selectedAccountFromID).
          trigger('change')

        Transactions.manageAccountsSelectAvailability()

        // Click listener for edit trx click
        $('.modal-action-edit-trx').each(function () {
          $(this).on('click', function () {
            Transactions.editTransaction(this.dataset.trxId)
          })
        })

        $('a#split-trx-btn').on('click', function (view) {
          const wrapperLocator = $('div#split-trx-wrapper')
          const btnLocator = $('span#split-trx-btn-text')
          const btnIconLocator = $('span#split-trx-btn-icon-id')
          const amount1Locator = $('input#trx_amount')
          const amount2Locator = $('input#trx_amount_2')

          if (wrapperLocator.is(':visible')) {
            wrapperLocator.hide()
            btnLocator.text(
              Localization.getString('transactions.splitTransaction'))
            btnIconLocator.text('call_split')

            // Sum to amount1 the value of amount2 (unless undefined)
            if (amount2Locator.val()) {

              amount1Locator.val((parseFloat(amount1Locator.val()) +
                parseFloat(amount2Locator.val())).toFixed(2))
            }

          } else {
            wrapperLocator.show()
            btnLocator.text(
              Localization.getString('transactions.mergeTransactions'))
            btnIconLocator.text('call_merge')

            // Subtract from amount1 the value of amount2 (unless undefined)
            if (amount2Locator.val()) {
              amount1Locator.val((parseFloat(amount1Locator.val()) -
                parseFloat(amount2Locator.val())).toFixed(2))
            }

          }
        })

      },
      (error) => {
        LoadingManager.hideLoading()
      })

  },
  editTransaction: (trxID) => {
    const new_amount = $('input#trx_amount').val()
    const new_type = ToggleComponent.getSelectedOptionId(
      'add-transaction-type')
    const tagsArr = Transactions.getSelectedTags('#tags-chips-input')
    const splitTagsArr = Transactions.getSelectedTags('#split-tags-chips-input')
    const new_is_essential = $('input#cb-essential').is(':checked')
    let new_account_from_id
    let new_account_to_id
    switch (new_type) {
      case 'E':
        new_account_from_id = $('select.select-trxs-account_from').val()
        break
      case 'I':
        new_account_to_id = $('select.select-trxs-account_to').val()
        break
      default:
        new_account_from_id = $('select.select-trxs-account_from').val()
        new_account_to_id = $('select.select-trxs-account_to').val()
        break
    }

    const new_description = StringUtils.removeLineBreaksFromString(
      $('textarea#trx-description').val())
    const new_entity_id = $('select.select-trxs-entities').val()
    const new_category_id = $('select.select-trxs-categories').val()
    const new_date_timestamp = DateUtils.convertDateToUnixTimestamp(
      $('.datepicker').val())

    let split_amount = null
    let split_category = null
    let split_entity = null
    let split_type = null
    let split_account_from = null
    let split_account_to = null
    let split_description = null
    let split_is_essential = new_is_essential
    const wrapperLocator = $('div#split-trx-wrapper')

    let isSplit = false

    if (wrapperLocator.is(':visible')) {
      isSplit = true
      split_amount = $('input#trx_amount_2').val()
      split_category = $('select.select-trxs-categories2').val()
      split_entity = $('select.select-trxs-entities2').val()
      split_type = ToggleComponent.getSelectedOptionId(
        'edit-transaction-type2')
      split_account_from = $('select.select-trxs-account_from2').val()
      split_account_to = $('select.select-trxs-account_to2').val()
      split_description = StringUtils.removeLineBreaksFromString(
        $('textarea#trx-description2').val())
      split_is_essential = $('input#cb-essential-split').is(':checked')
    }

    if (!ValidationUtils.checkIfFieldsAreFilled(
      [new_amount, new_type, new_date_timestamp])) {
      DialogUtils.showErrorMessage(
        Localization.getString('common.fillAllFieldsTryAgain'))
      return
    }

    if (new_amount <= 0) {
      DialogUtils.showErrorMessage(Localization.getString(
        'transactions.valueFieldMustHaveValueOverZero'))
      return
    }

    if (isSplit) {
      if (!ValidationUtils.checkIfFieldsAreFilled([split_amount, split_type])) {
        DialogUtils.showErrorMessage(
          Localization.getString('common.fillAllFieldsTryAgain'))
        return
      }

      if (split_amount <= 0) {
        DialogUtils.showErrorMessage(Localization.getString(
          'transactions.valueFieldMustHaveValueOverZero'))
        return
      }
    }

    LoadingManager.showLoading()

    TransactionServices.editTransaction(trxID, new_amount, new_type,
      new_description, new_entity_id, new_account_from_id, new_account_to_id,
      new_category_id, new_date_timestamp, new_is_essential, tagsArr,
      isSplit, split_amount, split_category, split_entity, split_type,
      split_account_from, split_account_to, split_description,
      split_is_essential, splitTagsArr,
      () => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString(
          'transactions.transactionSuccessfullyUpdated'))
        configs.goToPage('transactions', null, true)
      },
      () => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}

//# sourceURL=js/transactions.js