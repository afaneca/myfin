import { YearlyRoi } from '../../../services/invest/investServices.ts';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import Typography from '@mui/material/Typography/Typography';
import Chip from '@mui/material/Chip/Chip';

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
          investedValue: item.invested_in_year_amount,
          feesAndTaxes: item.fees_taxes,
          currentValue: item.value_total_amount,
          globalRoi: {
            percentage: item.roi_percentage,
            absolute: item.roi_amount,
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
      field: 'investedValue',
      headerName: t('investments.investedValue'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'feesAndTaxes',
      headerName: t('investments.feesAndTaxes'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value ?? 0)}`,
    },
    {
      field: 'currentValue',
      headerName: t('investments.currentValue'),
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
          <Chip
            sx={{ mt: 0.2 }}
            variant="outlined"
            size="small"
            color={
              !Number.isFinite(params.value.percentage)
                ? 'default'
                : params.value.percentage < 0
                  ? 'warning'
                  : 'success'
            }
            label={
              !Number.isFinite(params.value.percentage)
                ? '-%'
                : formatNumberAsPercentage(params.value.percentage, true)
            }
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
