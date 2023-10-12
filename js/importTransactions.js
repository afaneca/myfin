import { DialogUtils } from "./utils/dialogUtils.js";
import { PickerUtils } from "./utils/pickerUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { ImportTransactionsServices } from "./services/importTransactionsServices.js";
import { DateUtils } from "./utils/dateUtils.js";
import { ValidationUtils } from "./utils/validationUtils.js";
import { StringUtils } from "./utils/stringUtils.js";
import { LocalDataManager } from "./utils/localDataManager.js";
import { Localization } from "./utils/localization.js";

let importedObjData = {
  data: [],
}

let IMPORT_STEP = 0
let selectedAccountID
let trxAccountSelector

let entitiesList,
  accountsList,
  categoriesList

const FIELD_MAPPING = {
  IGNORE: 'ignore',
  DATE: 'date',
  DESCRIPTION: 'description',
  AMOUNT: 'amount',
  CREDIT: 'credit',
  DEBIT: 'debit',
  TYPE: 'type',
}

const IMPORT_TRX_FIELD_HEADER_VARIATIONS = {
  DATE: [
    'date',
    'data',
    'data da operação',
    'data de operação',
    'data do movimento',
    'data de movimento',
    'data valor',
    'data operação'],
  DESCRIPTION: [
    'description',
    'descrição',
    'descrição da operação',
    'descrição de operação',
    'descrição do movimento',
    'descrição de movimento',
    'movimento'],
  AMOUNT: [
    'amount',
    'montante',
    'valor',
    'montante (eur)',
    'montante(eur)',
    'montante(€)',
    'montante (€)',
    'montante( eur )'],
  CREDIT: ['credit', 'crédito', 'receita'],
  DEBIT: ['debit', 'débito', 'despesa'],
  TYPE: [
    'type',
    'tipo',
    'tipo de operação',
    'tipo de movimento',
    'tipo de transação'],
}

export const ImportTransactions = {
  importFromClipboardWasClicked: () => {
    IMPORT_STEP = 0
    navigator.permissions.query({
      name: 'clipboard-read',
    }).then(permissionStatus => {
      if (permissionStatus.state !== 'granted' && permissionStatus.state !==
        'prompt') {
        DialogUtils.showGenericMessage(
          Localization.getString('transactions.clipboardPermissionMessage'))
      }
      else {
        ImportTransactions.readFromClipboard()
        ImportTransactionsServices.doImportTransactionsStep0(
          (resp) => {
            // SUCCESS
            //LocalDataManager.setUserAccounts(resp)
            selectedAccountID = null
            ImportTransactions.renderAccountSelect(resp)
            $('#continue_import_btn').removeAttr('disabled')
          }, (err) => {
            // FAILURE
            DialogUtils.showErrorMessage()
          },
        )
      }
    })

  },
  importFromFileWasClicked: () => {
    IMPORT_STEP = 0
  },
  renderAccountSelect: (accsList) => {

    $('#account-select').html(`
            <div class="input-field" style="border: 1px solid var(--main-body-background);width: fit-content;border-radius: 5px;">
                <select class="select-trxs-account" name="accounts">
                    <option disabled selected value="-1">${Localization.getString('transactions.originAccount')}</option>
                    ${accsList.map(
      account => ImportTransactions.renderAccountsSelectOptions(account)).
      join('')}
                </select>
                                
            </div>
        `)
    trxAccountSelector = $('select.select-trxs-account')
    trxAccountSelector.select2()
    trxAccountSelector.on('change', function () {
      selectedAccountID = $(this).val()
    })
  },
  renderAccountsSelectOptions: (acc) =>
    `
     <option value="${acc.account_id}">${acc.name}</option>   
    `,
  readFromClipboard: () => {
    navigator.clipboard.readText().then(text => {
      //console.log(text)
      ImportTransactions.createHTMLTableFromData(text)
    }).catch(err => {
      console.log(err)
    })
  },
  createHTMLTableFromData: (data) => {
    var rows = data.split('\n')
    var table = $('<table />')
    var nColumns = rows[0].split('\t').length

    // SELECTORS IN HEADER
    var headerRow = $('<tr />')

    function checkIfTextIsAssociatedWithHeaderLabel (
      headerLabel, targetFieldMapping) {
      switch (targetFieldMapping) {
        case FIELD_MAPPING.DATE:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.DATE.includes(
            headerLabel.toLowerCase())
        case FIELD_MAPPING.CREDIT:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.CREDIT.includes(
            headerLabel.toLowerCase())
        case FIELD_MAPPING.DEBIT:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.DEBIT.includes(
            headerLabel.toLowerCase())
        case FIELD_MAPPING.TYPE:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.TYPE.includes(
            headerLabel.toLowerCase())
        case FIELD_MAPPING.AMOUNT:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.AMOUNT.includes(
            headerLabel.toLowerCase())
        case FIELD_MAPPING.DESCRIPTION:
          return IMPORT_TRX_FIELD_HEADER_VARIATIONS.DESCRIPTION.includes(
            headerLabel.toLowerCase())
      }

      return false
    }

    for (var column = 0; column < nColumns; column++) {
      let headerLabel = rows[0].split('\t')[column].replace('\r', '')

      headerRow.append(`
                <th data-id="${column}"> 
                    <select id="field-mapping-${column}" class="field-mapping-select">
                        <option value="${column}_${FIELD_MAPPING.IGNORE}">${Localization.getString("common.ignore")}</option>
                        <option value="${column}_${FIELD_MAPPING.DATE}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.DATE) ? ' selected ' : ''}>${Localization.getString("common.date")} (DD-MM-YYYY)</option>
                        <option value="${column}_${FIELD_MAPPING.DESCRIPTION}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.DESCRIPTION) ? ' selected ' : ''}>${Localization.getString('common.description')}</option>
                        <option value="${column}_${FIELD_MAPPING.AMOUNT}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.AMOUNT) ? ' selected ' : ''}>${Localization.getString('common.amount')}</option>
                        <option value="${column}_${FIELD_MAPPING.CREDIT}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.CREDIT) ? ' selected ' : ''}>${Localization.getString("common.credit")}</option>
                        <option value="${column}_${FIELD_MAPPING.DEBIT}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.DEBIT) ? ' selected ' : ''}>${Localization.getString("common.debit")}</option>
                        <option value="${column}_${FIELD_MAPPING.TYPE}" ${checkIfTextIsAssociatedWithHeaderLabel(
        headerLabel, FIELD_MAPPING.TYPE) ? ' selected ' : ''}>${Localization.getString("common.type")}</option>
                    </select>
                </th>
            `)
    }
    table.append(headerRow)
    //

    for (var y in rows) {
      var cells = rows[y].split('\t')

      importedObjData.data[y] = cells

      var row = $('<tr />')

      for (var x in cells) {
        row.append('<td>' + cells[x] + '</td>')
      }
      table.append(row)
    }

    // Insert into DOM
    $('#table-wrapper').html(table)
    $('.field-mapping-select').formSelect()
    $('p#import_notes').show()
  },
  continueImportWasClicked: () => {
    ++IMPORT_STEP
    if (IMPORT_STEP == 1) {
      ImportTransactions.consolidateStep0()
    }
    else if (IMPORT_STEP > 1) {
      ImportTransactions.consolidateStep1()
    }
  },
  consolidateStep0: () => {
    const selects = $('select.field-mapping-select')
    let dateColumn
    let descriptionColumn
    let amountColumn
    let creditColumn
    let debitColumn
    let typeColumn

    /**
     * There must be ONE column for each of the following
     * fields: DATE, DESCRIPTION & AMOUNT (or CREDIT/DEBIT or TYPE & AMOUNT)
     */
    let hasDuplicatedFieldsGlobal
    selects.each(function () {
      let selectedVal = $(this).val()
      let currentColumn = selectedVal.split('_')[0]
      let selectedField = selectedVal.split('_')[1]

      let hasDuplicatedFields
      switch (selectedField) {
        case FIELD_MAPPING.DATE:
          if (!dateColumn) {
            dateColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }

          break
        case FIELD_MAPPING.AMOUNT:
          if (!amountColumn) {
            amountColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }
          break
        case FIELD_MAPPING.DESCRIPTION:
          if (!descriptionColumn) {
            descriptionColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }
          break
        case FIELD_MAPPING.CREDIT:
          if (!creditColumn) {
            creditColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }
          break
        case FIELD_MAPPING.DEBIT:
          if (!debitColumn) {
            debitColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }
          break
        case FIELD_MAPPING.TYPE:
          if (!typeColumn) {
            typeColumn = currentColumn
          }
          else {
            hasDuplicatedFields = true
          }
          break
      }

      if (hasDuplicatedFields) {
        hasDuplicatedFieldsGlobal = true
        IMPORT_STEP--
        DialogUtils.showErrorMessage(
          Localization.getString('transactions.pleaseDoNotSelectDuplicatedFields'))
        return
      }
    })

    if (hasDuplicatedFieldsGlobal) {
      return
    }
    if (!dateColumn || !descriptionColumn ||
      (!amountColumn && !creditColumn && !debitColumn && !typeColumn)
      || (typeColumn && !amountColumn)) {
      DialogUtils.showErrorMessage(
        Localization.getString('common.fillAllFieldsTryAgain'))
      IMPORT_STEP--
      return
    }
    if (!selectedAccountID) {
      DialogUtils.showErrorMessage(
        Localization.getString('transactions.pleaseSelectAnAccountToAssociateWithTrx'))
      IMPORT_STEP--
      return
    }
    trxAccountSelector.attr('disabled', 'disabled')
    ImportTransactions.consolidateStep0Data(dateColumn, descriptionColumn,
      amountColumn, creditColumn, debitColumn, typeColumn)
  },
  consolidateStep0Data: (
    dateColumn, descriptionColumn, amountColumn, creditColumn, debitColumn,
    typeColumn) => {
    let trx = {
      date: undefined,
      description: undefined,
      amount: undefined,
      type: undefined,
    }
    let trxList = []

    importedObjData.data.forEach((row) => {
      let new_trx = Object.assign({}, trx)
      let amountAndTypeInferred = ImportTransactions.inferTrxAmountAndType(row,
        amountColumn, creditColumn, debitColumn, typeColumn)

      new_trx.date = DateUtils.convertDateToUnixTimestamp(row[dateColumn])
      new_trx.description = row[descriptionColumn]
      new_trx.amount = amountAndTypeInferred.amount
      new_trx.type = amountAndTypeInferred.type

      if (ValidationUtils.checkIfFieldsAreFilled(
        [new_trx.date, new_trx.description, new_trx.amount, new_trx.type])) {
        trxList.push(new_trx)
      }
    })

    ImportTransactions.doImportTransactionsStep1(trxList)
  },
  inferTrxAmountAndType: (
    row, amountColumn, creditColumn, debitColumn, typeColumn) => {
    let amount
    let type

    if (row[amountColumn] && amountColumn && !typeColumn) {
      amount = StringUtils.convertStringToFloat(
        row[amountColumn].replace(/ /g, ''))
      type = (amount > 0) ? MYFIN.TRX_TYPES.INCOME : MYFIN.TRX_TYPES.EXPENSE
    }
    else if (creditColumn && !typeColumn) {
      amount = StringUtils.convertStringToFloat(row[creditColumn])
      type = MYFIN.TRX_TYPES.INCOME
    }

    if (!amount && debitColumn && !typeColumn) {
      amount = StringUtils.convertStringToFloat(row[debitColumn])
      type = MYFIN.TRX_TYPES.EXPENSE
    }
    else if (!amount && amountColumn && typeColumn) {
      amount = StringUtils.convertStringToFloat(row[amountColumn])
      switch (row[typeColumn]) {
        case MYFIN.TRX_TYPE_LABEL.DEBIT:
          type = MYFIN.TRX_TYPES.EXPENSE
          break
        case MYFIN.TRX_TYPE_LABEL.CREDIT:
          type = MYFIN.TRX_TYPES.INCOME
          break
      }
    }

    return {
      amount: Math.abs(amount),
      type: type,
    }
  },
  doImportTransactionsStep1: (trxList) => {
    LoadingManager.showLoading()
    ImportTransactionsServices.doImportTransactionsStep1(trxList,
      selectedAccountID,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        ImportTransactions.renderStep2Table(resp)
      },
      (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  renderStep2Table: resp => {

    entitiesList = resp.entities
    accountsList = resp.accounts
    categoriesList = resp.categories

    $('div#table-wrapper').html(`
             <table id="transactions-table" class="display browser-defaults" style="width:100%">
                <thead>
                    <tr>
                        <th></th>
                        <th>${Localization.getString('common.date')}</th>
                        <th>${Localization.getString('common.value')}</th>
                        <th>${Localization.getString('common.description')}</th>
                        <th>${Localization.getString('transactions.entity')}</th>
                        <th>${Localization.getString('transactions.category')}</th>
                        <th>${Localization.getString('common.account')}</th>
                        <th>${Localization.getString('transactions.essential')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${resp.fillData.map(
      trx => ImportTransactions.renderStep2TableRow(trx)).join('')}
                </tbody>
            </table>
        `)

    $('#transactions-table').DataTable({
      'order': [[0, 'desc']],
      'lengthChange': false,
      'columnDefs':
        [
          {
            'width': '5%',
            'targets': 0,
          },
          {
            'width': '5%',
            'targets': 1,
          },
          {
            'width': '10%',
            'targets': 2,
          },
          {
            'width': '30%',
            'targets': 3,
          },
          {
            'width': '2.5%',
            'targets': 4,
          },
          {
            'width': '2.5%',
            'targets': 5,
          },
          {
            'width': '45%',
            'targets': 6,
          }],
      'pageLength': 50,
      'language': {
        'lengthMenu': Localization.getString('common.tableLengthMenu'),
        'zeroRecords': Localization.getString('common.tableZeroRecords'),
        'info': Localization.getString('common.tableInfo'),
        'infoEmpty': Localization.getString('common.tableInfoEmpty'),
        'infoFiltered': Localization.getString('common.tableInfoFiltered'),
        'search': `${Localization.getString('common.search')}:`,
        'paginate': {
          'next': Localization.getString('common.tablePaginateNext'),
          'previous': Localization.getString('common.tablePaginatePrevious'),
        },
      },
      drawCallback: function () {
        $('select.entities-select').select2({
          allowClear: true,
          placeholder: Localization.getString('common.noEntity'),
        })
        $('select.categories-select').select2({
          allowClear: true,
          placeholder: Localization.getString('common.noCategory'),
        })
        $('select.accounts-select2').select2()
        $('.datepicker').datepicker({

          format: 'dd/mm/yyyy',
          i18n: PickerUtils.getDatePickerDefault18nStrings(),
        })
      },
    })

  },
  renderStep2TableRow: (trx) => `
        <tr>
            <td><center><input type="checkbox" checked="checked" class="trx-checkbox-input reset-checkbox center-align" style="transform:scale(1.5)" /></center></td>
            <td><center><input type="text" value="${DateUtils.convertUnixTimestampToEuropeanDateFormat(
    trx.date)}" class="datepicker input-field col s5 offset-s1"></center></td>
            <td><center>${ImportTransactions.renderAmountInput(trx.amount)}</center></td>
            <td><center>${ImportTransactions.renderDescriptionInput(
    trx.description)}</center></td>
            <td><center>${ImportTransactions.renderEntitiesSelect(
    trx.selectedEntityID)}</center></td>
            <td><center>${ImportTransactions.renderCategoriesSelect(
    trx.selectedCategoryID)}</center></td>
            <td>
                <center>${ImportTransactions.renderAccountsSelect(
    trx.selectedAccountFromID)} ⮕ ${ImportTransactions.renderAccountsSelect(
    trx.selectedAccountToID)}</center>
            </td>
            <td><center>${ImportTransactions.renderEssentialCheckbox(
    StringUtils.normalizeStringForHtml(trx.description + trx.amount + trx.date),
    trx.isEssential == true)}</center></td> 
        </tr>
    `,
  renderEssentialCheckbox: (id, isEssential) => {
    return `
      <input id="${id}" type="checkbox" ${isEssential
      ? 'checked="checked"'
      : ''} class="trx-checkbox-essential-input reset-checkbox center-align" style="transform:scale(1.5)" />
    `
  },
  renderAmountInput: amount => `
        <input class="trx-amount-input" value="${(amount) ? amount : '0.00'}" type="number" class="validate input" min="0.00" value="0.00" step="0.01" required>
    `,
  renderDescriptionInput: description => `
        <textarea class="trx-description-textarea materialize-textarea">${description}</textarea>
    `,
  renderEntitiesSelect: selectedEntityID => {
    return `
            <select style="width:100%" class="entities-select">
                <option value="" selected disabled>${Localization.getString('transactions.entity')}</option>
                ${entitiesList.map(
      entity => ImportTransactions.renderEntitiesSelectOptions(entity.entity_id,
        entity.name, selectedEntityID))}
            </select>       
            
        `
  },
  renderEntitiesSelectOptions: (ent_id, ent_name, selectedEntityID) => {
    return `
            <option value="${ent_id}" ${(selectedEntityID == ent_id)
      ? 'selected'
      : ''}>${ent_name}</option>
        `
  },
  renderCategoriesSelect: selectedCategoryID => {
    return `
            <select style="width:100%" class="categories-select">
                <option value="" selected disabled>${Localization.getString('transactions.category')}</option>
                ${categoriesList.map(
      category => ImportTransactions.renderCategoriesSelectOptions(
        category.category_id, category.name, selectedCategoryID))}
            </select>
        `
  },
  renderCategoriesSelectOptions: (cat_id, cat_name, selectedCategoryID) => {
    return `
            <option value="${cat_id}" ${(selectedCategoryID == cat_id)
      ? 'selected'
      : ''}>${cat_name}</option>
        `
  },
  renderAccountsSelect: (selectedAccountID) => {
    return `
            <select style="width:45%" class="select2 accounts-select2">
                <option value="" selected>** ${Localization.getString('common.externalAccounts')} **</option>
                ${accountsList.map(
      account => ImportTransactions.renderAccountsSelectOptions2(
        account.account_id, account.name, selectedAccountID))}
            </select>
        `
  },
  renderAccountsSelectOptions2: (account_id, name, selectedCategoryID) => {
    return `
            <option val="${account_id}" ${(account_id == selectedCategoryID)
      ? 'selected'
      : ''}>${name}</option>
        `
  },
  consolidateStep1: () => {
    const trxTable = $('table#transactions-table')
    importedObjData.data = []

    $('#transactions-table tr').each(function (i, row) {

      let checkBoxSelector = $(this).find('.trx-checkbox-input')
      if (checkBoxSelector && checkBoxSelector[0] &&
        checkBoxSelector[0].checked) {
        let date_timestamp = DateUtils.convertDateToUnixTimestamp(
          $(this).find('.datepicker').val())
        let amount = $(this).find('.trx-amount-input').val()
        let description = $(this).find('.trx-description-textarea').val()
        let entity_id = $(this).find('.entities-select').val()
        let category_id = $(this).find('.categories-select').val()
        let isEssential = $(this).
          find('.trx-checkbox-essential-input').
          is(':checked')
        let selectedOptionIndex = $(
          $($(this).find('.accounts-select2')[0])[0])[0].selectedIndex
        let accountFrom_id = $($($($($(this).
          find(
            '.accounts-select2')[0])[0].options)[selectedOptionIndex])[0].attributes['val']).
          val()

        selectedOptionIndex = $(
          $($(this).find('.accounts-select2')[1])[0])[0].selectedIndex
        let accountTo_id = $($($($($(this).
          find(
            '.accounts-select2')[1])[0].options)[selectedOptionIndex])[0].attributes['val']).
          val()

        let type = ImportTransactions.inferTypeFromAccounts(accountFrom_id,
          accountTo_id)

        importedObjData.data.push({
          date_timestamp,
          amount,
          description,
          entity_id,
          category_id,
          account_from_id: accountFrom_id,
          account_to_id: accountTo_id,
          is_essential: isEssential,
          type,
        })
      }
    })

    ImportTransactions.showImportStep2ConfirmationModal()

    //ImportTransactions.doStep2()
  },
  inferTypeFromAccounts: (accountFrom, accountTo) => {
    if (accountFrom && accountFrom !== '' && accountTo && accountTo !== '') {
      return MYFIN.TRX_TYPES.TRANSFER
    }
    else if (accountFrom && accountFrom !== '') {
      return MYFIN.TRX_TYPES.EXPENSE
    }
    else if (accountTo && accountTo !== '') {
      return MYFIN.TRX_TYPES.INCOME
    }
  },
  showImportStep2ConfirmationModal: () => {
    DialogUtils.initStandardModal()
    $('#modal-global').modal('open')
    let newBalanceCalc = ImportTransactions.calculateNewBalance()
    let trxCnt = importedObjData.data.length
    let accountName = LocalDataManager.getUserAccount(selectedAccountID).name

    let txt = `
                <h4>${Localization.getString('transactions.completeImportQuestion')}</h4>
                <p>${Localization.getString('transactions.importedTransactionsCnt', { count: trxCnt })}</p>
                <p>${Localization.getString('transactions.newBalanceForAccountValue', {
      account: accountName,
      value: StringUtils.formatMoney(
        newBalanceCalc),
    })}</p>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="do-step2-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("transactions.import")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#do-step2-btn').click(() => ImportTransactions.doStep2())
  },
  calculateNewBalance: () => {
    const account = LocalDataManager.getUserAccount(selectedAccountID)
    let newBalance = parseFloat(account.balance)

    importedObjData.data.forEach((acc, index, array) => {
      let trxAmount = parseFloat(acc.amount)

      if (acc.type == MYFIN.TRX_TYPES.EXPENSE) {
        trxAmount *= -1
      }
      else if (acc.type == MYFIN.TRX_TYPES.TRANSFER) {
        if (acc.account_from_id == selectedAccountID) {
          trxAmount *= -1
        }
      }
      newBalance += trxAmount
    })

    return newBalance
  },
  doStep2: () => {
    LoadingManager.showLoading()
    ImportTransactionsServices.doImportTransactionsStep2(importedObjData.data,
      (resp) => {
        // SUCCESS
        LoadingManager.hideLoading()
        configs.goToPage('transactions')
        DialogUtils.showGenericMessage(Localization.getString("transactions.transactionsSuccessfullyImported"))
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
      })
  },

}

//# sourceURL=js/importTransactions.js
