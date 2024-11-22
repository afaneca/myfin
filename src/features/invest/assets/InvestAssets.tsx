import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import {
  useGetAssets,
  useRemoveAsset,
} from '../../../services/invest/investHooks.ts';
import React, { useEffect, useMemo, useReducer } from 'react';
import { InvestAsset } from '../../../services/invest/investServices.ts';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { GridColDef } from '@mui/x-data-grid';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import Button from '@mui/material/Button/Button';
import {
  AddCircleOutline,
  Delete,
  Edit,
  MonetizationOn,
  Search,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Box, Checkbox, FormGroup, Tooltip, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import Typography from '@mui/material/Typography/Typography';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import UpdateAssetValueDialog from './UpdateAssetValueDialog.tsx';
import AddEditInvestAssetDialog from './AddEditInvestAssetDialog.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';

type UiState = {
  assets?: InvestAsset[];
  filteredAssets?: InvestAsset[];
  searchQuery: string;
  showInactive: boolean;
  actionableAsset?: InvestAsset;
  isEditDialogOpen: boolean;
  isRemoveDialogOpen: boolean;
  isUpdateAssetValueDialogOpen: boolean;
};

const enum StateActionType {
  DataLoaded,
  SearchQueryUpdated,
  ShowInactiveUpdated,
  AddClick,
  EditClick,
  RemoveClick,
  DialogDismissed,
  DialogConfirmationClick,
  DialogUpdateAssetValueClick,
}

type StateAction =
  | {
      type: StateActionType.DataLoaded;
      payload: InvestAsset[];
    }
  | { type: StateActionType.SearchQueryUpdated; payload: string }
  | { type: StateActionType.ShowInactiveUpdated; payload: boolean }
  | { type: StateActionType.DialogDismissed }
  | { type: StateActionType.AddClick }
  | { type: StateActionType.EditClick; payload: InvestAsset }
  | { type: StateActionType.RemoveClick; payload: InvestAsset }
  | { type: StateActionType.DialogConfirmationClick }
  | { type: StateActionType.DialogUpdateAssetValueClick; payload: InvestAsset };

const createInitialState = (): UiState => {
  return {
    searchQuery: '',
    showInactive: false,
    isEditDialogOpen: false,
    isRemoveDialogOpen: false,
    isUpdateAssetValueDialogOpen: false,
  };
};

const filterItems = (
  list: InvestAsset[],
  searchQuery: string,
  showInactive: boolean,
) => {
  return list.filter(
    (asset) =>
      JSON.stringify(asset).toLowerCase().includes(searchQuery.toLowerCase()) &&
      (showInactive || asset.units > 0),
  );
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded:
      return {
        ...prevState,
        assets: action.payload,
        filteredAssets: filterItems(
          action.payload,
          prevState?.searchQuery,
          prevState?.showInactive,
        ),
      };
    case StateActionType.SearchQueryUpdated:
      return {
        ...prevState,
        searchQuery: action.payload,
        filteredAssets: filterItems(
          prevState.assets || [],
          action.payload,
          prevState?.showInactive,
        ),
      };
    case StateActionType.ShowInactiveUpdated:
      return {
        ...prevState,
        showInactive: action.payload,
        filteredAssets: filterItems(
          prevState.assets || [],
          prevState.searchQuery,
          action.payload,
        ),
      };
    case StateActionType.DialogDismissed:
      return {
        ...prevState,
        isRemoveDialogOpen: false,
        isEditDialogOpen: false,
        isUpdateAssetValueDialogOpen: false,
        actionableAsset: undefined,
      };
    case StateActionType.DialogConfirmationClick:
      return {
        ...prevState,
        isEditDialogOpen: true,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: false,
        actionableAsset: undefined,
      };
    case StateActionType.DialogUpdateAssetValueClick:
      return {
        ...prevState,
        isEditDialogOpen: false,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: true,
        actionableAsset: action.payload,
      };
    case StateActionType.RemoveClick:
      return {
        ...prevState,
        isEditDialogOpen: false,
        isRemoveDialogOpen: true,
        isUpdateAssetValueDialogOpen: false,
        actionableAsset: action.payload,
      };
    case StateActionType.AddClick:
      return {
        ...prevState,
        isEditDialogOpen: true,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: false,
        actionableAsset: undefined,
      };
    case StateActionType.EditClick:
      return {
        ...prevState,
        isEditDialogOpen: true,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: false,
        actionableAsset: action.payload,
      };
  }
};

const InvestAssets = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getAssetsRequest = useGetAssets();
  const removeAssetRequest = useRemoveAsset();
  const getLocalizedAssetTypeText = useGetLocalizedAssetType();
  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  // Loading
  useEffect(() => {
    if (getAssetsRequest.isFetching || removeAssetRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getAssetsRequest.isFetching, removeAssetRequest.isPending]);

  // Error
  useEffect(() => {
    if (getAssetsRequest.isError || removeAssetRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getAssetsRequest.isError, removeAssetRequest.isError]);

  // Success
  useEffect(() => {
    if (!getAssetsRequest.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: getAssetsRequest.data,
    });
  }, [getAssetsRequest.data]);

  const rows = useMemo(
    () =>
      state?.filteredAssets?.map((asset: InvestAsset) => ({
        id: asset.asset_id,
        name: { name: asset.name, broker: asset.broker, type: asset.type },
        units: { qty: asset.units, ticker: asset.ticker },
        investedValue: {
          invested: asset.currently_invested_value,
          pricePerUnit: asset.price_per_unit,
        },
        feesTaxes: asset.fees_taxes,
        currentValue: asset,
        currentRoi: {
          absolute: asset.absolute_roi_value,
          percentage: asset.relative_roi_percentage,
        },
        actions: asset,
      })),
    [state?.filteredAssets],
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
        <Stack>
          <Typography variant="body1" color={theme.palette.text.primary}>
            {params.value.name}
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            {getLocalizedAssetTypeText.invoke(params.value.type)} @{' '}
            {params.value.broker}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'units',
      headerName: t('investments.units'),
      minWidth: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="column">
          <Typography variant="body1" color={theme.palette.text.primary}>
            {params.value.qty}
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            {params.value.ticker}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'investedValue',
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
      minWidth: 120,
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
      renderCell: (params) => (
        <p>
          {formatNumberAsCurrency(params.value.current_value)}
          {
            <Tooltip title={t('investments.updateValue')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  dispatch({
                    type: StateActionType.DialogUpdateAssetValueClick,
                    payload: params.value,
                  });
                }}
              >
                <MonetizationOn />
              </IconButton>
            </Tooltip>
          }
        </p>
      ),
    },
    {
      field: 'currentRoi',
      headerName: t('investments.currentROI'),
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
          <PercentageChip
            percentage={params.value.percentage}
            hideIcon
            sx={{
              '& .MuiChip-label': { fontSize: '0.9em' },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={0}>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() =>
              dispatch({
                type: StateActionType.EditClick,
                payload: params.value,
              })
            }
          >
            <Edit fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              dispatch({
                type: StateActionType.RemoveClick,
                payload: params.value,
              });
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (!state) return null;
  return (
    <Grid container spacing={2} xs={12}>
      {state.isEditDialogOpen && (
        <AddEditInvestAssetDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onSuccess={() => dispatch({ type: StateActionType.DialogDismissed })}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.DialogDismissed })
          }
          asset={state.actionableAsset}
        />
      )}
      {state.isUpdateAssetValueDialogOpen && (
        <UpdateAssetValueDialog
          isOpen={true}
          onSuccess={() => dispatch({ type: StateActionType.DialogDismissed })}
          onCanceled={() => dispatch({ type: StateActionType.DialogDismissed })}
          assetId={state.actionableAsset?.asset_id || -1n}
          currentValue={state.actionableAsset?.current_value || 0}
          assetName={state.actionableAsset?.name || ''}
        />
      )}
      {state.isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onPositiveClick={() => {
            removeAssetRequest.mutate(state.actionableAsset?.asset_id || -1n);
            dispatch({ type: StateActionType.DialogDismissed });
          }}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.DialogDismissed })
          }
          titleText={t('investments.deleteAssetModalTitle', {
            name: state.actionableAsset?.name,
          })}
          descriptionText={t('investments.deleteAssetModalSubtitle')}
          alert={t('investments.deleteAssetModalAlert')}
          positiveText={t('common.delete')}
        />
      )}
      <Grid xs={12} md={8}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          startIcon={<AddCircleOutline />}
          onClick={() => {
            dispatch({ type: StateActionType.AddClick });
          }}
        >
          {t('investments.addAssetCTA')}
        </Button>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.showInactive == true}
                onChange={(_, checked) =>
                  dispatch({
                    type: StateActionType.ShowInactiveUpdated,
                    payload: checked,
                  })
                }
              />
            }
            label={t('investments.showInactives')}
          />
        </FormGroup>
      </Grid>
      <Grid
        xs={12}
        md={4}
        xsOffset="auto"
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <TextField
          id="search"
          label={t('common.search')}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch({
              type: StateActionType.SearchQueryUpdated,
              payload: event.target.value,
            });
          }}
        />
      </Grid>
      <Grid xs={12}>
        <MyFinStaticTable
          isRefetching={getAssetsRequest.isRefetching}
          rows={rows || []}
          columns={columns}
          paginationModel={{ pageSize: 20 }}
          onRowClicked={(id) => {
            const asset = state.assets?.find((asset) => asset.asset_id == id);
            if (!asset) return;
            dispatch({ type: StateActionType.EditClick, payload: asset });
          }}
        />
      </Grid>
    </Grid>
  );
};

export default InvestAssets;
