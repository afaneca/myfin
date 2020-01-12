"use strict";

var Accounts = {
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
                <th>Instituição</th>
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
            <tr data-id='$account.id_account'>
                <td>${account.name}</td>
                <td>${account.institution}</td>
                <td>${account.type}</td>
                <td>${StringUtils.formatStringtoCurrency(account.balance)}</td>
                <td><span class="${(account.status === 'Ativo') ? 'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5 pink-text text-accent-2'} ">${account.status}</span></td>
                <td>
                    <i class="material-icons table-action-icons">create</i>
                    <i class="material-icons table-action-icons" style="margin-left:10px">delete</i>
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
                            <i class="material-icons prefix">account_balance</i>
                            <input id="institution" type="text" class="validate">
                            <label for="institution">Instituição</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="account_type_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option value="1">Conta Corrente</option>
                                <option value="2">Conta Poupança</option>
                                <option value="3">Conta a Prazo</option>
                            </select>
                            <label>Tipo de Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="account_status_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option value="1">Ativa</option>
                                <option value="2">Inativa</option>
                            </select>
                            <label>Estado da Conta</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">euro_symbol</i>
                            <input id="current_balance" type="number" step="0.01" min="0.00" class="validate">
                            <label for="current_balance">Saldo Atual (€)</label>
                        </div>
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick=""  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-accounts .modal-content").html(txt);
        $("#modal-accounts .modal-footer").html(actionLinks);

        $('#account_type_select').formSelect();
        $('#account_status_select').formSelect();
    },
}

//# sourceURL=js/accounts.js