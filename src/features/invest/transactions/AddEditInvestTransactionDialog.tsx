import { Autocomplete, Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Grid';
import {
  AccountCircle,
  ControlPointDuplicate,
  Description,
  FiberSmartRecord,
  HelpOutline,
  Send,
  Undo,
} from '@mui/icons-material';
import {
  useAddInvestTransaction,
  useEditInvestTransaction,
  useGetAssets,
} from '../../../services/invest/investHooks.ts';
import dayjs, { Dayjs } from 'dayjs';
import { InvestAsset, InvestTransaction, InvestTransactionType } from '../../../services/invest/investServices.ts';
import { IdLabelPair } from '../../transactions/AddEditTransactionDialog.tsx';
import { convertDayJsToUnixTimestamp, convertUnixTimestampToDayJs } from '../../../utils/dateUtils.ts';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import { AlertSeverity, useSnackbar } from '../../../providers/SnackbarProvider.tsx';
import { DatePicker } from '@mui/x-date-pickers';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { NumericFormat } from 'react-number-format';
import CurrencyIcon from '../../../components/CurrencyIcon.tsx';

type UiState = {
  isLoading: boolean;
  dateInput: Dayjs | null;
  typeInput: InvestTransactionType;
  valueInput: number;
  observationsInput: string;
  unitsInput: number;
  assetInput: IdLabelPair | null;
  feesTaxesInput: number;
  deductFeesInUnits: boolean;
  feesUnitsInput: number;
  assets: InvestAsset[];
  isFeesTaxesInputVisible: boolean;
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
  DeductFeesInUnitsToggled,
  FeesUnitsUpdated,
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
  | { type: StateActionType.DeductFeesInUnitsToggled }
  | { type: StateActionType.FeesUnitsUpdated; payload: number }
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
    feesTaxesInput: args.trx?.fees_taxes_amount ?? 0,
    deductFeesInUnits: (args.trx?.fees_taxes_units ?? 0) > 0,
    feesUnitsInput: args.trx?.fees_taxes_units ?? 0,
    assets: [],
    isFeesTaxesInputVisible: true,
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
        // For income transactions, clear units when value is set
        unitsInput: prevState.typeInput === InvestTransactionType.Income && action.payload > 0 ? 0 : prevState.unitsInput,
      };
    case StateActionType.UnitsUpdated:
      return {
        ...prevState,
        unitsInput: action.payload,
        // For income transactions, clear value when units is set
        valueInput: prevState.typeInput === InvestTransactionType.Income && action.payload > 0 ? 0 : prevState.valueInput,
        // Auto-fill fees units with fees amount if deduct option is enabled
        feesUnitsInput: prevState.deductFeesInUnits && prevState.typeInput === InvestTransactionType.Income
          ? prevState.feesTaxesInput
          : prevState.feesUnitsInput,
      };
    case StateActionType.TypeUpdated:
      return {
        ...prevState,
        typeInput: action.payload,
        isFeesTaxesInputVisible: action.payload !== InvestTransactionType.Cost,
        // For cost transactions, clear fees & taxes amount
        feesTaxesInput: action.payload !== InvestTransactionType.Cost ? prevState.feesTaxesInput : 0,
        deductFeesInUnits: false,
        feesUnitsInput: 0,
        // For income transactions, clear units when value is set
        unitsInput: action.payload === InvestTransactionType.Income && prevState.valueInput > 0 ? 0 : prevState.unitsInput,
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
        // Auto-update fees units when deduct is enabled
        feesUnitsInput: prevState.deductFeesInUnits ? action.payload : prevState.feesUnitsInput,
      };
    case StateActionType.ObservationsUpdated:
      return {
        ...prevState,
        observationsInput: action.payload,
      };
    case StateActionType.DeductFeesInUnitsToggled: {
      const newDeductState = !prevState.deductFeesInUnits;
      return {
        ...prevState,
        deductFeesInUnits: newDeductState,
        feesUnitsInput: newDeductState ? prevState.feesTaxesInput : 0,
      };
    }
    case StateActionType.FeesUnitsUpdated:
      return {
        ...prevState,
        feesUnitsInput: action.payload,
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
      dispatch({ type: StateActionType.RequestError });
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

  // helper functions to pick translation keys depending on transaction type & flags
  const getAmountTooltipKey = (type: InvestTransactionType) => {
    switch (type) {
      case InvestTransactionType.Buy:
        return 'investments.tooltips.amount_buy';
      case InvestTransactionType.Sell:
        return 'investments.tooltips.amount_sell';
      case InvestTransactionType.Income:
        return 'investments.tooltips.amount_income';
      case InvestTransactionType.Cost:
        return 'investments.tooltips.amount_cost';
      default:
        return 'investments.tooltips.amount_buy';
    }
  };

  const getUnitsTooltipKey = (type: InvestTransactionType) => {
    switch (type) {
      case InvestTransactionType.Buy:
        return 'investments.tooltips.units_buy';
      case InvestTransactionType.Sell:
        return 'investments.tooltips.units_sell';
      case InvestTransactionType.Income:
        return 'investments.tooltips.units_income';
      case InvestTransactionType.Cost:
        return 'investments.tooltips.units_cost';
      default:
        return 'investments.tooltips.units_buy';
    }
  };

  const getFeesTooltipKey = (type: InvestTransactionType, deductInUnits: boolean) => {
    const mode = deductInUnits ? 'units' : 'cash';
    switch (type) {
      case InvestTransactionType.Buy:
        return `investments.tooltips.fees_buy_cash`;
      case InvestTransactionType.Sell:
        return `investments.tooltips.fees_sell_cash`;
      case InvestTransactionType.Income:
        return `investments.tooltips.fees_income_${mode}`;
      case InvestTransactionType.Cost:
        return `investments.tooltips.fees_cost_cash`;
      default:
        return `investments.tooltips.fees_buy_cash`;
    }
  };

  // compute the keys for the current state
  const amountTooltipKey = getAmountTooltipKey(state.typeInput);
  const unitsTooltipKey = getUnitsTooltipKey(state.typeInput);
  const feesTooltipKey = getFeesTooltipKey(state.typeInput, state.deductFeesInUnits);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      slotProps={{
        paper: {
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
                  fees_amount: state.feesTaxesInput,
                  fees_units: state.feesUnitsInput,
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
                fees_amount: state.feesTaxesInput,
                fees_units: state.feesUnitsInput,
                asset_id: state.assetInput?.id ?? -1n,
                type: state.typeInput,
              });
            }
          },
        },
      }}
    >
      <DialogTitle>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            {t(
              isEditForm
                ? 'transactions.editTransactionModalTitle'
                : 'transactions.addNewTransaction',
              {
                id: props.trx?.transaction_id,
              },
            )}
          </Grid>
          <Grid
            display="flex"
            justifyContent="flex-end"
            size={{
              xs: 12,
              md: 4,
            }}
          >
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
                <TypeLabelWithTooltip
                  labelKey={'investments.buy'}
                  helpKey={'investments.buy_help'}
                />
              </ToggleButton>
              <ToggleButton
                value={InvestTransactionType.Sell}
                aria-label={t('investments.sell')}
              >
                <TypeLabelWithTooltip
                  labelKey={'investments.sell'}
                  helpKey={'investments.sell_help'}
                />
              </ToggleButton>
              <ToggleButton
                value={InvestTransactionType.Income}
                aria-label={t('investments.income')}
              >
                <TypeLabelWithTooltip
                  labelKey={'investments.income'}
                  helpKey={'investments.income_help'}
                />
              </ToggleButton>
              <ToggleButton
                value={InvestTransactionType.Cost}
                aria-label={t('investments.cost')}
              >
                <TypeLabelWithTooltip
                  labelKey={'investments.cost'}
                  helpKey={'investments.cost_help'}
                />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        <Grid size={{ xs: 6 }}>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2} mt={2}>
          {/* Value */}
          <Grid
            size={{
              xs: 12,
              md: 2,
            }}
          >
            <NumericFormat
              value={state.valueInput ?? ''}
              onValueChange={(values) => {
                const { floatValue } = values;
                dispatch({
                  type: StateActionType.ValueUpdated,
                  payload: floatValue ?? 0,
                });
              }}
              customInput={TextField}
              label={t('common.value')}
              fullWidth
              required
              autoFocus
              onFocus={(event) => {
                event.target.select();
              }}
              variant="outlined"
              margin="dense"
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              slotProps={{
                htmlInput: {
                  step: 0.01,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <SmallHelpIcon translationKey={amountTooltipKey} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          {/* Units */}
          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <NumericFormat
              required
              margin="dense"
              id="units"
              name="units"
              value={state.unitsInput ?? ''}
              onValueChange={(values) => {
                const { floatValue } = values;
                dispatch({
                  type: StateActionType.UnitsUpdated,
                  payload: floatValue ?? 0,
                });
              }}
              onFocus={(event) => {
                event.target.select();
              }}
              customInput={TextField}
              label={t('investments.units')}
              fullWidth
              variant="outlined"
              decimalScale={10}
              fixedDecimalScale
              thousandSeparator
              slotProps={{
                htmlInput: {
                  step: 0.01,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiberSmartRecord />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <SmallHelpIcon translationKey={unitsTooltipKey} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          {/* Asset */}
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
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
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    },
                  }}
                  label={t('investments.asset')}
                />
              )}
            />
          </Grid>
          {/* Date */}
          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
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
          <Grid
            size={{
              xs: 12,
              md: state.isFeesTaxesInputVisible ? 9 : 12,
            }}
          >
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          {/* Fees & taxes */}
          {state.isFeesTaxesInputVisible && (
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <NumericFormat
                value={state.feesTaxesInput || '0'}
                onValueChange={(values) => {
                  const { floatValue } = values;
                  dispatch({
                    type: StateActionType.FeesTaxesUpdated,
                    payload: floatValue ?? 0,
                  });
                }}
                customInput={TextField}
                label={t('investments.feesAndTaxes')}
                fullWidth
                required
                onFocus={(event) => {
                  event.target.select();
                }}
                variant="outlined"
                margin="dense"
                decimalScale={2}
                fixedDecimalScale
                thousandSeparator
                slotProps={{
                  htmlInput: {
                    step: 0.01,
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ControlPointDuplicate />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <SmallHelpIcon translationKey={feesTooltipKey} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          )}

          {/* Deduct fees in units - only for INCOME transactions */}
          {state.typeInput === InvestTransactionType.Income &&
            state.unitsInput > 0 &&
            state.feesTaxesInput > 0 && (
              <>
                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                  display="flex"
                  alignItems="center"
                >
                  <FormControlLabel
                    sx={{
                      alignItems: 'center',
                      width: '100%',
                      // ensure the label text itself is right-aligned
                      '& .MuiFormControlLabel-label': { textAlign: 'right' },
                    }}
                    control={
                      <Checkbox
                        checked={state.deductFeesInUnits}
                        onChange={() =>
                          dispatch({ type: StateActionType.DeductFeesInUnitsToggled })
                        }
                      />
                    }
                    label={
                      <TypeLabelWithTooltip
                        labelKey="transactions.deductFeesInUnits"
                        helpKey="transactions.deductFeesInUnitsHelp"
                      />
                    }
                  />
                </Grid>
                {state.deductFeesInUnits && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 5,
                    }}
                  >
                    <NumericFormat
                      value={state.feesUnitsInput || '0'}
                      onValueChange={(values) => {
                        const { floatValue } = values;
                        dispatch({
                          type: StateActionType.FeesUnitsUpdated,
                          payload: floatValue ?? 0,
                        });
                      }}
                      customInput={TextField}
                      label={t('transactions.feesDeductedInUnits')}
                      fullWidth
                      required
                      onFocus={(event) => {
                        event.target.select();
                      }}
                      variant="outlined"
                      margin="dense"
                      decimalScale={10}
                      fixedDecimalScale
                      thousandSeparator
                      slotProps={{
                        htmlInput: {
                          step: 0.01,
                        },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiberSmartRecord />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                )}
              </>
            )}
        </Grid>
      </DialogContent>;
      <DialogActions sx={{ pr: 3 }}>
        <Button variant="outlined" startIcon={<Undo />} onClick={props.onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>;
    </Dialog>
  )
    ;
};


export const TypeLabelWithTooltip = (props: {
  labelKey: string;
  showHelp?: boolean;
  helpKey?: string;
  className?: string;
}) => {
  const { labelKey, showHelp = true, helpKey, className } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} className={className}>
      <span>{t(labelKey)}</span>
      {showHelp && (
        <Tooltip title={helpKey ? t(helpKey) : ''}>
          <HelpOutline style={{ cursor: 'help', color: theme.palette.text.secondary }} fontSize="inherit"
                       aria-label={helpKey ?? ''} />
        </Tooltip>
      )}
    </span>
  );
};

// Add small help icon component for use inside inputs (subtle, small, localized aria-label)
const SmallHelpIcon = (props: { translationKey: string | null }) => {
  const { translationKey } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  if (!translationKey) return null;
  return (
    <Tooltip title={t(translationKey)}>
      <HelpOutline
        aria-label={t(translationKey)}
        role="img"
        sx={{ cursor: 'help', color: theme.palette.text.secondary, fontSize: '18px' }}
        fontSize="small"
      />
    </Tooltip>
  );
};

export default AddEditInvestTransactionDialog;
