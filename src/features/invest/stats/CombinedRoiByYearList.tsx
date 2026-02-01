import { YearlyRoi } from '../../../services/invest/investServices.ts';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import Typography from '@mui/material/Typography';
import PercentageChip from '../../../components/PercentageChip.tsx';

export type CombinedRoiByYearData = {
  year: number;
} & YearlyRoi;

type Props = {
  list: CombinedRoiByYearData[];
};

const CombinedRoiByYearList = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const filteredItems = useMemo(() => {
    return props.list;
  }, [props.list]);

  const rows = useMemo(
    () =>
      props.list
        .sort((a, b) => b.year - a.year)
        .map((item) => ({
          id: item.year,
          year: item.year,
          inflow: item.total_inflow,
          outflow: item.total_outflow,
          globalValue: item.ending_value,
          globalRoi: {
            percentage: item.roi_percentage,
            absolute: item.roi_value,
          },
        })),
    [filteredItems],
  );
  const columns: GridColDef[] = [
    {
      field: 'year',
      headerName: t('investments.year'),
      minWidth: 50,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Typography
          pt={2}
          pb={2}
          variant="body2"
          color={theme.palette.text.primary}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'inflow',
      headerName: t('investments.inflow'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'outflow',
      headerName: t('investments.outflow'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value ?? 0)}`,
    },
    {
      field: 'globalValue',
      headerName: t('investments.globalValue'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'globalRoi',
      headerName: t('investments.globalROI'),
      minWidth: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box
          pt={2}
          pb={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {formatNumberAsCurrency(params.value.absolute)} <br />
          <PercentageChip
            percentage={params.value.percentage}
            sx={{ mt: 0.2, '& .MuiChip-label': { fontSize: '0.9em' } }}
          />
        </Box>
      ),
    },
  ];

  return (
    <MyFinStaticTable
      rows={rows}
      columns={columns}
      paginationModel={{ pageSize: 5 }}
      isRefetching={false}
    />
  );
};

export default CombinedRoiByYearList;
