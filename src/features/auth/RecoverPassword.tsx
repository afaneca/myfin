import { Divider, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import PageHeader from '../../components/PageHeader.tsx';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import {
  useSendRecoveryOtp,
  useSetRecoveryNewPassword,
} from '../../services/auth/authHooks.ts';
import { useNavigate } from 'react-router-dom';
import { ROUTE_AUTH } from '../../providers/RoutesProvider.tsx';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

type UiState = {
  isLoading: boolean;
  username: string;
  isUsernameEnabled: boolean;
  isNewPasswordEnabled: boolean;
  otpCode: string;
  newPassword1: string;
  newPassword2: string;
  isSendOtpButtonEnabled: boolean;
  isCtaButtonEnabled: boolean;
};

const enum StateActionType {
  RequestStarted,
  SetPasswordRequestSuccess,
  SendOtpRequestSuccess,
  RequestFailure,
  UsernameUpdated,
  OtpUpdated,
  Password1Updated,
  Password2Updated,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.SetPasswordRequestSuccess }
  | { type: StateActionType.SendOtpRequestSuccess }
  | { type: StateActionType.RequestFailure }
  | { type: StateActionType.UsernameUpdated; payload: string }
  | { type: StateActionType.OtpUpdated; payload: string }
  | { type: StateActionType.Password1Updated; payload: string }
  | { type: StateActionType.Password2Updated; payload: string };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    username: '',
    isUsernameEnabled: true,
    isNewPasswordEnabled: false,
    otpCode: '',
    newPassword1: '',
    newPassword2: '',
    isSendOtpButtonEnabled: false,
    isCtaButtonEnabled: false,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.SendOtpRequestSuccess:
      return {
        ...prevState,
        isLoading: false,
        isUsernameEnabled: false,
        isNewPasswordEnabled: true,
        isSendOtpButtonEnabled: false,
      };
    case StateActionType.SetPasswordRequestSuccess:
    case StateActionType.RequestFailure:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.UsernameUpdated:
      return {
        ...prevState,
        username: action.payload,
        isSendOtpButtonEnabled: action.payload.length > 0,
      };
    case StateActionType.OtpUpdated:
      return {
        ...prevState,
        otpCode: action.payload,
        isCtaButtonEnabled:
          action.payload.length > 0 &&
          prevState.newPassword1.length > 0 &&
          prevState.newPassword2.length > 0,
      };
    case StateActionType.Password1Updated:
      return {
        ...prevState,
        newPassword1: action.payload,
        isCtaButtonEnabled:
          action.payload.length > 0 &&
          prevState.newPassword2.length > 0 &&
          prevState.otpCode.length > 0,
      };
    case StateActionType.Password2Updated:
      return {
        ...prevState,
        newPassword2: action.payload,
        isCtaButtonEnabled:
          action.payload.length > 0 &&
          prevState.newPassword1.length > 0 &&
          prevState.otpCode.length > 0,
      };
  }
};

const RecoverPassword = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sendOtpRequest = useSendRecoveryOtp();
  const setNewPasswordRequest = useSetRecoveryNewPassword();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

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
    if (setNewPasswordRequest.isError || sendOtpRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
      dispatch({
        type: StateActionType.RequestFailure,
      });
    }
  }, [setNewPasswordRequest.isError, sendOtpRequest.isError]);

  // Success
  useEffect(() => {
    if (!sendOtpRequest.isSuccess) return;
    dispatch({
      type: StateActionType.SendOtpRequestSuccess,
    });
    snackbar.showSnackbar(t('login.checkYourEmailForOtp'), AlertSeverity.INFO);
  }, [sendOtpRequest.isSuccess]);

  useEffect(() => {
    if (!setNewPasswordRequest.isSuccess) return;
    dispatch({
      type: StateActionType.SetPasswordRequestSuccess,
    });
    snackbar.showSnackbar(
      t('profile.changePasswordSuccessMessage'),
      AlertSeverity.SUCCESS,
    );
    navigate(ROUTE_AUTH);
  }, [setNewPasswordRequest.isSuccess]);

  const onSendOtpButtonClick = () => {
    sendOtpRequest.mutate(state.username);
    dispatch({ type: StateActionType.RequestStarted });
  };

  const onButtonClick = () => {
    if (state.newPassword1 != state.newPassword2) {
      snackbar.showSnackbar(
        t('profile.passwordsDoNotMatchMessage'),
        AlertSeverity.ERROR,
      );
      return;
    }
    setNewPasswordRequest.mutate({
      username: state.username,
      otp: state.otpCode,
      new_password1: state.newPassword1,
      new_password2: state.newPassword2,
    });
    dispatch({ type: StateActionType.RequestStarted });
  };

  return (
    <Container maxWidth="lg">
      <Container maxWidth="xs">
        <Box
          p={3}
          mt={10}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <img
            src={
              theme.palette.mode === 'dark'
                ? '/res/logo_light_transparentbg.png'
                : '/res/logo_dark_transparentbg.png'
            }
            width="60%"
            style={{ marginBottom: 20 }}
          />
        </Box>
      </Container>
      <Paper
        elevation={0}
        sx={{ p: theme.spacing(2), m: theme.spacing(2), mt: 0 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
        >
          <PageHeader
            title={t('login.accountRecovery')}
            subtitle={t('login.accountRecoveryStrapline')}
          />
        </Box>
        <Grid container spacing={2} size={12}>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <TextField
              type="username"
              variant="outlined"
              fullWidth
              required
              disabled={!state.isUsernameEnabled}
              label={t('login.username')}
              value={state.username}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.UsernameUpdated,
                  payload: e.target.value,
                })
              }
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="large"
              disabled={!state.isSendOtpButtonEnabled}
              fullWidth
              sx={{ height: 1 }}
              onClick={() => {
                onSendOtpButtonClick();
              }}
            >
              {t('login.sendOtp')}
            </Button>
          </Grid>
          <Slide direction="up" in={state.isNewPasswordEnabled}>
            <Grid pl={0} pr={0} size={12}>
              <Divider variant="middle" sx={{ mb: 2, mt: 2 }}>
                <Chip label={t('login.setNewPassword')} />
              </Divider>
              <Grid size={12}>
                <TextField
                  type="text"
                  variant="outlined"
                  fullWidth
                  required
                  label={t('login.otpCode')}
                  value={state.otpCode}
                  onChange={(e) =>
                    dispatch({
                      type: StateActionType.OtpUpdated,
                      payload: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid container>
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
                        type: StateActionType.Password1Updated,
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
                        type: StateActionType.Password2Updated,
                        payload: e.target.value,
                      })
                    }
                  />
                </Grid>
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
          </Slide>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RecoverPassword;
