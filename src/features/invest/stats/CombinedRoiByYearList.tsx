import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';
import { YearlyRoi } from '../../../services/invest/investServices.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import ReturnMetricsDetails from '../ReturnMetricsDetails.tsx';

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
          contributions:
            item.return_metrics?.cash_flows.contributions ??
            item.contributions ??
            item.total_inflow,
          withdrawals:
            item.return_metrics?.cash_flows.withdrawals ??
            item.withdrawals ??
            item.total_outflow,
          globalValue: item.ending_value,
          portfolioReturn: {
            percentage:
              item.return_metrics?.portfolio_return.cumulative_percentage ??
              item.roi_percentage,
            absolute:
              item.return_metrics?.absolute_return_value ?? item.roi_value,
            metrics: item.return_metrics,
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
      field: 'contributions',
      headerName: t('investments.contributions'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'withdrawals',
      headerName: t('investments.withdrawals'),
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
      field: 'portfolioReturn',
      headerName: t('investments.returnMetrics.return'),
      minWidth: 160,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            {formatNumberAsCurrency(params.value.absolute)}
            {params.value.metrics && (
              <ReturnMetricsDetails
                ariaLabel={t('investments.returnMetrics.detailsAriaLabel', {
                  year: params.row.year,
                })}
                metrics={params.value.metrics}
                title={t('investments.returnMetrics.detailsForYear', {
                  year: params.row.year,
                })}
              />
            )}
          </Box>
          {params.value.percentage !== null ? (
            <PercentageChip
              percentage={params.value.percentage}
              sx={{ mt: 0.2, '& .MuiChip-label': { fontSize: '0.9em' } }}
            />
          ) : (
            <Typography color="text.secondary" variant="caption">
              -
            </Typography>
          )}
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
