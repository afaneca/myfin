import { Autocomplete } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import { CURRENCIES, Currency } from '../../consts/Currency.ts';
import TextField from '@mui/material/TextField';
import { useChangeCurrency } from '../../services/auth/authHooks.ts';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useUserData } from '../../providers/UserProvider.tsx';

type UiState = {
  isLoading: boolean;
  currency: Currency;
};

const enum StateActionType {
  RequestStarted,
  RequestFailure,
  RequestSuccess,
  CurrencyUpdated,
}

type StateAction =
  | { type: StateActionType.CurrencyUpdated; payload: Currency }
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestFailure }
  | { type: StateActionType.RequestSuccess };

const createInitialState = (arg: { currencyCode: string }): UiState => {
  return {
    isLoading: true,
    currency: CURRENCIES[arg.currencyCode],
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestFailure:
    case StateActionType.RequestSuccess:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.CurrencyUpdated:
      return {
        ...prevState,
        currency: action.payload,
      };
  }
};

const currencyOptions = Object.values(CURRENCIES);

const ChangeCurrencyForm = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const { userSessionData, partiallyUpdateUserSessionData } = useUserData();

  const [state, dispatch] = useReducer(
    reduceState,
    { currencyCode: userSessionData?.currency ?? CURRENCIES.EUR.code },
    createInitialState,
  );

  const changeCurrencyRequest = useChangeCurrency();

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
    if (changeCurrencyRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [changeCurrencyRequest.isError]);

  // Success
  useEffect(() => {
    if (!changeCurrencyRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
    });
    partiallyUpdateUserSessionData({ currency: state.currency.code });
  }, [changeCurrencyRequest.data]);

  const onButtonClick = () => {
    changeCurrencyRequest.mutate(state.currency.code);
    dispatch({ type: StateActionType.RequestStarted });
  };

  return (
    <Grid container spacing={2} size={12}>
      <Grid size={12}>
        <Autocomplete
          id="currency"
          value={state.currency}
          options={currencyOptions}
          onChange={(_event, value) => {
            dispatch({
              type: StateActionType.CurrencyUpdated,
              payload: value as Currency,
            });
          }}
          getOptionLabel={(option: Currency) =>
            `${option.name} (${option.symbol}/${option.code})`
          }
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => (
            <TextField
              sx={{ mb: 4, mt: 2 }}
              {...params}
              fullWidth
              label={t('common.currency')}
              slotProps={{
                input: {
                  ...params.InputProps,
                }
              }}
            />
          )}
        />
      </Grid>
      <Grid offset="auto">
        <Button variant="contained" onClick={onButtonClick} autoFocus>
          {t('profile.changeCurrencyCTA')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ChangeCurrencyForm;
