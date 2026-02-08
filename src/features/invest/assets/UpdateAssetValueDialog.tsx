import { useLoading } from '../../../providers/LoadingProvider.tsx';
import { AlertSeverity, useSnackbar } from '../../../providers/SnackbarProvider.tsx';
import { Trans, useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Send, Undo } from '@mui/icons-material';
import { useUpdateAssetValue } from '../../../services/invest/investHooks.ts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { NumericFormat } from 'react-number-format';
import CurrencyIcon from '../../../components/CurrencyIcon.tsx';

type UiState = {
  isLoading: boolean;
  assetId: bigint;
  value: number;
  assetName: string;
};

const enum StateActionType {
  RequestStarted,
  RequestFinished,
  AmountUpdated,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestFinished }
  | { type: StateActionType.AmountUpdated; payload: number };

const createInitialState = (args: {
  currentValue: number;
  assetId: bigint;
  assetName: string;
}): UiState => {
  return {
    isLoading: false,
    value: args.currentValue,
    assetId: args.assetId,
    assetName: args.assetName,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestFinished:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.AmountUpdated:
      return {
        ...prevState,
        value: action.payload,
      };
  }
};

type Props = {
  isOpen: boolean;
  onSuccess: () => void;
  onCanceled: () => void;
  assetId: bigint;
  currentValue: number;
  assetName: string;
  month?: number;
  year?: number;
  onViewHistory?: () => void;
};

const UpdateAssetValueDialog = (props: Props) => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(
    reduceState,
    {
      assetName: props.assetName,
      currentValue: props.currentValue,
      assetId: props.assetId,
    },
    createInitialState,
  );

  const updateAssetValueRequest = useUpdateAssetValue();

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading, loader]);

  // Success
  useEffect(() => {
    if (!updateAssetValueRequest.data) return;
    dispatch({ type: StateActionType.RequestFinished });
    snackbar.showSnackbar(
      t('investments.updateValueSuccess'),
      AlertSeverity.SUCCESS,
    );
  }, [updateAssetValueRequest.data]);

  // Error - update state
  useEffect(() => {
    if (!updateAssetValueRequest.isError) return;
    dispatch({ type: StateActionType.RequestFinished });
    snackbar.showSnackbar(
      t('common.somethingWentWrongTryAgain'),
      AlertSeverity.ERROR,
    );
  }, [updateAssetValueRequest.isError]);

  // After loading is dismissed (on success), close the dialog
  useEffect(() => {
    if (!state.isLoading && updateAssetValueRequest.data) {
      props.onSuccess();
    }
  }, [state.isLoading, updateAssetValueRequest.data]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={props.isOpen}
      onClose={props.onCanceled}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            dispatch({ type: StateActionType.RequestStarted });
            updateAssetValueRequest.mutate({
              assetId: state.assetId,
              newValue: state.value,
              month: props.month,
              year: props.year,
            });
          },
        },
      }}
    >
      <DialogTitle>
        <Trans
          i18nKey={
            props.month && props.year
              ? 'investments.updateHistoricalValue'
              : 'investments.currentInvestValue'
          }
          values={{
            name: props.assetName,
            date:
              props.month && props.year
                ? `${props.month}/${props.year}`
                : undefined,
          }}
        />
      </DialogTitle>
      <DialogContent>
        <Grid
          size={{
            xs: 12,
            md: 3,
          }}
        >
          <NumericFormat
            required
            fullWidth
            margin="dense"
            id="amount"
            name="amount"
            customInput={TextField}
            onValueChange={(values) => {
              const { floatValue } = values;
              dispatch({
                type: StateActionType.AmountUpdated,
                payload: Number(floatValue),
              });
            }}
            variant="outlined"
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator
            value={state.value || ''}
            label={t('common.value')}
            onFocus={(event) => {
              event.target.select();
            }}
            inputProps={{
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3, justifyContent: 'space-between' }}>
        {props.onViewHistory && (
          <Button onClick={props.onViewHistory}>
            {t('investments.viewHistory')}
          </Button>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outlined"
            startIcon={<Undo />}
            onClick={props.onCanceled}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="contained" startIcon={<Send />} type="submit">
            {t('common.edit')}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateAssetValueDialog;
