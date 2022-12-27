import { Localization } from './localization.js'

export const tableUtils = {
  setupStaticTable: (tableID, onDrawCallback, ordering = false, customOrdering = undefined, pageLength = 50) => {
    $(tableID).DataTable({
      "order": customOrdering, /*[[0, "desc"]], */
      'ordering': ordering,
      'lengthChange': true,
      'pageLength': pageLength,
      'language': {
        'lengthMenu': '',
        'zeroRecords': Localization.getString("common.tableZeroRecords"),
        'info': Localization.getString("common.tableInfo"),
        'infoEmpty': Localization.getString("common.tableInfoEmpty"),
        'infoFiltered': Localization.getString("common.tableInfoFiltered"),
        'search': `${Localization.getString('common.search')}:`,
        'paginate': {
          'next': Localization.getString("common.tablePaginateNext"),
          'previous': Localization.getString("common.tablePaginatePrevious"),
        },
      },
      drawCallback: onDrawCallback,
    })
  },
  setupStaticTableWithCustomColumnWidths: (tableID, customColumnWidths, onDrawCallback, ordering = false) => {
    $(tableID).DataTable({
      /*"order": [[0, "desc"]],*/
      'ordering': ordering,
      'lengthChange': false,
      'pageLength': 50,
      'columnDefs': customColumnWidths,
      'language': {
        'lengthMenu':'',
        'zeroRecords': Localization.getString("common.tableZeroRecords"),
        'info': Localization.getString("common.tableInfo"),
        'infoEmpty': Localization.getString("common.tableInfoEmpty"),
        'infoFiltered': Localization.getString("common.tableInfoFiltered"),
        'search': `${Localization.getString('common.search')}:`,
        'paginate': {
          'next': Localization.getString("common.tablePaginateNext"),
          'previous': Localization.getString("common.tablePaginatePrevious"),
        },
      },
      drawCallback: onDrawCallback,
    })
  },
}

//# sourceURL=js/utils/tableUtils.js