import { DialogUtils } from "./utils/dialogUtils.js";
import { TableUtils } from "./utils/tableUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { EntityServices } from "./services/entityServices.js";
import { StringUtils } from "./utils/stringUtils.js";
import { Localization } from "./utils/localization.js";

export const Entities = {
  getEntities: () => {
    LoadingManager.showLoading()
    EntityServices.getAllEntities(
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        Entities.initTables(response)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()

      })
  },
  initTables: (entityList) => {
    $('#table-entities-wrapper').html(Entities.renderEntitiesTable(entityList))
    TableUtils.setupStaticTableWithCustomColumnWidths('#entities-table',
      [
        {
          'width': '90%',
          'targets': 0,
        }], () => {
        // Click listener for edit trx click
        Entities.bindClickListenersForEditAction()
        // Click listener for delete trx click
        Entities.bindClickListenersForRemoveAction()
      })

    LoadingManager.hideLoading()
  },
  bindClickListenersForEditAction: () => {
    // Click listener for edit entity click
    $('.table-action-icons.action-edit-entity').each(function () {
      $(this).on('click', function () {
        Entities.showEditEntityModal(
          this.dataset.entName,
          this.dataset.entId,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    // Click listener for edit entity click
    $('.table-action-icons.action-remove-entity').each(function () {
      $(this).on('click', function () {
        Entities.showRemoveEntityModal(
          this.dataset.entName,
          this.dataset.entId,
        )
      })
    })
  },
  renderEntitiesTable: (entitiesList) => {
    return `
            <table id="entities-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString("entities.name")}</th>
                <th>${Localization.getString("common.actions")}</th>
            </tr>
        </thead>
        <tbody>
        ${entitiesList.map(entity => Entities.renderEntitiesRow(entity)).join('')}
        </tbody>
        </table>
        `
  },
  renderEntitiesRow: entity => {
    return `
            <tr data-id='${entity.entity_id}'>
                <td>${entity.name}</td>
                <td>
                    <i data-ent-name="${StringUtils.escapeHtml(entity.name)}" data-ent-id="${entity.entity_id}" class="material-icons table-action-icons action-edit-entity">create</i>
                    <i data-ent-name="${StringUtils.escapeHtml(entity.name)}" data-ent-id="${entity.entity_id}" class="material-icons table-action-icons action-remove-entity" style="margin-left:10px">delete</i>
                </td>
            </tr>
        `
  },
  showAddEntityModal: () => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("entities.addEntityModalTitle")}</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="entity_name" type="text" class="validate">
                            <label for="entity_name">${Localization.getString("entities.name")}</label>
                        </div>
                        </div>
                        
                    </form>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.edit")}</a>
    <a id="modal-add-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.add")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-add-entity-btn').click(() => Entities.addEntity())
  },
  addEntity: () => {
    const entName = StringUtils.removeLineBreaksFromString($('input#entity_name').val())

    if (!entName || entName === '') {
      DialogUtils.showErrorMessage(Localization.getString("common.fillAllFieldsTryAgain"))
      return
    }

    LoadingManager.showLoading()
    EntityServices.addEntity(entName,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("entities.entitySuccessfullyAdded"))
        configs.goToPage('entities', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  showRemoveEntityModal: (entityName, entityID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("entities.deleteEntityModalTitle", {name: entityName})}</h4>
                <div class="row">
                    <p>${Localization.getString("entities.deleteEntityModalSubtitle")}</p>
                    <b>${Localization.getString("entities.deleteEntityModalAlert")}</b>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
            <a id="modal-remove-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.delete")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-remove-entity-btn').click(() => Entities.removeEntity(entityID))
  },
  removeEntity: (entityID) => {
    if (!entityID) {
      return
    }

    LoadingManager.showLoading()
    EntityServices.removeEntity(entityID,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("entities.entitySuccessfullyDeleted"))
        configs.goToPage('entities', null, true)
      }),
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      }
  },
  showEditEntityModal: (entName, entID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>${Localization.getString("entities.editEntityModalTitle", {name: entName})}</h4>
                <div class="row">
                    <form class="col s12">
                        <div class="input-field col s6">
                        <i class="material-icons prefix">folder</i>
                            <input id="entity_name" type="text" class="validate">
                            <label for="entity_name" class="active">${Localization.getString("entities.name")}</label>
                        </div>
                        </div>
                        
                    </form>
                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">${Localization.getString("common.cancel")}</a>
    <a id="modal-edit-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">${Localization.getString("common.edit")}</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-edit-entity-btn').click(() => Entities.editEntity(entID))

    // AUTO-FILL INPUTS
    $('input#entity_name').val(entName)
  },
  editEntity: (entID) => {
    const entName = StringUtils.removeLineBreaksFromString($('input#entity_name').val())

    if (!entName || entName === '') {
      DialogUtils.showErrorMessage(Localization.getString("common.fillAllFieldsTryAgain"))
      return
    }

    LoadingManager.showLoading()
    EntityServices.editEntity(entID, entName,
      () => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage(Localization.getString("entities.entitySuccessfullyUpdated"))
        configs.goToPage('entities', null, true)
      },
      () => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}

//# sourceURL=js/entities.js