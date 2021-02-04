"use strict";

var Categories = {
    getCategories: (type = undefined) => {
        LoadingManager.showLoading()
        CategoryServices.getAllCategories(type,
            (response) => {
                // SUCCESS
                LoadingManager.hideLoading()
                /*let debitList = []
                let creditList = []

                debitList = response.filter(item => item.type === 'D')
                creditList = response.filter(item => item.type === 'C')*/
                Categories.initMergedTable(response)
                /*Categories.initTables(debitList, creditList)*/
            },
            (response) => {
                // FAILURE
                LoadingManager.hideLoading()
            })
    },
    initMergedTable: (catsList) => {
        $("#table-merged-wrapper").html(Categories.renderCreditCategoriesTable(catsList))
        tableUtils.setupStaticTable("#debit-categories-table");
        LoadingManager.hideLoading()
    },
    initTables: (debitCatsList, creditCatsList) => {
        $("#table-debit-wrapper").html(Categories.renderDebitCategoriesTable(debitCatsList))
        $("#table-crebit-wrapper").html(Categories.renderCreditCategoriesTable(creditCatsList))

        tableUtils.setupStaticTable("#debit-categories-table");
        $("select.cat-color-select").select2()

        LoadingManager.hideLoading()
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
                <th>Cor</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Estado</th>
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
            <tr data-id='${cats.category_id}'>
                <td>
                   ${Categories.renderColorColumn(cats.color_gradient)}
                </td>
                <td>${cats.name}</td>
                <td>${cats.description}</td>
                <td><span class="${(cats.status === 'Ativa') ? 'badge green-text text-accent-4' : 'badge pink-text text-accent-2'} ">${cats.status}</span></td>
                <td>
                    <i onClick="Categories.showEditCategoryModal('${StringUtils.escapeHtml(cats.name)}', '${StringUtils.removeLineBreaksFromString(cats.description).replace(/["']/g, '')}', '${cats.color_gradient}', ${cats.category_id}, '${StringUtils.removeLineBreaksFromString(cats.status).replace(/["']/g, '')}')" class="material-icons table-action-icons">create</i>
                    <i onClick="Categories.showRemoveCategoryModal('${StringUtils.escapeHtml(cats.name)}', ${cats.category_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    renderColorColumn: catColorGradient => {
        return `
            <div style="width:45px;height:25px;" class="${catColorGradient}-bg"></div>
        `
    },
    showAddCategoryModal: () => {
        $("#modal-global").modal("open")
        let txt = `
                <div class="row">
                    <h4 class="col s8">Adicionar nova categoria</h4>
                    <div class="col s4 right-align">${Categories.renderColorPickerSelect(null)}</div>
                </div>
                
                 <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="category_name" type="text" class="validate">
                            <label for="category_name">Nome da Categoria</label>
                        </div>  
                        <div class="input-field col s4">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="category_status_select">
                                <option value="Ativa">Ativa</option>
                                <option value="Inativa">Inativa</option>
                            </select>
                            <label>Estado</label>
                        </div>
                     </div>
                     <div class="row">
                        <div class="input-field col s12">
                            <i class="material-icons prefix">description</i>
                            <label for="category_description" class="active">Descrição da Categoria</label>
                            <textarea id="category_description" maxlength="50" placeholder="Descrição..." class="materialize-textarea"></textarea>
                        </div>
                     </div>
                        
                    </form>
                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Categories.addCategory()"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);
        $('#category_status_select').formSelect();
        /*$('#category_type_select').formSelect();*/

        const colorGradientsArr = chartUtils.getColorGradientsArr(null)

        $("select.cat-color-picker-select").select2({
            minimumResultsForSearch: -1,
            data: colorGradientsArr,
            escapeMarkup: function (markup) {
                return markup;
            },
            templateResult: function (data) {
                return data.html;
            },
            templateSelection: function (data) {
                return data.text;
            }
        })
    },
    addCategory: () => {
        const catName = StringUtils.removeLineBreaksFromString($("input#category_name").val())
        const catDescription = StringUtils.removeLineBreaksFromString($("textarea#category_description").val()).replace(/["']/g, '')
        /*const catType = $("select#category_type_select").val()*/
        const catColorGradient = $("select.cat-color-picker-select").val()
        let catNewStatus = $("select#category_status_select").val()

        if (!catName || catName === "" /*|| !catType || catType === ""*/) {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        LoadingManager.showLoading()
        CategoryServices.addCategory(catName, catDescription, catColorGradient, catNewStatus,
            (response) => {
                // SUCCESS
                LoadingManager.hideLoading()
                DialogUtils.showSuccessMessage("Categoria adicionada com sucesso!")
                configs.goToPage("categories", null, true)
            },
            (response) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    },
    showRemoveCategoryModal: (catName, catID) => {
        $("#modal-global").modal("open")
        let txt = `
                <h4>Remover categoria <b>${catName}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta categoria?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Categories.removeCategory(${catID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);

        /* $('#category_type_select').formSelect();*/
    },
    removeCategory: (catID) => {
        if (!catID) return;

        LoadingManager.showLoading()
        CategoryServices.removeCategory(catID,
            (response) => {
                // SUCCESS
                LoadingManager.hideLoading()
                DialogUtils.showSuccessMessage("Categoria removida com sucesso!")
                configs.goToPage("categories", null, true)
            }),
            (response) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            }
    },
    showEditCategoryModal: (catName, catDescription, catColorGradient, catID, catStatus) => {
        $("#modal-global").modal("open")
        let txt = `
                <div class="row">
                    <h4 class="col s8">Editar categoria</h4>
                    <div class="col s4 right-align">${Categories.renderColorPickerSelect()}</div>
                </div>
                <form class="col s12">
                    <div class="row">
                        <div class="input-field col s8">
                        <i class="material-icons prefix">folder</i>
                            <input id="category_name" type="text" class="validate">
                            <label for="category_name" class="active">Nome da Categoria</label>
                        </div>
                        <div class="input-field col s4">
                            <i class="material-icons prefix">power_settings_new</i>
                            <select id="category_status_select">
                                <option value="" disabled selected>Escolha uma opção</option>
                                <option ${(catStatus === 'Ativa') ? 'selected' : ''} value="Ativa">Ativa</option>
                                <option ${(catStatus === 'Inativa') ? 'selected' : ''} value="Inativa">Inativa</option>
                            </select>
                            <label>Estado</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <i class="material-icons prefix">description</i>
                            <label for="category_description" class="active">Descrição da Categoria</label>
                            <textarea id="category_description" maxlength="50" placeholder="Descrição..." class="materialize-textarea"></textarea>
                        </div>
                    </div>                        
                </form>
            </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a onClick="Categories.editCategory(${catID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Editar</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);

        /*$('#category_type_select').formSelect();*/

        // AUTO-FILL INPUTS
        $("input#category_name").val(catName)
        $("textarea#category_description").val(catDescription)
        $('#category_status_select').formSelect();
        //$(`select#category_type_select_edit option[value='${catType}']`).prop('selected', 'selected')
        //$('select#category_type_select').find('option[value=' + catType + ']').prop('selected', true).trigger('change');

        const colorGradientsArr = chartUtils.getColorGradientsArr(catColorGradient)

        $("select.cat-color-picker-select").select2({
            minimumResultsForSearch: -1,
            data: colorGradientsArr,
            escapeMarkup: function (markup) {
                return markup;
            },
            templateResult: function (data) {
                return data.html;
            },
            templateSelection: function (data) {
                return data.text;
            }
        })
    },
    renderColorPickerSelect: cat => {
        return `
            <style>
                /* Height fix for select2 */
                .select2-container .select2-selection--single, .select2-container--default .select2-selection--single .select2-selection__rendered, .select2-container--default .select2-selection--single .select2-selection__arrow {
                    height: 50px;
                }
                
                .select2-container--default .select2-selection--single .select2-selection__rendered {
                    line-height: 75px;
                }
            </style>
            <select style="width: 107px;" class="cat-color-picker-select">
                
            </select>
        `
    },
    editCategory: (catID) => {
        const catName = $("input#category_name").val()
        const catDescription = $("textarea#category_description").val()
        /* const catType = $("select#category_type_select").val()*/
        let catNewColorGradient = $("select.cat-color-picker-select").val()
        if (!catNewColorGradient) catNewColorGradient = "red-gradient"
        let catNewStatus = $("select#category_status_select").val()

        if (!catName || catName === "" /*|| !catType || catType === ""*/) {
            DialogUtils.showErrorMessage("Por favor, preencha todos os campos!")
            return
        }

        LoadingManager.showLoading()
        CategoryServices.editCategory(catID, catName, catDescription, catNewColorGradient, catNewStatus,
            () => {
                // SUCCESS
                LoadingManager.hideLoading()
                DialogUtils.showSuccessMessage("Categoria atualizada com sucesso!")
                configs.goToPage("categories", null, true)
            },
            () => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            })
    }
}

//# sourceURL=js/categories.js