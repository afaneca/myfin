import { Localization } from './localization.js'
import { configs } from '../configs.js'

export const TableUtils = {
  setupDynamicTable: (
    tableId, fetchLimit, columnsRenderingArr, renderPageCallback,
    drawCallback, customRowId = null, customConfigs = {}) => {
    const mainConfig = {
      ordering: false,
      paging: true,
      pageLength: fetchLimit,
      dom: '<"table-toolbar">frtip',
      ajax: function (data, callback, settings) {
        const page = data.start / data.length
        renderPageCallback(page, data.search.value, callback)
      },
      serverSide: true,
      processing: false,
      'language': TableUtils.getLocalizedLanguageObject(),
      drawCallback: drawCallback,
      columns: columnsRenderingArr,
      rowId: customRowId,
      stateSave: true,
      stateDuration: -1,
    }

    const instance = $(tableId).DataTable({ ...mainConfig, ...customConfigs })
    document.querySelector(
      'div.table-toolbar').innerHTML = `<a id="table-reset-state-cta" class="regular-link" data-i18n="common.resetFilters"></a>`

    $('#table-reset-state-cta').
      click(() => TableUtils.resetDynamicTableState(instance))

    /*if(resetFilters) TableUtils.resetDynamicTableState(instance)*/
    return instance
  },
  resetDynamicTableState: (instance, autoReload = true) => {
    if(autoReload){
      configs.goToPage(
        configs.getCurrentPage(),
        null, true)
    }

    instance.state.clear()
  },
  setupStaticTable: (
    tableID, onDrawCallback, ordering = false, customOrdering = undefined,
    pageLength = 50) => {
    $(tableID).DataTable({
      'order': customOrdering, /*[[0, "desc"]], */
      'ordering': ordering,
      'lengthChange': true,
      'pageLength': pageLength,
      'language': TableUtils.getLocalizedLanguageObject(),
      drawCallback: onDrawCallback,
    })
  },
  setupStaticTableWithCustomColumnWidths: (
    tableID, customColumnWidths, onDrawCallback, ordering = false,
    pageLegth = 50) => {
    $(tableID).DataTable({
      /*"order": [[0, "desc"]],*/
      'ordering': ordering,
      'lengthChange': false,
      'pageLength': pageLegth,
      'columnDefs': customColumnWidths,
      'language': TableUtils.getLocalizedLanguageObject(),
      drawCallback: onDrawCallback,
    })
  },
  getLocalizedLanguageObject: () => {
    return {
      'lengthMenu': '',
      'zeroRecords': Localization.getString('common.tableZeroRecords'),
      'info': Localization.getString('common.tableInfo'),
      'infoEmpty': Localization.getString('common.tableInfoEmpty'),
      'infoFiltered': Localization.getString('common.tableInfoFiltered'),
      'search': `${Localization.getString('common.search')}
  :
    `,
      'paginate': {
        'next': Localization.getString('common.tablePaginateNext'),
        'previous': Localization.getString('common.tablePaginatePrevious'),
      },
    }
  },
}

//# sourceURL=js/utils/tableUtils.js