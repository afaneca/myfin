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
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Entidade</th>
                <th>Categoria</th>
                <th>Conta</th>
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
                <td>${DateUtils.convertUnixTimestampToDateString(trx.date_timestamp)}</td>
                <td>${Transactions.formatTypeToString(trx.type, trx.account_from_name, trx.account_to_name)}</td>
                <td>${StringUtils.formatStringtoCurrency(trx.amount)}</td>
                <td>${trx.description}</td>
                <td>${trx.entity_name}</td>
                <td>${trx.category_name}</td>
                <td>${trx.account_from_name}</td>
                <td>
                    <i onClick="Transactions.showEditTransactionModal(${trx.transaction_id})" class="material-icons table-action-icons">create</i>
                    <i onClick="Transactions.showRemoveTransactionModal(${trx.transaction_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    formatTypeToString: (type, acc_from, acc_to) => {
        //'badge green lighten-5 green-text text-accent-4' : 'badge pink lighten-5 pink-text text-accent-2'
        let str = type;
        switch (type) {
            case 'I': return "<span class='badge green lighten-5 green-text text-accent-4'>Receita</span>"
                break;
            case 'E': return "<span class='badge pink lighten-5 pink-text text-accent-2'>Despesa</span>"
                break;
            case 'T': return `<span class='badge brown darken-2 white-text text-accent-2'>Transferência (${acc_from} ⮕ ${acc_to})</span>`
                break;
        }

        return str;
    },
    showAddTransactionModal: () => {
        $("#modal-transactions").modal("open")
        let txt = `
                <h4>Adicionar nova transação</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="trx_amount" type="number" class="validate">
                            <label for="trx_name">Valor (€)</label>
                        </div>
                        </div>
                        
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Entities.addEntity()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-entities .modal-content").html(txt);
        $("#modal-entities .modal-footer").html(actionLinks);
    },
    // TODO 
    addEntity: () => {
        const entName = $("input#entity_name").val()

        if (!entName || entName === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        EntityServices.addEntity(entName,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Entidade adicionada com sucesso!")
                configs.goToPage("entities", null, true)
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
    showEditEntityModal: (entName, entID) => {
        $("#modal-entities").modal("open")
        let txt = `
                <h4>Adicionar nova entidade</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="entity_name" type="text" class="validate">
                            <label for="entity_name" class="active">Nome da Entidade</label>
                        </div>
                        </div>
                        
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Entities.editEntity(${entID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-entities .modal-content").html(txt);
        $("#modal-entities .modal-footer").html(actionLinks);

        // AUTO-FILL INPUTS
        $("input#entity_name").val(entName)
    },
    editEntity: (entID) => {
        const entName = $("input#entity_name").val()

        if (!entName || entName === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        EntityServices.editEntity(entID, entName,
            () => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Entidade atualizada com sucesso!")
                configs.goToPage("entities", null, true)
            },
            () => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    }
}

//# sourceURL=js/transactions.js