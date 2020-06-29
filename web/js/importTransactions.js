"use strict";

let importedObjData = {
    data: []
}

let IMPORT_STEP = 0
let selectedAccountID;
let trxAccountSelector;

let entitiesList, accountsList, categoriesList

const FIELD_MAPPING = {
    IGNORE: 'ignore',
    DATE: 'date',
    DESCRIPTION: 'description',
    AMOUNT: 'amount',
    CREDIT: 'credit',
    DEBIT: 'debit',
}

var ImportTransactions = {
    importFromClipboardWasClicked: () => {
        IMPORT_STEP = 0
        navigator.permissions.query({
            name: 'clipboard-read'
        }).then(permissionStatus => {
            if (permissionStatus.state !== 'granted') {
                DialogUtils.showGenericMessage('Para poder continuar a importação, tem que aceitar a permissão de leitura do clipboard!')
            } else {
                ImportTransactions.readFromClipboard()
                ImportTransactionsServices.doImportTransactionsStep0(
                    (resp) => {
                        // SUCCESS
                        CookieUtils.setUserAccounts(resp)
                        ImportTransactions.renderAccountSelect(resp)
                        $("#continue_import_btn").removeAttr('disabled')
                    }, (err) => {
                        // FAILURE
                        DialogUtils.showErrorMessage("Aconteceu algo de errado. Por favor, tente novamente.")
                    }
                )
            }
        })

    },
    importFromFileWasClicked: () => {
        IMPORT_STEP = 0
    },
    renderAccountSelect: (accsList) => {

        $("#account-select").html(`
            <div class="input-field">
                <select class="select-trxs-account" name="accounts">
                    <option disabled selected value="-1">Conta Origem</option>
                    ${accsList.map(account => ImportTransactions.renderAccountsSelectOptions(account)).join("")}
                </select>
                                
            </div>
        `)
        trxAccountSelector = $('select.select-trxs-account')
        trxAccountSelector.select2();
        trxAccountSelector.on('change', function () {
            selectedAccountID = $(this).val()
        })
    },
    renderAccountsSelectOptions: (acc) =>
        `
     <option value="${acc.account_id}">${acc.name}</option>   
    `,
    readFromClipboard: () => {
        navigator.clipboard.readText()
            .then(text => {
                //console.log(text)
                ImportTransactions.createHTMLTableFromData(text)
            }).catch(err => {
            console.log("ERRO ERRO ERRO")
        })
    },
    createHTMLTableFromData: (data) => {
        var rows = data.split("\n");
        var table = $('<table />');
        var nColumns = rows[0].split("\t").length

        // SELECTORS IN HEADER
        var headerRow = $('<tr />')
        for (var column = 0; column < nColumns; column++) {
            headerRow.append(`
                <th data-id="${column}"> 
                    <select id="field-mapping-${column}" class="field-mapping-select">
                        <option value="${column}_${FIELD_MAPPING.IGNORE}">Ignorar</option>
                        <option value="${column}_${FIELD_MAPPING.DATE}">Data</option>
                        <option value="${column}_${FIELD_MAPPING.DESCRIPTION}">Descrição</option>
                        <option value="${column}_${FIELD_MAPPING.AMOUNT}">Montante</option>
                        <option value="${column}_${FIELD_MAPPING.CREDIT}">Crédito</option>
                        <option value="${column}_${FIELD_MAPPING.DEBIT}">Débito</option>
                    </select>
                </th>
            `)
        }
        table.append(headerRow)
        //

        for (var y in rows) {
            var cells = rows[y].split("\t")

            importedObjData.data[y] = cells

            var row = $('<tr />')

            for (var x in cells) {
                row.append('<td>' + cells[x] + '</td>');
            }
            table.append(row);
        }

        // Insert into DOM
        $('#table-wrapper').html(table);
        $('.field-mapping-select').formSelect();
        $("p#import_notes").show()
    },
    continueImportWasClicked: () => {
        ++IMPORT_STEP

        if (IMPORT_STEP == 1) {
            ImportTransactions.consolidateStep0()
        } else if (IMPORT_STEP == 2) {
            ImportTransactions.consolidateStep1()
        }
    },
    consolidateStep0: () => {
        const selects = $("select.field-mapping-select")
        let dateColumn;
        let descriptionColumn;
        let amountColumn;
        let creditColumn;
        let debitColumn;


        /**
         * There must be ONE column for each of the following
         * fields: DATE, DESCRIPTION & AMOUNT (or CREDIT/DEBIT)
         */

        selects.each(function () {
            let selectedVal = $(this).val()
            let currentColumn = selectedVal.split("_")[0]
            let selectedField = selectedVal.split("_")[1]

            switch (selectedField) {
                case FIELD_MAPPING.DATE:
                    if (!dateColumn)
                        dateColumn = currentColumn
                    else {
                        DialogUtils.showErrorMessage("Por favor, não selecione campos duplicados!")
                        IMPORT_STEP--
                        return;
                    }

                    break;
                case FIELD_MAPPING.AMOUNT:
                    if (!amountColumn)
                        amountColumn = currentColumn
                    else {
                        DialogUtils.showErrorMessage("Por favor, não selecione campos duplicados!")
                        IMPORT_STEP--
                        return;
                    }
                    break;
                case FIELD_MAPPING.DESCRIPTION:
                    if (!descriptionColumn)
                        descriptionColumn = currentColumn
                    else {
                        DialogUtils.showErrorMessage("Por favor, não selecione campos duplicados!")
                        IMPORT_STEP--
                        return;
                    }
                    break;
                case FIELD_MAPPING.CREDIT:
                    if (!creditColumn)
                        creditColumn = currentColumn
                    else {
                        DialogUtils.showErrorMessage("Por favor, não selecione campos duplicados!")
                        IMPORT_STEP--
                        return;
                    }
                    break;
                case FIELD_MAPPING.DEBIT:
                    if (!debitColumn)
                        debitColumn = currentColumn
                    else {
                        DialogUtils.showErrorMessage("Por favor, não selecione campos duplicados!")
                        IMPORT_STEP--
                        return;
                    }
                    break;

            }
        })


        if (!dateColumn || !descriptionColumn || (!amountColumn && !creditColumn && !debitColumn)) {
            DialogUtils.showErrorMessage("Por favor, selecione todos os campos necessários!")
            IMPORT_STEP--
            return;
        }
        if (!selectedAccountID) {
            DialogUtils.showErrorMessage("Por favor, selecione uma conta para associar às transações.")
            IMPORT_STEP--
            return;
        }
        trxAccountSelector.attr('disabled', 'disabled')
        ImportTransactions.consolidateStep0Data(dateColumn, descriptionColumn, amountColumn, creditColumn, debitColumn)
    },
    consolidateStep0Data: (dateColumn, descriptionColumn, amountColumn, creditColumn, debitColumn) => {
        let trx = {
            date: undefined,
            description: undefined,
            amount: undefined,
            type: undefined
        }
        let trxList = []

        importedObjData.data.forEach((row) => {
            let new_trx = Object.assign({}, trx)
            let amountAndTypeInferred = ImportTransactions.inferTrxAmountAndType(row, amountColumn, creditColumn, debitColumn)

            new_trx.date = DateUtils.convertDateToUnixTimestamp(row[dateColumn])
            new_trx.description = row[descriptionColumn]
            new_trx.amount = amountAndTypeInferred.amount
            new_trx.type = amountAndTypeInferred.type

            if (ValidationUtils.checkIfFieldsAreFilled([new_trx.date, new_trx.description, new_trx.amount, new_trx.type]))
                trxList.push(new_trx)
        })
        ImportTransactions.doImportTransactionsStep1(trxList)
    },
    inferTrxAmountAndType: (row, amountColumn, creditColumn, debitColumn) => {
        let amount
        let type

        if (amountColumn) {
            amount = StringUtils.convertStringToFloat(row[amountColumn])
            type = (amount > 0) ? MYFIN.TRX_TYPES.INCOME : MYFIN.TRX_TYPES.EXPENSE
        } else if (creditColumn) {
            amount = StringUtils.convertStringToFloat(row[creditColumn])
            type = MYFIN.TRX_TYPES.INCOME
        } else if (debitColumn) {
            amount = StringUtils.convertStringToFloat(row[debitColumn])
            type = MYFIN.TRX_TYPES.EXPENSE
        }

        return {amount: Math.abs(amount), type: type}
    },
    doImportTransactionsStep1: (trxList) => {
        LoadingManager.showLoading()
        ImportTransactionsServices.doImportTransactionsStep1(trxList, selectedAccountID,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                ImportTransactions.renderStep2Table(resp)
            },
            (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
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
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Descrição</th>
                        <th>Entidade</th>
                        <th>Categoria</th>
                        <th>Conta</th>
                    </tr>
                </thead>
                <tbody>
                    ${resp.fillData.map(trx => ImportTransactions.renderStep2TableRow(trx)).join("")}
                </tbody>
            </table>
        `)


        $("#transactions-table").DataTable({
            "order": [[0, "desc"]],
            "lengthChange": false,
            "columnDefs":
                [{"width": "5%", "targets": 0},
                    {"width": "5%", "targets": 1},
                    {"width": "10%", "targets": 2},
                    {"width": "30%", "targets": 3},
                    {"width": "2.5%", "targets": 4},
                    {"width": "2.5%", "targets": 5},
                    {"width": "45%", "targets": 6}],
            "pageLength": 50,
            "language": {
                "lengthMenu": "A mostrar _MENU_ registos por página",
                "zeroRecords": "Nenhum registo encontrado",
                "info": "A mostrar a página _PAGE_ de _PAGES_",
                "infoEmpty": "Nenhum registo encontrado",
                "infoFiltered": "(filtrado de um total de _MAX_ registos)",
                "search": "Pesquisa:",
                "paginate": {
                    "next": "Página Seguinte",
                    "previous": "Página Anterior",
                }
            },
            drawCallback: function () {
                $('select.entities-select').select2();
                $('select.categories-select').select2();
                $('select.accounts-select2').select2();
                $(".datepicker").datepicker({

                    format: "dd/mm/yyyy"
                });
            },
        })

    },
    renderStep2TableRow: (trx) => `
        <tr>
            <td><center><input type="checkbox" checked="checked" class="trx-checkbox-input reset-checkbox center-align" style="transform:scale(1.5)" /></center></td>
            <td><center><input type="text" value="${DateUtils.convertUnixTimestampToDateFormat(trx.date)}" class="datepicker input-field col s5 offset-s1"></center></td>
            <td><center>${ImportTransactions.renderAmountInput(trx.amount)}</center></td>
            <td><center>${ImportTransactions.renderDescriptionInput(trx.description)}</center></td>
            <td><center>${ImportTransactions.renderEntitiesSelect(trx.selectedEntityID)}</center></td>
            <td><center>${ImportTransactions.renderCategoriesSelect(trx.selectedCategoryID)}</center></td>
            <td>
                <center>${ImportTransactions.renderAccountsSelect(trx.selectedAccountFromID)} ⮕ ${ImportTransactions.renderAccountsSelect(trx.selectedAccountToID)}</center>
            </td>
                       
        </tr>
    `,
    renderAmountInput: amount => `
        <input class="trx-amount-input" value="${(amount) ? amount : '0.00'}" type="number" class="validate input" min="0.00" value="0.00" step="0.01" required>
    `,
    renderDescriptionInput: description => `
        <textarea class="trx-description-textarea materialize-textarea">${description}</textarea>
    `,
    renderEntitiesSelect: selectedEntityID => {
        return `
            <select style="width:100%" class="entities-select">
                <option value="" selected disabled>Entidade</option>
                ${entitiesList.map(entity => ImportTransactions.renderEntitiesSelectOptions(entity.entity_id, entity.name, selectedEntityID))}
            </select>       
            
        `
    },
    renderEntitiesSelectOptions: (ent_id, ent_name, selectedEntityID) => {
        return `
            <option value="${ent_id}" ${(selectedEntityID == ent_id) ? 'selected' : ''}>${ent_name}</option>
        `
    },
    renderCategoriesSelect: selectedCategoryID => {
        return `
            <select style="width:100%" class="categories-select">
                <option value="" selected disabled>Categoria</option>
                ${categoriesList.map(category => ImportTransactions.renderCategoriesSelectOptions(category.category_id, category.name, selectedCategoryID))}
            </select>
        `
    },
    renderCategoriesSelectOptions: (cat_id, cat_name, selectedCategoryID) => {
        return `
            <option value="${cat_id}" ${selectedCategoryID == cat_id} ? 'selected' : ''}>${cat_name}</option>
        `
    },
    renderAccountsSelect: (selectedAccountID) => {
        return `
            <select style="width:45%" class="select2 accounts-select2">
                <option value="" selected>${EXTERNAL_ACCOUNT_LABEL}</option>
                ${accountsList.map(account => ImportTransactions.renderAccountsSelectOptions2(account.account_id, account.name, selectedAccountID))}
            </select>
        `
    },
    renderAccountsSelectOptions2: (account_id, name, selectedCategoryID) => {
        return `
            <option val="${account_id}" ${(account_id == selectedCategoryID) ? 'selected' : ''}>${name}</option>
        `
    },
    consolidateStep1: () => {
        const trxTable = $("table#transactions-table")
        importedObjData.data = []

        $("#transactions-table tr").each(function (i, row) {

            let checkBoxSelector = $(this).find(".trx-checkbox-input")
            if (checkBoxSelector && checkBoxSelector[0] && checkBoxSelector[0].checked) {
                let date_timestamp = DateUtils.convertDateToUnixTimestamp($(this).find(".datepicker").val())
                let amount = $(this).find(".trx-amount-input").val()
                let description = $(this).find(".trx-description-textarea").val()
                let entity_id = $(this).find(".entities-select").val()
                let category_id = $(this).find(".categories-select").val()

                let selectedOptionIndex = $($($(this).find(".accounts-select2")[0])[0])[0].selectedIndex
                let accountFrom_id = $($($($($(this).find(".accounts-select2")[0])[0].options)[selectedOptionIndex])[0].attributes["val"]).val()

                selectedOptionIndex = $($($(this).find(".accounts-select2")[1])[0])[0].selectedIndex
                let accountTo_id = $($($($($(this).find(".accounts-select2")[1])[0].options)[selectedOptionIndex])[0].attributes["val"]).val()

                let type = ImportTransactions.inferTypeFromAccounts(accountFrom_id, accountTo_id)

                importedObjData.data.push({
                    date_timestamp, amount, description, entity_id, category_id,
                    account_from_id: accountFrom_id,
                    account_to_id: accountTo_id,
                    type
                })
            }
        })

        ImportTransactions.showImportStep2ConfirmationModal()

        //ImportTransactions.doStep2()
    },
    inferTypeFromAccounts: (accountFrom, accountTo) => {
        if (accountFrom && accountFrom !== "" && accountTo && accountTo !== "") {
            return MYFIN.TRX_TYPES.TRANSFER
        } else if (accountFrom && accountFrom !== "") {
            return MYFIN.TRX_TYPES.EXPENSE
        } else if (accountTo && accountTo !== "") {
            return MYFIN.TRX_TYPES.INCOME
        }
    },
    showImportStep2ConfirmationModal: () => {
        DialogUtils.initStandardModal()
        $("#modal-global").modal("open")
        let newBalanceCalc = ImportTransactions.calculateNewBalance()
        let trxCnt = importedObjData.data.length
        let accountName = CookieUtils.getUserAccount(selectedAccountID).name

        let txt = `
                <h4>Concluir Importação?</h4>
                <p>Transações Importadas: ${trxCnt}</p>
                <p>Novo saldo da conta ${accountName}: ${newBalanceCalc}</p>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="ImportTransactions.doStep2()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Importar</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);
    },
    calculateNewBalance: () => {
        const account = CookieUtils.getUserAccount(selectedAccountID)
        let newBalance = parseFloat(account.balance)

        importedObjData.data.forEach((acc, index, array) => {
            let trxAmount = parseFloat(acc.amount)

            if (acc.type == MYFIN.TRX_TYPES.EXPENSE) {
                trxAmount *= -1
            } else if (acc.type == MYFIN.TRX_TYPES.TRANSFER) {
                if (acc.account_from_id == selectedAccountID)
                    trxAmount *= -1
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
                configs.goToPage('transactions');
                DialogUtils.showGenericMessage("Transações importadas com sucesso!")
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
            })
    },

}

//# sourceURL=js/importTransactions.js