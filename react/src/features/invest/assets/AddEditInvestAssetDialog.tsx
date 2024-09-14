import { DialogContent, MenuItem } from '@mui/material';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { Trans, useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import {
  AssetType,
  InvestAsset,
} from '../../../services/invest/investServices.ts';
import {
  useAddAsset,
  useEditAsset,
} from '../../../services/invest/investHooks.ts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import {
  AccountBalanceWalletOutlined,
  Business,
  ConfirmationNumber,
  Folder,
  Send,
  Undo,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField/TextField';
import Button from '@mui/material/Button/Button';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';

type UiState = {
  isLoading: boolean;
  nameInput: string;
  brokerInput: string;
  tickerInput: string;
  typeInput?: AssetType;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestError,
  NameUpdated,
  BrokerUpdated,
  TickerUpdated,
  TypeUpdated,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestError }
  | { type: StateActionType.NameUpdated; payload: string }
  | { type: StateActionType.BrokerUpdated; payload: string }
  | { type: StateActionType.TickerUpdated; payload: string }
  | { type: StateActionType.TypeUpdated; payload: AssetType };

const createInitialState = (args: {
  asset: InvestAsset | undefined;
}): UiState => {
  return {
    isLoading: false,
    nameInput: args.asset?.name ?? '',
    brokerInput: args.asset?.broker ?? '',
    tickerInput: args.asset?.ticker ?? '',
    typeInput: args.asset?.type,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestSuccess:
    case StateActionType.RequestError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.NameUpdated:
      return {
        ...prevState,
        nameInput: action.payload,
      };
    case StateActionType.BrokerUpdated:
      return {
        ...prevState,
        brokerInput: action.payload,
      };
    case StateActionType.TickerUpdated:
      return {
        ...prevState,
        tickerInput: action.payload,
      };
    case StateActionType.TypeUpdated:
      return {
        ...prevState,
        typeInput: action.payload,
      };
  }
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNegativeClick: () => void;
  asset: InvestAsset | undefined;
};

const AddEditInvestAssetDialog = (props: Props) => {
  const isEditForm = props.asset !== null;

  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const addAssetRequest = useAddAsset();
  const editAssetRequest = useEditAsset();
  const getLocalizedAssetType = useGetLocalizedAssetType();

  const [state, dispatch] = useReducer(
    reduceState,
    {
      asset: props.asset,
    },
    createInitialState,
  );

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
    if (addAssetRequest.isError || editAssetRequest.isError) {
      dispatch({ type: StateActionType.RequestError });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addAssetRequest.isError, editAssetRequest.isError]);

  // Success
  useEffect(() => {
    if (!addAssetRequest.data && !editAssetRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
    });
    props.onSuccess();
  }, [addAssetRequest.data, editAssetRequest.data]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          dispatch({ type: StateActionType.RequestStarted });
          if (isEditForm && props.asset) {
            // Update
            editAssetRequest.mutate({
              name: state.nameInput,
              broker: state.brokerInput,
              ticker: state.tickerInput,
              type: state.typeInput as AssetType,
              asset_id: props.asset!.asset_id,
            });
          } else {
            // Create
            addAssetRequest.mutate({
              name: state.nameInput,
              broker: state.brokerInput,
              ticker: state.tickerInput,
              type: state.typeInput as AssetType,
            });
          }
        },
      }}
    >
      <DialogTitle>
        <Grid xs={12} md={10}>
          <Trans
            i18nKey={
              isEditForm
                ? 'investments.editAssetModalTitle'
                : 'investments.addNewAssetModalTitle'
            }
            values={{
              name: props.asset?.name,
            }}
          />
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid xs={12} md={8}>
            {/* Name */}
            <TextField
              required
              margin="dense"
              id="name"
              name="name"
              value={state.nameInput || ''}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.NameUpdated,
                  payload: e.target.value,
                })
              }
              label={t('investments.name')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWalletOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            {/* Ticker */}
            <TextField
              required
              margin="dense"
              id="ticker"
              name="ticker"
              value={state.tickerInput || ''}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.TickerUpdated,
                  payload: e.target.value,
                })
              }
              label={t('investments.ticker')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ConfirmationNumber />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Type */}
          <Grid xs={12} md={8}>
            <TextField
              select
              required
              margin="dense"
              id="type"
              name="type"
              value={state.typeInput}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.TypeUpdated,
                  payload: e.target.value as AssetType,
                })
              }
              label={t('common.type')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Folder />
                  </InputAdornment>
                ),
              }}
            >
              {Object.values(AssetType).map((type) => (
                <MenuItem key={type} value={type}>
                  {getLocalizedAssetType.invoke(type)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={4}>
            {/* Broker */}
            <TextField
              required
              margin="dense"
              id="broker"
              name="broker"
              value={state.brokerInput || ''}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.BrokerUpdated,
                  payload: e.target.value,
                })
              }
              label={t('investments.broker')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Undo />}
          onClick={props.onNegativeClick}
        >
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditInvestAssetDialog;
