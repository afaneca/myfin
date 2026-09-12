import { Box, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';
import {
  AssetClassReturnStats,
  PeriodReturnMetrics,
} from '../../../services/invest/investServices.ts';
import { getCurrentYear } from '../../../utils/dateUtils.ts';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';
import ReturnMetricsDetails from '../ReturnMetricsDetails.tsx';

type Props = {
  list: AssetClassReturnStats[];
};

const ReturnCell = (props: {
  assetClass: string;
  metrics: PeriodReturnMetrics;
  period: 'currentYear' | 'global';
}) => {
  const { t } = useTranslation();
  const percentage = props.metrics.portfolio_return.cumulative_percentage;

  return (
    <Stack py={1}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {formatNumberAsCurrency(props.metrics.absolute_return_value)}
        <ReturnMetricsDetails
          ariaLabel={t('investments.returnMetrics.classDetailsAriaLabel', {
            name: props.assetClass,
          })}
          metrics={props.metrics}
          title={
            props.period === 'currentYear'
              ? t('investments.returnMetrics.classYearDetailsTitle', {
                  name: props.assetClass,
                  year: getCurrentYear(),
                })
              : t('investments.returnMetrics.classDetailsTitle', {
                  name: props.assetClass,
                })
          }
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
    </Stack>
  );
};

const AssetClassRoiList = (props: Props) => {
  const { t } = useTranslation();
  const localizedAssetType = useGetLocalizedAssetType();

  const rows = useMemo(
    () =>
      [...props.list]
        .sort((left, right) => right.current_value - left.current_value)
        .map((item) => ({
          id: item.type,
          assetClass: localizedAssetType.invoke(item.type),
          assetCount: item.asset_count,
          investedValue: item.invested_value,
          feesTaxes: item.fees_taxes,
          currentValue: item.current_value,
          allocation: item.allocation_percentage,
          currentYearReturn: item.return_metrics.current_year,
          globalReturn: item.return_metrics.global,
        })),
    [localizedAssetType, props.list],
  );

  const columns: GridColDef[] = [
    {
      field: 'assetClass',
      headerName: t('investments.assetClass'),
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'assetCount',
      headerName: t('investments.assetCount'),
      minWidth: 90,
    },
    {
      field: 'investedValue',
      headerName: t('investments.investedValue'),
      minWidth: 140,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'feesTaxes',
      headerName: t('investments.feesAndTaxes'),
      minWidth: 125,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'currentValue',
      headerName: t('investments.currentValue'),
      minWidth: 130,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'allocation',
      headerName: t('investments.allocation'),
      minWidth: 105,
      renderCell: (params) => formatNumberAsPercentage(params.value),
    },
    {
      field: 'currentYearReturn',
      headerName: t('investments.returnMetrics.returnYear', {
        year: getCurrentYear(),
      }),
      minWidth: 170,
      renderCell: (params) => (
        <ReturnCell
          assetClass={params.row.assetClass}
          metrics={params.value}
          period="currentYear"
        />
      ),
    },
    {
      field: 'globalReturn',
      headerName: t('investments.returnMetrics.returnSinceStart'),
      minWidth: 170,
      renderCell: (params) => (
        <ReturnCell
          assetClass={params.row.assetClass}
          metrics={params.value}
          period="global"
        />
      ),
    },
  ];

  return (
    <MyFinStaticTable
      columns={columns}
      isRefetching={false}
      paginationModel={{ pageSize: 10 }}
      rows={rows}
    />
  );
};

export default AssetClassRoiList;
