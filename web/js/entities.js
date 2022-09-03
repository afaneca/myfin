import { DialogUtils } from './utils/dialogUtils.js'
import { tableUtils } from './utils/tableUtils.js'
import { LoadingManager } from './utils/loadingManager.js'
import { EntityServices } from './services/entityServices.js'
import { StringUtils } from './utils/stringUtils.js'

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
    tableUtils.setupStaticTableWithCustomColumnWidths('#entities-table',
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
                <th>Nome</th>
                <th>Ações</th>
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
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a id="modal-add-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Adicionar</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-add-entity-btn').click(() => Entities.addEntity())
  },
  addEntity: () => {
    const entName = StringUtils.removeLineBreaksFromString($('input#entity_name').val())

    if (!entName || entName === '') {
      DialogUtils.showErrorMessage('Por favor, preencha todos os campos!')
      return
    }

    LoadingManager.showLoading()
    EntityServices.addEntity(entName,
      (response) => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage('Entidade adicionada com sucesso!')
        configs.goToPage('entities', null, true)
      },
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!')
      })
  },
  showRemoveEntityModal: (entityName, entityID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>Remover entidade <b>${entityName}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta entidade?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a id="modal-remove-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`
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
        DialogUtils.showSuccessMessage('Entidade adicionada com sucesso!')
        configs.goToPage('entities', null, true)
      }),
      (response) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!')
      }
  },
  showEditEntityModal: (entName, entID) => {
    $('#modal-global').modal('open')
    let txt = `
                <h4>Editar entidade <b>${entName}</b></h4>
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
                `

    let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
    <a id="modal-edit-entity-btn" class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Editar</a>`
    $('#modal-global .modal-content').html(txt)
    $('#modal-global .modal-footer').html(actionLinks)
    $('#modal-edit-entity-btn').click(() => Entities.editEntity(entID))

    // AUTO-FILL INPUTS
    $('input#entity_name').val(entName)
  },
  editEntity: (entID) => {
    const entName = StringUtils.removeLineBreaksFromString($('input#entity_name').val())

    if (!entName || entName === '') {
      DialogUtils.showErrorMessage('Por favor, preencha todos os campos!')
      return
    }

    LoadingManager.showLoading()
    EntityServices.editEntity(entID, entName,
      () => {
        // SUCCESS
        LoadingManager.hideLoading()
        DialogUtils.showSuccessMessage('Entidade atualizada com sucesso!')
        configs.goToPage('entities', null, true)
      },
      () => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage('Ocorreu um erro. Por favor, tente novamente mais tarde!')
      })
  },
}

//# sourceURL=js/entities.js