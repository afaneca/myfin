import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';
import { InvestAsset } from '../../../services/invest/investServices.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import ReturnMetricsDetails from '../ReturnMetricsDetails.tsx';

type Props = {
  asset: InvestAsset | null;
  onClose: () => void;
};

const AssetYearlyPerformanceDialog = (props: Props) => {
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      Object.entries(props.asset?.return_metrics?.by_year ?? {})
        .map(([year, data]) => ({
          id: year,
          year: Number(year),
          contributions: data.return_metrics.cash_flows.contributions,
          withdrawals: data.return_metrics.cash_flows.withdrawals,
          endingValue: data.ending_value,
          metrics: data.return_metrics,
        }))
        .sort((left, right) => right.year - left.year),
    [props.asset],
  );

  const columns: GridColDef[] = [
    {
      field: 'year',
      headerName: t('investments.year'),
      minWidth: 80,
    },
    {
      field: 'contributions',
      headerName: t('investments.contributions'),
      minWidth: 130,
      flex: 1,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'withdrawals',
      headerName: t('investments.withdrawals'),
      minWidth: 130,
      flex: 1,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'endingValue',
      headerName: t('investments.endingValue'),
      minWidth: 130,
      flex: 1,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'metrics',
      headerName: t('investments.returnMetrics.return'),
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const percentage =
          params.value.portfolio_return.cumulative_percentage;
        return (
          <Box py={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {formatNumberAsCurrency(params.value.absolute_return_value)}
              <ReturnMetricsDetails
                ariaLabel={t(
                  'investments.returnMetrics.assetYearDetailsAriaLabel',
                  {
                    name: props.asset?.name,
                    year: params.row.year,
                  },
                )}
                metrics={params.value}
                performanceReturnHelp={t(
                  'investments.returnMetrics.assetReturnHelp',
                )}
                performanceReturnLabel={t(
                  'investments.returnMetrics.assetReturnTwr',
                )}
                title={t(
                  'investments.returnMetrics.assetYearDetailsTitle',
                  {
                    name: props.asset?.name,
                    year: params.row.year,
                  },
                )}
              />
            </Box>
            {percentage === null ? (
              <Typography color="text.secondary" variant="caption">
                -
              </Typography>
            ) : (
              <PercentageChip
                percentage={percentage}
                sx={{ '& .MuiChip-label': { fontSize: '0.9em' } }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      onClose={props.onClose}
      open={props.asset !== null}
    >
      <DialogTitle>
        {t('investments.yearlyPerformanceTitle', {
          name: props.asset?.name,
        })}
      </DialogTitle>
      <IconButton
        aria-label={t('common.close')}
        onClick={props.onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <Close />
      </IconButton>
      <DialogContent dividers>
        <MyFinStaticTable
          columns={columns}
          isRefetching={false}
          paginationModel={{ pageSize: 10 }}
          rows={rows}
        />
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default AssetYearlyPerformanceDialog;
