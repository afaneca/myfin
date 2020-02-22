"use strict";

var Accounts = {
    init: () => {
        Accounts.getAccounts()
    },
    getAccounts: () => {
        AccountServices.getAllAccounts((response) => {
            Accounts.initTable(response)
        },
            (error) => {
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    initTable: (accountsList) => {
        $("#table-wrapper").html(Accounts.renderAccountsTable(accountsList))
        tableUtils.setupStaticTable("#accounts-table");
        loadingManager.hideLoading()
    },
    renderAccountsTable: (accountsList) => {
        return `
            <table id="accounts-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${accountsList.map(account => Accounts.renderAccountsRow(account)).join("")}
        </tbody>
        </table>
        `
    },
    renderAccountsRow: account => {
        return `
            <tr data-id='${account.account_id}'>
                <td>${account.name}</td>
                <td>${StringUtils.getAccountTypeName(account.type)}</td>
                <td>${StringUtils.formatStringtoCurrency(account.balance)}</td>
                <td><span class="${(account.status === 'Ativa') ? 'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5 pink-text text-accent-2'} ">${account.status}</span></td>
                <td>
                    <i onClick="Accounts.showEditAccountModal('${account.name}', '${account.description}', '${account.type}', '${account.status}', '${account.balance}', '${account.exclude_from_budgets}', ${account.account_id})" class="material-icons table-action-icons">create</i>
                    <i onClick="Accounts.showRemoveAccountModal('${account.name}',${account.account_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    addNewAccount: () => {

        $("#modal-accounts").modal("open")
        let txt = `
                <h4>Adicionar nova conta</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">account_circle</i>
                            <input id="account_name" type="text" class="validate">
                            <label for="account_name">Nome da Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="account_type_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option value="CHEAC">Conta Corrente</option>
                                <option value="SAVAC">Conta Poupança</option>
                                <option value="INVAC">Investimento</option>
                                <option value="CREAC">Crédito</option>
                                <option value="OTHAC">Outra</option>
                            </select>
                            <label>Tipo de Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="account_status_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option value="Ativa">Ativa</option>
                                <option value="Inativa">Inativa</option>
                            </select>
                            <label>Estado da Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">euro_symbol</i>
                            <input id="current_balance" type="number" step="0.01" min="0.00" class="validate">
                            <label for="current_balance">Saldo Atual (€)</label>
                        </div>
                        <div class="col s6">
                                <textarea id="account_description" maxlength="50" placeholder="Descrição..." class="materialize-textarea"></textarea>
                            </div>
                        <div class="input-field col s6">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>Excluir dos Orçamentos</span>
                            </label>
                        </div>
                       
                    </form>
                </div>
                `;

        /* 
         <div class="input-field col s6">
                    <i class="material-icons prefix">date_range</i>
                    <input id="account_add_datepicker" type="text" class="datepicker">
                    <label for="account_add_datepicker">Data do saldo</label>
                </div>
        */
        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Accounts.addAccount()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-accounts .modal-content").html(txt);
        $("#modal-accounts .modal-footer").html(actionLinks);

        $('#account_type_select').formSelect();
        $('#account_status_select').formSelect();
        /* $('#account_add_datepicker').datepicker({
            container: 'body',
            format: 'dd/mm/yyyy'

        }); */
    },
    addAccount: () => {
        const name = $("#account_name").val()
        const description = StringUtils.removeLineBreaksFromString($("textarea#account_description").val())
        const current_balance = $("input#current_balance").val()
        const type = $("select#account_type_select").val()
        const status = $("select#account_status_select").val()
        const exclude_from_budgets = $("#exclude_from_budgets").is(":checked")


        if (!name || name === "" || !type || type === ""
            || !description || description === "" || !status || status === ""
            || !current_balance || current_balance === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        AccountServices.addAccount(name, description, type, exclude_from_budgets, status, current_balance,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Conta adicionada com sucesso!")
                configs.goToPage("accounts", null, true)
            },
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })


    },
    showRemoveAccountModal: (accName, accID) => {
        $("#modal-accounts").modal("open")
        let txt = `
                <h4>Remover Conta <b>${accName}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta conta?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Accounts.removeAccount(${accID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-accounts .modal-content").html(txt);
        $("#modal-accounts .modal-footer").html(actionLinks);
    },
    removeAccount: (accID) => {
        if (!accID) return;

        AccountServices.removeAccount(accID,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Conta removida com sucesso!")
                configs.goToPage("accounts", null, true)
            }),
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            }
    },
    showEditAccountModal: (accName, accDescription, accType, accStatus, current_balance, exclude_from_budgets, accID) => {
        $("#modal-accounts").modal("open")
        let txt = `
                <h4>Editar a conta <b>${accName}</b></h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">account_circle</i>
                            <input id="account_name" type="text" class="validate">
                            <label class="active" for="account_name">Nome da Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="account_type_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option ${(accType === 'CHEAC') ? 'selected' : ''} value="CHEAC">Conta Corrente</option>
                                <option ${(accType === 'SAVAC') ? 'selected' : ''} value="SAVAC">Conta Poupança</option>
                                <option ${(accType === 'INVAC') ? 'selected' : ''} value="INVAC">Investimento</option>
                                <option ${(accType === 'CREAC') ? 'selected' : ''} value="CREAC">Crédito</option>
                                <option ${(accType === 'OTHAC') ? 'selected' : ''} value="OTHAC">Outra</option>
                            </select>
                            <label>Tipo de Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="account_status_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option ${(accStatus === 'Ativa') ? 'selected' : ''} value="Ativa">Ativa</option>
                                <option ${(accStatus === 'Inativa') ? 'selected' : ''} value="Inativa">Inativa</option>
                            </select>
                            <label>Estado da Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">euro_symbol</i>
                            <input id="current_balance" type="number" step="0.01" min="0.00" class="validate">
                            <label class="active" for="current_balance">Saldo Atual (€)</label>
                        </div>
                        <div class="col s6">
                                <textarea id="account_description" maxlength="50" placeholder="Descrição..." class="materialize-textarea"></textarea>
                            </div>
                        <div class="input-field col s6">
                            <label>
                                <input id="exclude_from_budgets" type="checkbox" />
                                <span>Excluir dos Orçamentos</span>
                            </label>
                        </div>
                       
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Accounts.editAccount(${accID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Editar</a>`;
        $("#modal-accounts .modal-content").html(txt);
        $("#modal-accounts .modal-footer").html(actionLinks);

        $('#account_type_select').formSelect();
        $('#account_status_select').formSelect();

        /* AUTO-FILL INPUTS */
        $("input#account_name").val(accName)
        $("input#current_balance").val(current_balance)
        $("textarea#account_description").val(accDescription)

        if (exclude_from_budgets === "1")
            $("input#exclude_from_budgets").prop('checked', 'checked')
    },
    editAccount: (accID) => {
        const name = $("#account_name").val()
        const description = StringUtils.removeLineBreaksFromString($("textarea#account_description").val())
        const current_balance = $("input#current_balance").val()
        const type = $("select#account_type_select").val()
        const status = $("select#account_status_select").val()
        const exclude_from_budgets = $("#exclude_from_budgets").is(":checked")
        
        if (!name || name === "" || !type || type === ""
            || !description || description === "" || !status || status === ""
            || !current_balance || current_balance === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        AccountServices.editAccount(accID, name, description, type, exclude_from_budgets, status, current_balance,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Conta atualizada com sucesso!")
                configs.goToPage("accounts", null, true)
            },
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    }
}

//# sourceURL=js/accounts.js