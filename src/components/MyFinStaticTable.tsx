import { Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { GridSlots, useGridApiRef } from '@mui/x-data-grid';
import { enUS, ptPT } from '@mui/x-data-grid/locales';
import { GridRowsProp } from '@mui/x-data-grid/models';
import type { GridColDef } from '@mui/x-data-grid/models/colDef';
import i18next from 'i18next';
import { memo, useEffect } from 'react';
import { NoRows, StyledDataGrid } from './MyFinTable.tsx';

type Props = {
  isRefetching: boolean;
  rows: GridRowsProp;
  columns: GridColDef[];
  paginationModel: { pageSize: number; page?: number };
  onRowClicked?: (id: bigint) => void;
  onPaginationModelChange?: (model: { pageSize: number; page: number }) => void;
  scrollToId?: number | string;
};

const MyFinStaticTable = (props: Props) => {
  const {
    isRefetching,
    rows,
    columns,
    paginationModel,
    onPaginationModelChange,
    scrollToId,
  } = props;
  const apiRef = useGridApiRef();

  useEffect(() => {
    if (!scrollToId) return;
    if (!apiRef || !apiRef.current) return;

    setTimeout(() => {
      try {
        const rowIndex =
          apiRef.current?.getRowIndexRelativeToVisibleRows(scrollToId);
        if (rowIndex != null) {
          apiRef.current?.scrollToIndexes({ rowIndex });
        }
      } catch (e) {
        // ignore
        console.debug('Could not scroll to row', e);
      }
    }, 100);
  }, [scrollToId, apiRef]);

  // Ensure Grid receives correct pagination model shape (page is required)
  const gridPaginationModel: GridPaginationModel | undefined =
    paginationModel && paginationModel.page !== undefined
      ? { page: paginationModel.page, pageSize: paginationModel.pageSize }
      : undefined;

  const getLocaleTextForDataGrid = () => {
    switch (i18next.resolvedLanguage) {
      case 'pt':
        return ptPT.components.MuiDataGrid.defaultProps.localeText;
      default:
        return enUS.components.MuiDataGrid.defaultProps.localeText;
    }
  };

  return (
    <Box sx={{ height: 'auto', width: '100%' }}>
      <StyledDataGrid
        apiRef={apiRef}
        slots={{
          loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
          noRowsOverlay: NoRows,
        }}
        loading={isRefetching}
        rows={rows}
        columns={columns}
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: paginationModel,
          },
        }}
        paginationModel={gridPaginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 15, 20, 50, 100]}
        disableRowSelectionOnClick
        onRowClick={(row) => props.onRowClicked?.(BigInt(row.id))}
        autoHeight
        getRowHeight={() => 'auto'}
        getRowClassName={(params) =>
          params.row.highlight == true ? 'highlighted-row' : 'regular-row'
        }
        sx={{
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
          },
          minHeight: 300,
        }}
        localeText={getLocaleTextForDataGrid()}
      />
    </Box>
  );
};

export default memo(MyFinStaticTable);
