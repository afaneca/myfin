import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import { useChangePassword, useLogout } from '../../services/auth/authHooks.ts';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

type UiState = {
  isLoading: boolean;
  currentPassword: string;
  newPassword1: string;
  newPassword2: string;
  isCtaButtonEnabled: boolean;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestFailure,
  CurrentPasswordUpdated,
  NewPassword1Updated,
  NewPassword2Updated,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestFailure }
  | { type: StateActionType.CurrentPasswordUpdated; payload: string }
  | { type: StateActionType.NewPassword1Updated; payload: string }
  | { type: StateActionType.NewPassword2Updated; payload: string };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    isCtaButtonEnabled: false,
    currentPassword: '',
    newPassword1: '',
    newPassword2: '',
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
    case StateActionType.RequestFailure:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.CurrentPasswordUpdated:
      return {
        ...prevState,
        currentPassword: action.payload,
        isCtaButtonEnabled:
          action.payload != '' &&
          prevState.newPassword1 != '' &&
          prevState.newPassword2 != '',
      };
    case StateActionType.NewPassword1Updated:
      return {
        ...prevState,
        newPassword1: action.payload,
        isCtaButtonEnabled:
          action.payload != '' &&
          prevState.currentPassword != '' &&
          prevState.newPassword2 != '',
      };
    case StateActionType.NewPassword2Updated:
      return {
        ...prevState,
        newPassword2: action.payload,
        isCtaButtonEnabled:
          action.payload != '' &&
          prevState.newPassword1 != '' &&
          prevState.currentPassword != '',
      };
  }
};

const ChangePasswordForm = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const logout = useLogout();
  const changePasswordRequest = useChangePassword();

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
    if (changePasswordRequest.isError) {
      dispatch({ type: StateActionType.RequestFailure });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [changePasswordRequest.isError]);

  // Success
  useEffect(() => {
    if (!changePasswordRequest.isSuccess) return;
    dispatch({ type: StateActionType.RequestSuccess });
    snackbar.showSnackbar(
      t('profile.changePasswordSuccessMessage'),
      AlertSeverity.SUCCESS,
    );
    logout();
  }, [changePasswordRequest.isSuccess]);

  const onButtonClick = () => {
    if (state.newPassword1 != state.newPassword2) {
      snackbar.showSnackbar(
        t('profile.passwordsDoNotMatchMessage'),
        AlertSeverity.ERROR,
      );
      return;
    }
    changePasswordRequest.mutate({
      currentPassword: state.currentPassword,
      newPassword1: state.newPassword1,
      newPassword2: state.newPassword2,
    });
    dispatch({ type: StateActionType.RequestStarted });
  };

  return (
    <Grid container spacing={2} size={12}>
      <Grid size={12}>
        <TextField
          type="password"
          variant="outlined"
          fullWidth
          required
          label={t('profile.currentPassword')}
          value={state.currentPassword}
          onChange={(e) =>
            dispatch({
              type: StateActionType.CurrentPasswordUpdated,
              payload: e.target.value,
            })
          }
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <TextField
          type="password"
          variant="outlined"
          fullWidth
          required
          label={t('profile.newPassword')}
          value={state.newPassword1}
          onChange={(e) =>
            dispatch({
              type: StateActionType.NewPassword1Updated,
              payload: e.target.value,
            })
          }
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <TextField
          type="password"
          variant="outlined"
          fullWidth
          required
          label={t('profile.newPasswordConfirmation')}
          value={state.newPassword2}
          onChange={(e) =>
            dispatch({
              type: StateActionType.NewPassword2Updated,
              payload: e.target.value,
            })
          }
        />
      </Grid>
      <Grid offset="auto">
        <Button
          variant="contained"
          onClick={onButtonClick}
          autoFocus
          disabled={!state.isCtaButtonEnabled}
        >
          {t('profile.changePasswordCTA')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ChangePasswordForm;
