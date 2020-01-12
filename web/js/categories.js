"use strict";

var Categories = {
    initTables: (debitCatsList, creditCatsList) => {
        $("#table-debit-wrapper").html(Categories.renderDebitCategoriesTable(debitCatsList))
        $("#table-crebit-wrapper").html(Categories.renderCreditCategoriesTable(creditCatsList))
        tableUtils.setupStaticTable("#categories-table");
        loadingManager.hideLoading()
    },
    renderDebitCategoriesTable: (catsList) => {
        return `
            <table id="debit-categories-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${catsList.map(cats => Categories.renderCategoriesRow(cats)).join("")}
        </tbody>
        </table>
        `
    },
    renderCreditCategoriesTable: (catsList) => {
        return `
            <table id="debit-categories-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${catsList.map(cats => Categories.renderCategoriesRow(cats)).join("")}
        </tbody>
        </table>
        `
    },
    renderCategoriesRow: cats => {
        return `
            <tr data-id='$cats.id_account'>
                <td>${cats.name}</td>
                <td>${cats.description}</td>
                <td>
                    <i class="material-icons table-action-icons">create</i>
                    <i class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    addCategory: () => {
        $("#modal-categories").modal("open")
        let txt = `
                <h4>Adicionar nova categoria</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="category_name" type="text" class="validate">
                            <label for="category_name">Nome da Categoria</label>
                        </div>
                        <div class="input-field col s6">
                            <i class="material-icons prefix">note</i>
                            <select id="category_type_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option value="1">Crédito (Renda)</option>
                                <option value="2">Débito (Despesa)</option>
                            </select>
                            <label>Tipo de Categoria</label>
                        </div>
                            <div class="col s6">
                                <textarea id="category_description" maxlength="50" placeholder="Descrição..." class="materialize-textarea"></textarea>
                            </div>
                        </div>
                        
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick=""  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-categories .modal-content").html(txt);
        $("#modal-categories .modal-footer").html(actionLinks);

        $('#category_type_select').formSelect();
    },
}

//# sourceURL=js/categories.js