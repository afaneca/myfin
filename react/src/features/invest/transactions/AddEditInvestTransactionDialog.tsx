import {
  Autocomplete,
  Collapse,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  AccountCircle,
  CallMerge,
  CallSplit,
  ControlPointDuplicate,
  Description,
  Euro,
  FiberSmartRecord,
  Send,
  Undo,
} from '@mui/icons-material';
import {
  useAddInvestTransaction,
  useEditInvestTransaction,
  useGetAssets,
} from '../../../services/invest/investHooks.ts';
import dayjs, { Dayjs } from 'dayjs';
import {
  InvestAsset,
  InvestTransaction,
  InvestTransactionType,
} from '../../../services/invest/investServices.ts';
import { IdLabelPair } from '../../transactions/AddEditTransactionDialog.tsx';
import {
  convertDayJsToUnixTimestamp,
  convertUnixTimestampToDayJs,
} from '../../../utils/dateUtils.ts';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { DatePicker } from '@mui/x-date-pickers';
import DialogContent from '@mui/material/DialogContent/DialogContent';
import Button from '@mui/material/Button/Button';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import Chip from '@mui/material/Chip/Chip';
import { TFunction } from 'i18next';

type UiState = {
  isLoading: boolean;
  dateInput: Dayjs | null;
  typeInput: InvestTransactionType;
  valueInput: number;
  observationsInput: string;
  unitsInput: number;
  assetInput: IdLabelPair | null;
  feesTaxesInput: number;
  isSplit: boolean;
  splitValueInput?: number;
  splitObservationsInput?: string;
  splitUnitsInput?: number;
  splitTypeInput?: InvestTransactionType;
  assets: InvestAsset[];
  isSplitBtnVisible: boolean;
  isEdit: boolean;
};

const enum StateActionType {
  RequestError,
  RequestSuccess,
  DateUpdated,
  TypeUpdated,
  ValueUpdated,
  ObservationsUpdated,
  UnitsUpdated,
  AssetUpdated,
  FeesTaxesUpdated,
  SplitBtnClick,
  SplitValueUpdated,
  SplitObservationsUpdated,
  SplitUnitsUpdated,
  SplitTypeUpdated,
  SubmitClick,
  SubmitCompleted,
}

type StateAction =
  | { type: StateActionType.RequestSuccess; payload: InvestAsset[] }
  | { type: StateActionType.RequestError }
  | { type: StateActionType.DateUpdated; payload: Dayjs | null }
  | { type: StateActionType.TypeUpdated; payload: InvestTransactionType }
  | { type: StateActionType.ValueUpdated; payload: number }
  | { type: StateActionType.ObservationsUpdated; payload: string }
  | { type: StateActionType.UnitsUpdated; payload: number }
  | { type: StateActionType.AssetUpdated; payload: IdLabelPair | null }
  | { type: StateActionType.FeesTaxesUpdated; payload: number }
  | { type: StateActionType.SplitBtnClick; payload: TFunction }
  | { type: StateActionType.SplitValueUpdated; payload: number }
  | { type: StateActionType.SplitObservationsUpdated; payload: string }
  | { type: StateActionType.SplitUnitsUpdated; payload: number }
  | { type: StateActionType.SplitTypeUpdated; payload: InvestTransactionType }
  | { type: StateActionType.SubmitClick }
  | { type: StateActionType.SubmitCompleted };

const createInitialState = (args: {
  trx: InvestTransaction | undefined;
}): UiState => {
  return {
    isLoading: true,
    dateInput: convertUnixTimestampToDayJs(args.trx?.date_timestamp),
    typeInput: args.trx?.trx_type ?? InvestTransactionType.Buy,
    valueInput: args.trx?.total_price ?? 0,
    observationsInput: args.trx?.note ?? '',
    unitsInput: args.trx?.units ?? 0,
    assetInput: args.trx
      ? { id: args.trx!.asset_id, label: args.trx!.name }
      : null,
    feesTaxesInput: args.trx?.fees_taxes ?? 0,
    isSplit: false,
    assets: [],
    isSplitBtnVisible: false,
    isEdit: args.trx != null,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestSuccess:
      return {
        ...prevState,
        assets: action.payload,
        isLoading: false,
      };
    case StateActionType.RequestError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.DateUpdated:
      return {
        ...prevState,
        dateInput: action.payload,
      };
    case StateActionType.ValueUpdated:
      return {
        ...prevState,
        valueInput: action.payload,
      };
    case StateActionType.UnitsUpdated:
      return {
        ...prevState,
        unitsInput: action.payload,
      };
    case StateActionType.TypeUpdated:
      return {
        ...prevState,
        typeInput: action.payload,
      };
    case StateActionType.AssetUpdated:
      return {
        ...prevState,
        assetInput: action.payload,
      };
    case StateActionType.FeesTaxesUpdated:
      return {
        ...prevState,
        feesTaxesInput: action.payload,
        isSplitBtnVisible: !prevState.isEdit && action.payload != 0,
      };
    case StateActionType.ObservationsUpdated:
      return {
        ...prevState,
        observationsInput: action.payload,
      };
    case StateActionType.SplitBtnClick:
      return {
        ...prevState,
        isSplit: !prevState.isSplit,
        splitTypeInput: InvestTransactionType.Sell,
        splitValueInput: prevState.feesTaxesInput,
        splitUnitsInput: prevState.feesTaxesInput,
        splitObservationsInput: action.payload(
          'transactions.generated_split_invest_trx_observations',
          {
            units: prevState.unitsInput,
            ticker: prevState.assets?.find(
              (asset) => asset.asset_id == prevState.assetInput?.id ?? -1,
            )?.ticker,
          },
        ),
      };
    case StateActionType.SplitValueUpdated:
      return {
        ...prevState,
        splitValueInput: action.payload,
      };
    case StateActionType.SplitObservationsUpdated:
      return {
        ...prevState,
        splitObservationsInput: action.payload,
      };
    case StateActionType.SplitUnitsUpdated:
      return {
        ...prevState,
        splitUnitsInput: action.payload,
      };
    case StateActionType.SplitTypeUpdated:
      return {
        ...prevState,
        typeInput: action.payload,
      };
    case StateActionType.SubmitClick:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.SubmitCompleted:
      return {
        ...prevState,
        isLoading: false,
      };
  }
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (asset: InvestAsset) => void;
  trx: InvestTransaction | undefined;
};

const AddEditInvestTransactionDialog = (props: Props) => {
  const isEditForm = props.trx !== undefined;
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const addTransactionRequest = useAddInvestTransaction();
  const editTransactionRequest = useEditInvestTransaction();
  const getAssetsRequest = useGetAssets();

  const [state, dispatch] = useReducer(
    reduceState,
    { trx: props.trx },
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
    if (
      getAssetsRequest.isError ||
      addTransactionRequest.isError ||
      editTransactionRequest.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    getAssetsRequest.isError,
    addTransactionRequest.isError,
    editTransactionRequest.isError,
  ]);

  // Success
  useEffect(() => {
    if (!getAssetsRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getAssetsRequest.data,
    });
  }, [getAssetsRequest.data]);

  useEffect(() => {
    if (!addTransactionRequest.data && !editTransactionRequest.data) return;
    dispatch({
      type: StateActionType.SubmitCompleted,
    });

    setTimeout(() => {
      const asset = state.assets.find(
        (asset) => asset.asset_id == state.assetInput?.id,
      );
      if (asset) props.onSuccess(asset);
    }, 0);
  }, [editTransactionRequest.data, addTransactionRequest.data]);

  const onTransactionTypeSelected = (
    _: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (
      newType !== null &&
      Object.values(InvestTransactionType).includes(
        newType as InvestTransactionType,
      )
    ) {
      dispatch({
        type: StateActionType.TypeUpdated,
        payload: newType as InvestTransactionType,
      });
    }
  };

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
          dispatch({ type: StateActionType.SubmitClick });
          // Process the form data as needed
          if (isEditForm) {
            editTransactionRequest.mutate({
              trxId: props.trx?.transaction_id ?? -1n,
              request: {
                date_timestamp: convertDayJsToUnixTimestamp(
                  state.dateInput ?? dayjs(),
                ),
                note: state.observationsInput,
                total_price: state.valueInput,
                units: state.unitsInput,
                fees: state.feesTaxesInput,
                asset_id: state.assetInput?.id ?? -1n,
                type: state.typeInput,
              },
            });
          } else {
            addTransactionRequest.mutate({
              date_timestamp: convertDayJsToUnixTimestamp(
                state.dateInput ?? dayjs(),
              ),
              note: state.observationsInput,
              total_price: state.valueInput,
              units: state.unitsInput,
              fees: state.feesTaxesInput,
              asset_id: state.assetInput?.id ?? -1n,
              type: state.typeInput,
              is_split: state.isSplit,
              split_total_price: state.splitValueInput,
              split_units: state.splitUnitsInput,
              split_note: state.splitObservationsInput,
              split_type: state.splitTypeInput,
            });
          }
        },
      }}
    >
      <DialogTitle>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid xs={12} md={8}>
            {t(
              isEditForm
                ? 'transactions.editTransactionModalTitle'
                : 'transactions.addNewTransaction',
              {
                id: props.trx?.transaction_id,
              },
            )}
          </Grid>
          <Grid xs={12} md={4} display="flex" justifyContent="flex-end">
            {/* Type */}
            <ToggleButtonGroup
              value={state.typeInput}
              exclusive
              onChange={onTransactionTypeSelected}
              aria-label={t('transactions.typeOfTrx')}
            >
              <ToggleButton
                value={InvestTransactionType.Buy}
                aria-label={t('investments.buy')}
              >
                {t('investments.buy')}
              </ToggleButton>
              <ToggleButton
                value={InvestTransactionType.Sell}
                aria-label={t('investments.sell')}
              >
                {t('investments.sell')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2}>
          {/* Value */}
          <Grid xs={12} md={2}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="value"
              name="value"
              value={state.valueInput ?? ''}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.ValueUpdated,
                  payload: Number(e.target.value),
                })
              }
              label={t('common.value')}
              type="number"
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Euro />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Units */}
          <Grid xs={12} md={3}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="units"
              name="units"
              value={state.unitsInput || ''}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.UnitsUpdated,
                  payload: Number(e.target.value),
                })
              }
              label={t('investments.units')}
              type="number"
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiberSmartRecord />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Asset */}
          <Grid xs={12} md={4}>
            <Autocomplete
              id="asset"
              options={state.assets?.map((a) => ({
                id: a.asset_id,
                label: a.name,
              }))}
              value={state.assetInput}
              onChange={(_event, value) => {
                dispatch({
                  type: StateActionType.AssetUpdated,
                  payload: value,
                });
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  margin="dense"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                  label={t('investments.asset')}
                />
              )}
            />
          </Grid>
          {/* Date */}
          <Grid xs={12} md={3}>
            <DatePicker
              name="date"
              label={t('transactions.dateOfTransaction')}
              value={state.dateInput}
              onChange={(newValue) =>
                dispatch({
                  type: StateActionType.DateUpdated,
                  payload: newValue || dayjs(),
                })
              }
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  variant: 'outlined',
                  required: true,
                  fullWidth: true,
                  margin: 'dense',
                },
                inputAdornment: {
                  position: 'start',
                },
              }}
            />
          </Grid>

          {/* Description */}
          <Grid xs={12} md={9}>
            <TextField
              margin="dense"
              id="description"
              name="description"
              value={state.observationsInput}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.ObservationsUpdated,
                  payload: e.target.value,
                })
              }
              label={t('common.description')}
              type="text"
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Fees & taxes */}
          <Grid xs={12} md={3}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="feesTaxes"
              name="feesTaxes"
              value={state.feesTaxesInput || '0'}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.FeesTaxesUpdated,
                  payload: Number(e.target.value),
                })
              }
              label={t('investments.feesAndTaxes')}
              type="number"
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ControlPointDuplicate />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} marginTop={4}>
            <Collapse in={state.isSplit}>
              <SplitTransactionForm
                isOpen={state.isSplit}
                state={{
                  value: state.splitValueInput,
                  units: state.splitUnitsInput,
                  type: state.splitTypeInput,
                  observations: state.splitObservationsInput,
                }}
                handleValueChange={(input) =>
                  dispatch({
                    type: StateActionType.SplitValueUpdated,
                    payload: input,
                  })
                }
                handleUnitsChange={(input) =>
                  dispatch({
                    type: StateActionType.SplitUnitsUpdated,
                    payload: input,
                  })
                }
                handleTypeChange={(input) =>
                  dispatch({
                    type: StateActionType.SplitTypeUpdated,
                    payload: input,
                  })
                }
                handleObservationsChange={(input) =>
                  dispatch({
                    type: StateActionType.SplitObservationsUpdated,
                    payload: input,
                  })
                }
              />
            </Collapse>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        {state.isSplitBtnVisible && (
          <Button
            variant="text"
            onClick={() =>
              dispatch({ type: StateActionType.SplitBtnClick, payload: t })
            }
            startIcon={state.isSplit ? <CallMerge /> : <CallSplit />}
          >
            {state.isSplit
              ? t('transactions.mergeTransactions')
              : t('transactions.deductFeesFromTransaction')}
          </Button>
        )}

        <Button variant="outlined" startIcon={<Undo />} onClick={props.onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type SplitTransactionFormState = {
  value?: number;
  units?: number;
  type?: InvestTransactionType;
  observations?: string;
};

type SplitTransactionFormProps = {
  isOpen: boolean;
  state?: SplitTransactionFormState;
  handleValueChange: (input: number) => void;
  handleUnitsChange: (input: number) => void;
  handleTypeChange: (input: InvestTransactionType) => void;
  handleObservationsChange: (input: string) => void;
};

const SplitTransactionForm = (props: SplitTransactionFormProps) => {
  const { t } = useTranslation();

  const onTransactionTypeSelected = (
    _: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (
      newType !== null &&
      Object.values(InvestTransactionType).includes(
        newType as InvestTransactionType,
      )
    ) {
      props.handleTypeChange(newType as InvestTransactionType);
    }
  };

  return (
    <>
      <Divider sx={{ mb: 5 }}>
        <Chip label={t('transactions.splitTransaction')} size="small" />
      </Divider>
      <Grid container spacing={2} rowSpacing={2} xs={12} columns={{ xs: 12 }}>
        {/* Value */}
        <Grid xs={12} md={2}>
          <TextField
            autoFocus
            required={props.isOpen}
            margin="dense"
            id="split-value"
            name="split-value"
            value={props?.state?.value ?? ''}
            onChange={(e) => props.handleValueChange(Number(e.target.value))}
            label={t('common.value')}
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {/* Units */}
        <Grid xs={12} md={3}>
          <TextField
            autoFocus
            required={props.isOpen}
            margin="dense"
            id="split-units"
            name="split-units"
            value={props.state?.units || ''}
            onChange={(e) => props.handleUnitsChange(Number(e.target.value))}
            label={t('investments.units')}
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiberSmartRecord />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} md={7} display="flex" justifyContent="flex-end">
          {/* Type */}
          <ToggleButtonGroup
            value={props.state?.type}
            exclusive
            onChange={onTransactionTypeSelected}
            aria-label={t('transactions.typeOfTrx')}
          >
            <ToggleButton
              value={InvestTransactionType.Buy}
              aria-label={t('investments.buy')}
            >
              {t('investments.buy')}
            </ToggleButton>
            <ToggleButton
              value={InvestTransactionType.Sell}
              aria-label={t('investments.sell')}
            >
              {t('investments.sell')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        {/* Description */}
        <Grid xs={12} md={9}>
          <TextField
            margin="dense"
            id="split-description"
            name="split-description"
            value={props.state?.observations}
            onChange={(e) => props.handleObservationsChange(e.target.value)}
            label={t('common.description')}
            type="text"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AddEditInvestTransactionDialog;
