"use strict";

var Transactions = {
    getTransactions: () => {
        LoadingManager.showLoading()
        TransactionServices.getAllTransactions(
            (response) => {
                // SUCCESS
                LoadingManager.hideLoading();
                Transactions.initTables(response)
            },
            (response) => {
                // FAILURE
                LoadingManager.hideLoading();

            })
    },
    initTables: (dataset) => {
        $("#table-transactions-wrapper").html(Transactions.renderTable(dataset))
        tableUtils.setupStaticTable("#transactions-table");
        LoadingManager.hideLoading()
    },
    renderTable: (entitiesList) => {
        return `
            <table id="transactions-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>#</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Entidade</th>
                <th>Categoria</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${entitiesList.map(trx => Transactions.renderRow(trx)).join("")}
        </tbody>
        </table>
        `
    },
    renderRow: trx => {
        return `
            <tr data-id='$trx.transaction_id'>
                <td>${trx.transaction_id}</td>
                <td>${DateUtils.convertUnixTimestampToDateString(trx.date_timestamp)}</td>
                <td>${Transactions.formatTypeToString(trx.type, trx.account_from_name, trx.account_to_name)}</td>
                <td>${StringUtils.formatStringToCurrency(trx.amount)}</td>
                <td>${trx.description}</td>
                <td>${trx.entity_name}</td>
                <td>${trx.category_name}</td>
                <td>
                    <i onClick="Transactions.showEditTransactionModal(${trx.transaction_id}, ${trx.amount}, ${trx.date_timestamp}, ${trx.entity_id}, ${trx.categories_category_id}, ${trx.accounts_account_from_id}, ${trx.accounts_account_to_id}, '${trx.type}', '${StringUtils.removeLineBreaksFromString(trx.description)}')" class="material-icons table-action-icons">create</i>
                    <i onClick="Transactions.showRemoveTransactionModal(${trx.transaction_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    formatTypeToString: (type, acc_from, acc_to) => {
        //'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5 pink-text text-accent-2'
        let str = type;

        if (!acc_from || acc_from == "") acc_from = `<span style="color:gray">Conta Externa</span>`
        if (!acc_to || acc_to == "") acc_to = `<span style="color:gray">Conta Externa</span>`


        switch (type) {
            case 'I': return `<span class='badge green lighten-5 green-text text-accent-6'>(${acc_from} ⮕ ${acc_to})</span></span>`
                break;
            case 'E': return `<span class='badge pink lighten-5 pink-text text-accent-2'>(${acc_from} ⮕ ${acc_to})</span>`
                break;
            case 'T': return `<span class='badge brown darken-2 white-text text-accent-2'>(${acc_from} ⮕ ${acc_to})</span>`
                break;
        }



        return `<span class='badge brown darken-2 white-text text-accent-2'>(${acc_from} ⮕ ${acc_to})</span>`

        /* return str; */
    },
    showAddTransactionModal: () => {
        LoadingManager.showLoading()
        TransactionServices.getAddTransactionStep0(
            (response) => {
                LoadingManager.hideLoading()
                const entitiesArr = response["entities"]
                const categoriesArr = response["categories"]
                const typesArr = response["type"]
                const accountsArr = response["accounts"]

                $("#modal-transactions").modal("open")
                let txt = `
                <h4>Adicionar nova transação</h4>
                
                    <form class="col s12">
                        <div class="row">
                            <div class="input-field col s5">
                                <i class="material-icons prefix">folder</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount">Valor (€)</label>
                            </div>
                            <input type="text" class="datepicker input-field col s5 offset-s1">
                             
                        </div>
                        <div class="row col s12">                     
                            <div class="input-field col s4">
                                <select class="select-trxs-account_from" name="accounts">
                                    <option disabled selected value="-1">Conta Origem</option>
                                    ${accountsArr.map(account => Transactions.renderAccountsSelectOptions(account)).join("")}
                                </select>
                                
                            </div>
                            <div class="input-field col s4 offset-s1">
                                <select class="select-trxs-account_to" name="accounts">
                                    <option disabled selected value="-1">Conta Destino</option>
                                    ${accountsArr.map(account => Transactions.renderAccountsSelectOptions(account)).join("")}
                                </select>
                            </div>
                            <div class="input-field col s1 offset-s1">
                                <select class="select-trxs-types" name="types">
                                    ${typesArr.map(type => Transactions.renderTypesSelectOptions(type)).join("")}
                                </select>
                            </div>
                        </div>
                        <div class="row col s12">
                            <div class="input-field col s5">
                                <select class="select-trxs-categories" name="categories">
                                    ${categoriesArr.map(cat => Transactions.renderCategoriesSelectOptions(cat)).join("")}
                                </select>
                            </div>
                            <div class="input-field col s5 offset-s1">
                                <select class="select-trxs-entities" name="entities">
                                    ${entitiesArr.map(entity => Transactions.renderEntitiesSelectOptions(entity)).join("")}
                                </select>
                            </div> 
                        </div>
                        <div class="input-field col s12">
                            <textarea id="trx-description" class="materialize-textarea"></textarea>
                            <label for="trx-description">Descrição</label>
                        </div>
            
                    </form>
                </div>
                `;

                let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
                    <a onClick="Transactions.addTransaction()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
                $("#modal-transactions .modal-content").html(txt);
                $("#modal-transactions .modal-footer").html(actionLinks);
                $('select.select-trxs-entities').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-account_to').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-account_from').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-types').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-categories').select2({ dropdownParent: "#modal-transactions" });
                $(".datepicker").datepicker({
                    defaultDate: new Date(),
                    setDefaultDate: true,
                    format: "dd/mm/yyyy"
                });

                Transactions.manageAccountsSelectAvailability()

            },
            (error) => {
                LoadingManager.hideLoading()
            })


    },
    manageAccountsSelectAvailability: () => {
        const accountFromSelect = $("select.select-trxs-account_from")
        const accountToSelect = $("select.select-trxs-account_to")
        const trxTypeSelect = $("select.select-trxs-types")

        Transactions.handleAccountsSelectAvailability(accountFromSelect, accountToSelect, trxTypeSelect.val())

        trxTypeSelect.change((resp) => {
            const selectedType = resp.target.value

            Transactions.handleAccountsSelectAvailability(accountFromSelect, accountToSelect, selectedType)

        })
    },
    handleAccountsSelectAvailability: (accountFromSelect, accountToSelect, selectedType) => {

        switch (selectedType) {
            case "E":
                // EXPENSE
                accountFromSelect.prop("disabled", false);
                accountToSelect.prop("disabled", true);
                accountToSelect.val("").trigger('change');
                break;
            case "I":
                // INCOME
                accountFromSelect.prop("disabled", true);
                accountToSelect.prop("disabled", false);
                accountFromSelect.val("").trigger('change');
                break;
            case "T":
                // TRANSFER
                accountFromSelect.prop("disabled", false);
                accountToSelect.prop("disabled", false);
        }
    },
    renderEntitiesSelectOptions: (entity) => `
        <option value="${entity.entity_id}">${entity.name}</option>
    `,
    renderAccountsSelectOptions: (acc) => `
        <option value="${acc.account_id}">${acc.name}</option>
    `,
    renderTypesSelectOptions: (type) => `
        <option value="${type.letter}">${type.name}</option>
    `,
    renderCategoriesSelectOptions: (cat) => `
        <option value="${cat.category_id}">${cat.name}</option>
    `,
    addTransaction: () => {
        const amount = $("input#trx_amount").val()
        const type = $("select.select-trxs-types").val()
        let account_from_id
        let account_to_id
        switch (type) {
            case "E":
                account_from_id = $("select.select-trxs-account_from").val()
                break;
            case "I":
                account_to_id = $("select.select-trxs-account_to").val()
                break;
            default:
                account_from_id = $("select.select-trxs-account_from").val()
                account_to_id = $("select.select-trxs-account_to").val()
                break;
        }

        const description = StringUtils.removeLineBreaksFromString($("textarea#trx-description").val())
        const entID = $("select.select-trxs-entities").val()
        const catID = $("select.select-trxs-categories").val()
        const date_timestamp = DateUtils.convertDateToUnixTimestamp($(".datepicker").val())


        if (!ValidationUtils.checkIfFieldsAreFilled([amount, type, entID, catID, date_timestamp])) {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }



        TransactionServices.addTransaction(amount, type, description, entID, account_from_id, account_to_id, catID, date_timestamp,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Transação adicionada com sucesso!")
                configs.goToPage("transactions", null, true)
            },
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    showRemoveTransactionModal: (trxID) => {
        $("#modal-transactions").modal("open")
        let txt = `
                <h4>Remover transação #<b>${trxID}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta transação?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Transactions.removeTransaction(${trxID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-transactions .modal-content").html(txt);
        $("#modal-transactions .modal-footer").html(actionLinks);
    },
    removeTransaction: (trxID) => {
        if (!trxID) return;

        TransactionServices.removeTransaction(trxID,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Transação adicionada com sucesso!")
                configs.goToPage("transactions", null, true)
            }),
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            }
    },
    showEditTransactionModal: (trxID, selectedAmount, selectedDateTimestamp, selectedEntityID, selectedCategoryID, selectedAccountFromID, selectedAccountToID, selectedTypeID, selectedDescription) => {
        
        LoadingManager.showLoading()
        TransactionServices.getAddTransactionStep0(
            (response) => {
                LoadingManager.hideLoading()
                const entitiesArr = response["entities"]
                const categoriesArr = response["categories"]
                const typesArr = response["type"]
                const accountsArr = response["accounts"]

                $("#modal-transactions").modal("open")
                let txt = `
                <h4>Editar transação <b>#${trxID}</b></h4>
                
                    <form class="col s12">
                        <div class="row">
                            <div class="input-field col s5">
                                <i class="material-icons prefix">folder</i>
                                <input id="trx_amount" type="number" step=".01" class="validate">
                                <label for="trx_amount" class="active">Valor (€)</label>
                            </div>
                            <input type="text" class="datepicker input-field col s5 offset-s1">
                             
                        </div>
                        <div class="row col s12">                     
                            <div class="input-field col s4">
                                <select class="select-trxs-account_from" name="accounts">
                                    <option disabled selected value="-1">Conta Origem</option>
                                    ${accountsArr.map(account => Transactions.renderAccountsSelectOptions(account)).join("")}
                                </select>
                                
                            </div>
                            <div class="input-field col s4 offset-s1">
                                <select class="select-trxs-account_to" name="accounts">
                                    <option disabled selected value="-1">Conta Destino</option>
                                    ${accountsArr.map(account => Transactions.renderAccountsSelectOptions(account)).join("")}
                                </select>
                            </div>
                            <div class="input-field col s1 offset-s1">
                                <select class="select-trxs-types" name="types">
                                    ${typesArr.map(type => Transactions.renderTypesSelectOptions(type)).join("")}
                                </select>
                            </div>
                        </div>
                        <div class="row col s12">
                            <div class="input-field col s5">
                                <select class="select-trxs-categories" name="categories">
                                    ${categoriesArr.map(cat => Transactions.renderCategoriesSelectOptions(cat)).join("")}
                                </select>
                            </div>
                            <div class="input-field col s5 offset-s1">
                                <select class="select-trxs-entities" name="entities">
                                    ${entitiesArr.map(entity => Transactions.renderEntitiesSelectOptions(entity)).join("")}
                                </select>
                            </div> 
                        </div>
                        <div class="input-field col s12">
                            <textarea id="trx-description" class="materialize-textarea"></textarea>
                            <label class="active" for="trx-description">Descrição</label>
                        </div>
            
                    </form>
                </div>
                `;

                let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
                    <a onClick="Transactions.editTransaction(${trxID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;

                $("#modal-transactions .modal-content").html(txt);
                $("#modal-transactions .modal-footer").html(actionLinks);

                $('select.select-trxs-entities').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-account_to').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-account_from').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-types').select2({ dropdownParent: "#modal-transactions" });
                $('select.select-trxs-categories').select2({ dropdownParent: "#modal-transactions" });
                $(".datepicker").datepicker({
                    defaultDate: new Date(DateUtils.convertUnixTimestampToDateFormat(selectedDateTimestamp)),
                    setDefaultDate: true,
                    format: "dd/mm/yyyy"
                });

                // AUTO-FILL
                $("input#trx_amount").val(selectedAmount)
                $("textarea#trx-description").val(selectedDescription)
                $('select.select-trxs-entities').val(selectedEntityID).trigger('change');
                $('select.select-trxs-account_to').val(selectedAccountToID).trigger('change');
                $('select.select-trxs-account_from').val(selectedAccountFromID).trigger('change');
                $('select.select-trxs-types').select2("val", selectedTypeID);
                $('select.select-trxs-categories').val(selectedCategoryID).trigger('change');

                Transactions.manageAccountsSelectAvailability()

            },
            (error) => {
                LoadingManager.hideLoading()
            })

    },
    editTransaction: (trxID) => {
        const new_amount = $("input#trx_amount").val()
        const new_type = $("select.select-trxs-types").val()
        let new_account_from_id
        let new_account_to_id
        switch (new_type) {
            case "E":
                new_account_from_id = $("select.select-trxs-account_from").val()
                break;
            case "I":
                new_account_to_id = $("select.select-trxs-account_to").val()
                break;
            default:
                new_account_from_id = $("select.select-trxs-account_from").val()
                new_account_to_id = $("select.select-trxs-account_to").val()
                break;
        }

        const new_description = StringUtils.removeLineBreaksFromString($("textarea#trx-description").val())
        const new_entity_id = $("select.select-trxs-entities").val()
        const new_category_id = $("select.select-trxs-categories").val()
        const new_date_timestamp = DateUtils.convertDateToUnixTimestamp($(".datepicker").val())


        if (!ValidationUtils.checkIfFieldsAreFilled([new_amount, new_type, new_entity_id, new_category_id, new_date_timestamp])) {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        TransactionServices.editTransaction(trxID, new_amount, new_type, new_description, new_entity_id, new_account_from_id, new_account_to_id, new_category_id, new_date_timestamp,
            () => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Transação atualizada com sucesso!")
                configs.goToPage("transactions", null, true)
            },
            () => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    }
}

//# sourceURL=js/transactions.js