import { Box, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';
import { InvestAsset } from '../../../services/invest/investServices.ts';
import { getCurrentYear } from '../../../utils/dateUtils.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';
import ReturnMetricsDetails from '../ReturnMetricsDetails.tsx';

type Props = {
  list: InvestAsset[];
};

const AssetRoiList = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getLocalizedAssetType = useGetLocalizedAssetType();

  const filteredAssets = useMemo(() => {
    return props.list;
  }, [props.list]);

  const rows = useMemo(
    () =>
      props.list.map((asset) => ({
        id: asset.asset_id,
        name: { name: asset.name, type: asset.type },
        invested: {
          invested: asset.invested_value,
          pricePerUnit: asset.price_per_unit,
        },
        feesTaxes: asset.fees_taxes,
        currentValue: asset.current_value,
        currentYearRoi: asset,
        globalRoi: {
          absolute: asset.absolute_roi_value,
          assetName: asset.name,
          metrics: asset.return_metrics?.global,
          percentage: asset.relative_roi_percentage,
        },
      })),
    [filteredAssets],
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('investments.name'),
      minWidth: 200,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack pt={2} pb={2}>
          <Typography variant="body1" color={theme.palette.text.primary}>
            {params.value.name}
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            {getLocalizedAssetType.invoke(params.value.type)}
            {params.value.broker}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'invested',
      headerName: t('investments.investedValue'),
      minWidth: 150,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack>
          <Typography variant="body1" color={theme.palette.text.primary}>
            {formatNumberAsCurrency(params.value.invested)}
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            {t('investments.perUnitPrice', {
              price: formatNumberAsCurrency(params.value.pricePerUnit),
            })}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'feesTaxes',
      headerName: t('investments.feesAndTaxes'),
      minWidth: 150,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{formatNumberAsCurrency(params.value)}</p>,
    },
    {
      field: 'currentValue',
      headerName: t('investments.currentValue'),
      minWidth: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{formatNumberAsCurrency(params.value)}</p>,
    },
    {
      field: 'currentYearRoi',
      headerName: t('investments.returnMetrics.returnYear', {
        year: getCurrentYear(),
      }),
      minWidth: 160,
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const metrics = params.value.return_metrics?.current_year;
        const personalReturn = metrics?.personal_return.annualized_percentage;
        return metrics ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Box>
              {formatNumberAsCurrency(metrics.absolute_return_value)}
              <ReturnMetricsDetails
                ariaLabel={t(
                  'investments.returnMetrics.assetDetailsAriaLabel',
                  {
                    name: params.value.name,
                  },
                )}
                metrics={metrics}
                performanceReturnHelp={t(
                  'investments.returnMetrics.assetReturnHelp',
                )}
                performanceReturnLabel={t(
                  'investments.returnMetrics.assetReturnTwr',
                )}
                title={t('investments.returnMetrics.assetYearDetailsTitle', {
                  name: params.value.name,
                  year: getCurrentYear(),
                })}
              />
            </Box>
            {personalReturn !== null && personalReturn !== undefined && (
              <PercentageChip
                percentage={personalReturn}
                sx={{ '& .MuiChip-label': { fontSize: '0.9em' } }}
              />
            )}
          </Box>
        ) : (
          <i>{t('common.soon')}...</i>
        );
      },
    },
    {
      field: 'globalRoi',
      headerName: t('investments.returnMetrics.returnSinceStart'),
      minWidth: 160,
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const personalReturn =
          params.value.metrics?.personal_return.annualized_percentage;
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Box>
              {formatNumberAsCurrency(
                params.value.metrics?.absolute_return_value ??
                  params.value.absolute,
              )}
              {params.value.metrics && (
                <ReturnMetricsDetails
                  ariaLabel={t(
                    'investments.returnMetrics.assetDetailsAriaLabel',
                    {
                      name: params.value.assetName,
                    },
                  )}
                  metrics={params.value.metrics}
                  performanceReturnHelp={t(
                    'investments.returnMetrics.assetReturnHelp',
                  )}
                  performanceReturnLabel={t(
                    'investments.returnMetrics.assetReturnTwr',
                  )}
                  title={t('investments.returnMetrics.assetDetailsTitle', {
                    name: params.value.assetName,
                  })}
                />
              )}
            </Box>
            {personalReturn !== null && personalReturn !== undefined && (
              <PercentageChip
                percentage={personalReturn}
                sx={{ '& .MuiChip-label': { fontSize: '0.9em' } }}
              />
            )}
          </Box>
        );
      },
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

export default AssetRoiList;
