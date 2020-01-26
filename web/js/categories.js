"use strict";

var Categories = {
    getCategories: (type = undefined) => {
        CategoryServices.getAllCategories(type,
            (response) => {
                // SUCCESS
                let debitList = []
                let creditList = []

                debitList = response.filter(item => item.type === 'D')
                creditList = response.filter(item => item.type === 'C')
                Categories.initTables(debitList, creditList)
            },
            (response) => {
                // FAILURE
                debugger;

            })
    },
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
            <tr data-id='$cats.category_id'>
                <td>${cats.name}</td>
                <td>${cats.description}</td>
                <td>
                    <i onClick="Categories.showEditCategoryModal('${cats.name}', ${cats.category_id})" class="material-icons table-action-icons">create</i>
                    <i onClick="Categories.showRemoveCategoryModal('${cats.name}', ${cats.category_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    showAddCategoryModal: () => {
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
                                <option value="C">Crédito (Renda)</option>
                                <option value="D">Débito (Despesa)</option>
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
    <a onClick="Categories.addCategory()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-categories .modal-content").html(txt);
        $("#modal-categories .modal-footer").html(actionLinks);

        $('#category_type_select').formSelect();
    },
    addCategory: () => {
        const catName = $("input#category_name").val()
        const catDescription = $("textarea#category_description").val()
        const catType = $("select#category_type_select").val()

        if (!catName || catName === "" || !catDescription || catDescription === ""
            || !catType || catType === "") {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        CategoryServices.addCategory(catName, catDescription, catType,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Categoria adicionada com sucesso!")
                configs.goToPage("categories", null, true)
            },
            (response) => {
                // FAILURE
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    showRemoveCategoryModal: (catName, catID) => {
        $("#modal-categories").modal("open")
        let txt = `
                <h4>Remover categoria <b>${catName}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta categoria?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Categories.removeCategory(${catID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-categories .modal-content").html(txt);
        $("#modal-categories .modal-footer").html(actionLinks);

        $('#category_type_select').formSelect();
    },
    removeCategory: (catID) => {
        if (!catID) return;

        debugger;
    }
}

//# sourceURL=js/categories.js