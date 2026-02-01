import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import {
  InvestAsset,
  InvestTransaction,
  InvestTransactionsPageResponse,
  InvestTransactionType,
} from '../../../services/invest/investServices.ts';
import { useGetInvestTransactions, useRemoveInvestTransaction } from '../../../services/invest/investHooks.ts';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MyFinTable from '../../../components/MyFinTable.tsx';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import { AlertSeverity, useSnackbar } from '../../../providers/SnackbarProvider.tsx';
import { debounce } from 'lodash';
import { GridColDef } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import {
  getDayNumberFromUnixTimestamp,
  getMonthShortStringFromUnixTimestamp,
  getShortYearFromUnixTimestamp,
} from '../../../utils/dateUtils.ts';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useGetLocalizedAssetType, useGetLocalizedInvestTransactionType } from '../InvestUtilHooks.ts';
import Chip from '@mui/material/Chip';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import IconButton from '@mui/material/IconButton';
import AddEditInvestTransactionDialog from './AddEditInvestTransactionDialog.tsx';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import UpdateAssetValueDialog from '../assets/UpdateAssetValueDialog.tsx';

type UiState = {
  isLoading: boolean;
  paginationModel: { pageSize: number; page: number };
  searchQuery: string;
  page?: InvestTransactionsPageResponse;
  actionableTransaction?: InvestTransaction;
  actionableAsset?: InvestAsset;
  isAddEditDialogOpen: boolean;
  isRemoveDialogOpen: boolean;
  isUpdateAssetValueDialogOpen: boolean;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestError,
  PaginationModelChanged,
  SearchQueryUpdated,
  AddClick,
  EditClick,
  RemoveClick,
  DialogDismissed,
  DialogSuccess,
}

type StateAction =
  | {
  type: StateActionType.RequestSuccess;
  payload: InvestTransactionsPageResponse;
}
  | { type: StateActionType.RequestError }
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.SearchQueryUpdated; payload: string }
  | { type: StateActionType.AddClick }
  | { type: StateActionType.EditClick; payload: InvestTransaction }
  | { type: StateActionType.RemoveClick; payload: InvestTransaction }
  | { type: StateActionType.DialogDismissed }
  | { type: StateActionType.DialogSuccess; payload: InvestAsset }
  | {
  type: StateActionType.PaginationModelChanged;
  payload: { pageSize: number; page: number };
};

const createInitialState = (): UiState => {
  return {
    isLoading: true,
    paginationModel: { pageSize: 20, page: 0 },
    searchQuery: '',
    isAddEditDialogOpen: false,
    isRemoveDialogOpen: false,
    isUpdateAssetValueDialogOpen: false,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestSuccess:
      return {
        ...prevState,
        page: action.payload,
        isLoading: false,
      };
    case StateActionType.RequestError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.PaginationModelChanged:
      return {
        ...prevState,
        paginationModel: action.payload,
      };
    case StateActionType.SearchQueryUpdated:
      return {
        ...prevState,
        searchQuery: action.payload,
      };
    case StateActionType.EditClick:
      return {
        ...prevState,
        isAddEditDialogOpen: true,
        isRemoveDialogOpen: false,
        actionableTransaction: action.payload,
      };
    case StateActionType.RemoveClick:
      return {
        ...prevState,
        isAddEditDialogOpen: false,
        isRemoveDialogOpen: true,
        actionableTransaction: action.payload,
      };
    case StateActionType.DialogDismissed:
      return {
        ...prevState,
        isAddEditDialogOpen: false,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: false,
        actionableTransaction: undefined,
        actionableAsset: undefined,
      };
    case StateActionType.DialogSuccess:
      return {
        ...prevState,
        isAddEditDialogOpen: false,
        isRemoveDialogOpen: false,
        isUpdateAssetValueDialogOpen: true,
        actionableAsset: action.payload,
      };
    case StateActionType.AddClick:
      return {
        ...prevState,
        isAddEditDialogOpen: true,
        isRemoveDialogOpen: false,
        actionableTransaction: undefined,
        actionableAsset: undefined,
      };
  }
};

const InvestTransactions = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const theme = useTheme();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);
  const getLocalizedAssetTypeText = useGetLocalizedAssetType();
  const getLocalizedInvestTransactionType =
    useGetLocalizedInvestTransactionType();
  const getTransactionsRequest = useGetInvestTransactions(
    state.paginationModel.page,
    state.paginationModel.pageSize,
    state.searchQuery,
  );
  const removeTransactionRequest = useRemoveInvestTransaction();

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading]);

  // Error
  useEffect(() => {
    if (getTransactionsRequest.isError || removeTransactionRequest.isError) {
      dispatch({ type: StateActionType.RequestError });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getTransactionsRequest.isError, removeTransactionRequest.isError]);

  // Success
  useEffect(() => {
    if (!getTransactionsRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getTransactionsRequest.data,
    });
  }, [getTransactionsRequest.data]);

  const handlePaginationModelChange: React.Dispatch<
    React.SetStateAction<{
      pageSize: number;
      page: number;
    }>
  > = useCallback((newModel) => {
    dispatch({
      type: StateActionType.PaginationModelChanged,
      payload:
        typeof newModel === 'function'
          ? newModel(state.paginationModel)
          : newModel,
    });
  }, []);

  const debouncedSearchQuery = debounce((value: string) => {
    dispatch({ type: StateActionType.SearchQueryUpdated, payload: value });
  }, 300);

  const rows = useMemo(
    () =>
      state.page?.results.map((result: InvestTransaction) => ({
        id: result.transaction_id,
        date: { date: result.date_timestamp, type: result.trx_type },
        asset: {
          name: result.name,
          broker: result.broker,
          type: result.asset_type,
        },
        units: {
          qty: result.units,
          ticker: result.ticker,
        },
        value: { price: result.total_price, feesTaxes: result.fees_taxes_amount },
        observations: result.note,
        actions: result,
      })),
    [state?.page?.results],
  );

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('common.date'),
      minWidth: 100,
      align: 'center',
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="column" alignItems="center" gap={0.5} pt={2} pb={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <span style={{ textAlign: 'center' }}>
              <b>{getDayNumberFromUnixTimestamp(params.value.date)}</b>{' '}
              {/*<br />*/}
              <span>
                {getMonthShortStringFromUnixTimestamp(params.value.date)}
                {' \''}
                {getShortYearFromUnixTimestamp(params.value.date)}
              </span>
            </span>
          </Box>
          <Chip
            label={
              getLocalizedInvestTransactionType.invoke(params.value.type)
            }
            variant="outlined"
            size="small"
            color={(() => {
              switch (params.value.type) {
                case InvestTransactionType.Buy:
                  return 'success';
                case InvestTransactionType.Sell:
                  return 'warning';
                case InvestTransactionType.Income:
                  return 'info';
                case InvestTransactionType.Cost:
                  return 'error';
                default:
                  return 'default';
              }
            })()}
          />
        </Stack>
      ),
    },
    {
      field: 'asset',
      headerName: t('investments.asset'),
      minWidth: 300,
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
      minWidth: 100,
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
      field: 'value',
      headerName: t('common.value'),
      minWidth: 250,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack>
          <Typography variant="body1" color={theme.palette.text.primary}>
            {formatNumberAsCurrency(params.value.price)}
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            {t('investments.feesAndTaxes')}:{' '}
            {formatNumberAsCurrency(params.value.feesTaxes)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'observations',
      headerName: t('investments.observations'),
      minWidth: 200,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
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

  return (
    <Grid container spacing={2}>
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
      {state.isAddEditDialogOpen && (
        <AddEditInvestTransactionDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onSuccess={(asset) =>
            dispatch({ type: StateActionType.DialogSuccess, payload: asset })
          }
          trx={state.actionableTransaction}
        />
      )}
      {state.isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onPositiveClick={() => {
            removeTransactionRequest.mutate(
              state.actionableTransaction?.transaction_id || -1n,
            );
            dispatch({ type: StateActionType.DialogDismissed });
          }}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.DialogDismissed })
          }
          titleText={t('investments.deleteTrxModalTitle', {
            id: state.actionableTransaction?.transaction_id,
          })}
          descriptionText={t('investments.deleteTrxModalSubtitle')}
          alert={t('investments.deleteTrxModalAlert')}
          positiveText={t('common.delete')}
        />
      )}
      <Grid
        container
        spacing={2}
        size={{
          sm: 8,
          xs: 12,
        }}
      >
        <Grid>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => {
              dispatch({ type: StateActionType.AddClick });
            }}
          >
            {t('transactions.addTransactionCTA')}
          </Button>
        </Grid>
      </Grid>
      <Grid
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
        size={{
          sm: 12,
          lg: 4,
        }}
        offset="auto"
      >
        {' '}
        <TextField
          id="search"
          label={t('common.search')}
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            debouncedSearchQuery(event.target.value);
          }}
        />
      </Grid>
      <Grid size={12}>
        <MyFinTable
          isRefetching={getTransactionsRequest.isRefetching}
          rows={rows || []}
          columns={columns}
          itemCount={state.page?.filtered_count ?? 0}
          paginationModel={state.paginationModel}
          setPaginationModel={handlePaginationModelChange}
          onRowClicked={(id) => {
            const trx = state?.page?.results.find(
              (trx) => trx.transaction_id == id,
            );
            if (trx) {
              dispatch({
                type: StateActionType.EditClick,
                payload: trx,
              });
            }
          }}
        />
      </Grid>
    </Grid>
  );
};

export default InvestTransactions;
