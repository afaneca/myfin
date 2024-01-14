import { TableUtils } from './utils/tableUtils.js'
import { LoadingManager } from './utils/loadingManager.js'
import { TagServices } from './services/tagServices.js'
import { Localization } from './utils/localization.js'
import { StringUtils } from './utils/stringUtils.js'
import { configs } from './configs.js'
import { TagModalFunc } from './funcs/tagModalFunc.js'
import { DialogUtils } from './utils/dialogUtils.js'

let tagsTableInstance = null

export const Tags = {
  setupTransactionsTable: (fetchLimit = MYFIN.TRX_FETCH_LIMIT) => {
    let resetFilters = configs.getUrlArgs()?.hasOwnProperty('resetFilters') ??
      false
    $('#table-tags-wrapper').html(Tags.renderTable())

    if (resetFilters) TableUtils.resetDynamicTableState(tagsTableInstance, true)

    tagsTableInstance = TableUtils.setupDynamicTable('#tags-table',
      fetchLimit,
      Tags.getColumnsRenderingArray(),
      (page, searchQuery, callback) => {
        LoadingManager.showLoading()
        TagServices.getTransactionsByPage(page, fetchLimit, searchQuery,
          (resp) => {
            // SUCCESS
            LoadingManager.hideLoading()
            callback({
              data: resp.results,
              recordsTotal: resp.total_count,
              recordsFiltered: resp.filtered_count,
            })
          }, (err) => { LoadingManager.hideLoading() })
      }, () => {
        // Click listener for edit tag click
        Tags.bindClickListenersForEditAction()
        // Click listener for delete tag click
        Tags.bindClickListenersForRemoveAction()
      }, null, {})
  },
  getColumnsRenderingArray: () => {
    return [
      { data: Tags.buildNameColumnForTable },
      { data: Tags.buildDescriptionColumnForTable },
      { data: Tags.buildActionsColumnFortable },
    ]
  },
  buildNameColumnForTable: (tag, type, val, meta) => {
    return `${tag.name}`
  },
  buildDescriptionColumnForTable: (tag, type, val, meta) => {
    return `${tag.description}`
  },
  buildActionsColumnFortable: (tag, type, val, meta) => {
    return `<i id="edit-${tag.tag_id}"
         data-tag-id="${tag.tag_id}"
         data-tag-name="${tag.name}"
         data-tag-description="${StringUtils.removeLineBreaksFromString(
      tag.description)}"
         class="material-icons table-action-icons action-edit-tag">create</i>
        <i data-tag-id="${tag.tag_id}"
          class="material-icons table-action-icons action-delete-tag"
          style="margin-left:10px">delete</i>
    `
  },
  renderTable: () => {
    return `
    <table id="tags-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>${Localization.getString('tags.name')}</th>
                <th>${Localization.getString('tags.description')}</th>
                <th>${Localization.getString('common.actions')}</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
        </table>
    `
  },
  bindClickListenersForEditAction: () => {
    $('.table-action-icons.action-edit-tag').each(function () {
      $(this).on('click', function () {
        Tags.showEditTagModal(
          this.dataset.tagId,
          this.dataset.tagName,
          this.dataset.tagDescription,
        )
      })
    })
  },
  bindClickListenersForRemoveAction: () => {
    $('.table-action-icons.action-delete-tag').each(function () {
      $(this).on('click', function () {
        Tags.showRemoveTagModal(this.dataset.tagId)
      })
    })
  },
  showAddTagModal: () => {
    TagModalFunc.showAddNewTagModal('#modal-global', Tags.addTag)
  },
  showEditTagModal: (tagId, tagName, tagDescription) => {
    TagModalFunc.showEditTagModal('#modal-global', tagId, tagName, tagDescription, Tags.editTag);
  },
  showRemoveTagModal: (tagId) => {
    TagModalFunc.showRemoveTagConfirmationModal('#modal-global', tagId, Tags.removeTag)
  },
  addTag: (name, description) => {
    LoadingManager.showLoading()
    TagServices.addTag(name, description,
      (res) => {
        // SUCCESS
        DialogUtils.showSuccessMessage(Localization.getString(
          'tags.tagSuccessfullyAdded',
        ))
        configs.goToPage('tags', null, true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  removeTag: (tagId) => {
    LoadingManager.showLoading()
    TagServices.removeTag(tagId,
      (res) => {
        // SUCCESS
        DialogUtils.showSuccessMessage(Localization.getString(
          'tags.tagSuccessfullyDeleted',
        ))
        configs.goToPage('tags', null, true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
  editTag: (tagId, name, description) => {
    LoadingManager.showLoading()
    TagServices.editTag(tagId, name, description,
      (res) => {
        // SUCCESS
        DialogUtils.showSuccessMessage(Localization.getString(
          'tags.tagSuccessfullyUpdated',
        ))
        configs.goToPage('tags', null, true)
      }, (err) => {
        // FAILURE
        LoadingManager.hideLoading()
        DialogUtils.showErrorMessage()
      })
  },
}

//# sourceURL=js/tags.js