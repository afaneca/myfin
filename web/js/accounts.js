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
                <td>
                    <i class="material-icons table-action-icons">create</i>
                    <i class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
}

//# sourceURL=js/accounts.js