import { useTranslation } from 'react-i18next';

import { InvestAsset } from '../../../services/invest/investServices.ts';
import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import Stack from '@mui/material/Stack/Stack';
import Typography from '@mui/material/Typography/Typography';
import { Box, useTheme } from '@mui/material';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import Chip from '@mui/material/Chip/Chip';

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
      headerName: t('investments.currentYearROI'),
      minWidth: 150,
      editable: false,
      sortable: false,
      renderCell: (_params) => <i>{t('common.soon')}...</i>,
    },
    {
      field: 'globalRoi',
      headerName: t('investments.globalROI'),
      minWidth: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box
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

export default AssetRoiList;
