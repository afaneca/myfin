import { useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import Paper from '@mui/material/Paper/Paper';
import Button from '@mui/material/Button/Button';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Typography from '@mui/material/Typography/Typography';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import { useInitSetup } from '../../services/auth/authHooks.ts';

type UiState = {
  isLoading: boolean;
  password1: string;
  password2: string;
  isNextButtonEnabled: boolean;
};

const enum StateActionType {
  Password1Updated,
  Password2Updated,
  RequestStarted,
  RequestFailure,
  RequestSuccess,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestFailure }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.Password1Updated; payload: string }
  | { type: StateActionType.Password2Updated; payload: string };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    password1: '',
    password2: '',
    isNextButtonEnabled: false,
  };
};

const isInputValid = (password1: string, password2: string) => {
  return password1.length > 0 && password2 == password1;
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.Password1Updated:
      return {
        ...prevState,
        password1: action.payload,
        isNextButtonEnabled: isInputValid(action.payload, prevState.password2),
      };
    case StateActionType.Password2Updated:
      return {
        ...prevState,
        password2: action.payload,
        isNextButtonEnabled: isInputValid(prevState.password1, action.payload),
      };
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
  }
};

type Props = {
  username: string;
  email: string;
  onNext: () => void;
};

const SetupStep2 = (props: Props) => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const initSetupRequest = useInitSetup();

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
    if (initSetupRequest.isError) {
      dispatch({
        type: StateActionType.RequestFailure,
      });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [initSetupRequest.isError]);

  // Success
  useEffect(() => {
    if (!initSetupRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
    });
    setTimeout(() => {
      props.onNext();
    }, 0);
  }, [initSetupRequest.data]);

  const handleButtonClick = () => {
    dispatch({ type: StateActionType.RequestStarted });
    initSetupRequest.mutate({
      username: props.username,
      email: props.email,
      password: state.password1,
    });
  };

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(1), m: theme.spacing(0) }}>
      <Stack spacing={2}>
        <Typography variant="body1" pb={theme.spacing(4)}>
          {t('setup.step1Description')}
        </Typography>
        <TextField
          id="password"
          name="password"
          label="Password"
          margin="normal"
          type="password"
          fullWidth
          value={state.password1}
          onChange={(e) =>
            dispatch({
              type: StateActionType.Password1Updated,
              payload: e.target.value,
            })
          }
          error={state.password1 != state.password2}
        />
        <TextField
          id="password2"
          name="password2"
          label={t('setup.step2PasswordConfirmationLabel')}
          margin="normal"
          type="password"
          fullWidth
          value={state.password2}
          onChange={(e) =>
            dispatch({
              type: StateActionType.Password2Updated,
              payload: e.target.value,
            })
          }
          error={state.password1 != state.password2}
        />
        <Stack direction="row" justifyContent="center" mt={theme.spacing(2)}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!state.isNextButtonEnabled}
            endIcon={<KeyboardDoubleArrowRight />}
            onClick={() => handleButtonClick()}
          >
            {t('common.next')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SetupStep2;
