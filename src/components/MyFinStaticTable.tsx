import { memo } from 'react';
import { GridSlots } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import type { GridColDef } from '@mui/x-data-grid/models/colDef';
import { GridRowsProp } from '@mui/x-data-grid/models';
import { ptPT, enUS } from '@mui/x-data-grid/locales';
import i18next from 'i18next';
import { NoRows, StyledDataGrid } from './MyFinTable.tsx';
import { Box } from '@mui/material';

type Props = {
  isRefetching: boolean;
  rows: GridRowsProp;
  columns: GridColDef[];
  paginationModel: { pageSize: number };
  onRowClicked?: (id: bigint) => void;
};

const MyFinStaticTable = (props: Props) => {
  const { isRefetching, rows, columns, paginationModel } = props;

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
        pageSizeOptions={[5, 10, 15, 20, 50, 100]}
        /*onPaginationModelChange={setPaginationModel}*/
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
          },
          minHeight: 300,
        }}
        localeText={getLocaleTextForDataGrid()}
      />
    </Box>
  );
};

export default memo(MyFinStaticTable);
