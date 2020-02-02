"use strict";

var Entities = {
    getEntities: () => {
        EntityServices.getAllEntities(
            (response) => {
                // SUCCESS
                Entities.initTables(response)
            },
            (response) => {
                // FAILURE

            })
    },
    initTables: (entityList) => {
        $("#table-entities-wrapper").html(Entities.renderEntitiesTable(entityList))
        tableUtils.setupStaticTableWithCustomColumnWidths("#entities-table",
            [{ "width": "90%", "targets": 0 }]);
        loadingManager.hideLoading()
    },
    renderEntitiesTable: (entitiesList) => {
        return `
            <table id="entities-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${entitiesList.map(entity => Entities.renderEntitiesRow(entity)).join("")}
        </tbody>
        </table>
        `
    },
    renderEntitiesRow: entity => {
        return `
            <tr data-id='$entity.entity_id'>
                <td>${entity.name}</td>
                <td>
                    <i onClick="Entities.showEditEntityModal('${entity.name}', ${entity.entity_id})" class="material-icons table-action-icons">create</i>
                    <i onClick="Entities.showRemoveEntityModal('${entity.name}', ${entity.entity_id})" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
    },
    showAddEntityModal: () => {
        $("#modal-entities").modal("open")
        let txt = `
                <h4>Adicionar nova entidade</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="entity_name" type="text" class="validate">
                            <label for="entity_name">Nome da Entidade</label>
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
    showRemoveEntityModal: (entityName, entityID) => {
        $("#modal-entities").modal("open")
        let txt = `
                <h4>Remover entidade <b>${entityName}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta entidade?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Entities.removeEntity(${entityID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-entities .modal-content").html(txt);
        $("#modal-entities .modal-footer").html(actionLinks);
    },
    removeEntity: (entityID) => {
        if (!entityID) return;

        EntityServices.removeEntity(entityID,
            (response) => {
                // SUCCESS
                DialogUtils.showSuccessMessage("Entidade adicionada com sucesso!")
                configs.goToPage("entities", null, true)
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

//# sourceURL=js/entities.js