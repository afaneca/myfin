import {Localization} from './localization.js';

export const TableUtils = {
  setupDynamicTable: (
      tableId, fetchLimit, columnsRenderingArr, renderPageCallback,
      drawCallback, customRowId = null, customConfigs = {}) => {
    const mainConfig = {
      ordering: false,
      paging: true,
      pageLength: fetchLimit,
      ajax: function(data, callback, settings) {
        const page = data.start / data.length;
        renderPageCallback(page, data.search.value, callback);
      },
      serverSide: true,
      processing: false,
      'language': TableUtils.getLocalizedLanguageObject(),
      drawCallback: drawCallback,
      columns: columnsRenderingArr,
      rowId: customRowId,
    }

    return $(tableId).DataTable({...mainConfig, ...customConfigs});
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
    });
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
    });
  },
  getLocalizedLanguageObject: () => {
    return {
      'lengthMenu': '',
      'zeroRecords': Localization.getString('common.tableZeroRecords'),
      'info': Localization.getString('common.tableInfo'),
      'infoEmpty': Localization.getString('common.tableInfoEmpty'),
      'infoFiltered': Localization.getString('common.tableInfoFiltered'),
      'search': `${Localization.getString('common.search')}:`,
      'paginate': {
        'next': Localization.getString('common.tablePaginateNext'),
        'previous': Localization.getString('common.tablePaginatePrevious'),
      },
    };
  },
};

//# sourceURL=js/utils/tableUtils.js