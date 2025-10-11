import { useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

type UiState = {
  isLoading: boolean;
  username: string;
  email1: string;
  email2: string;
  isNextButtonEnabled: boolean;
};

const enum StateActionType {
  UsernameUpdated,
  Email1Updated,
  Email2Updated,
}

type StateAction =
  | { type: StateActionType.UsernameUpdated; payload: string }
  | { type: StateActionType.Email1Updated; payload: string }
  | { type: StateActionType.Email2Updated; payload: string };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    username: '',
    email1: '',
    email2: '',
    isNextButtonEnabled: false,
  };
};

const isInputValid = (username: string, email1: string, email2: string) => {
  return username.length > 0 && email1.length > 0 && email2 == email1;
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.UsernameUpdated:
      return {
        ...prevState,
        username: action.payload,
        isNextButtonEnabled: isInputValid(
          action.payload,
          prevState.email1,
          prevState.email2,
        ),
      };
    case StateActionType.Email1Updated:
      return {
        ...prevState,
        email1: action.payload,
        isNextButtonEnabled: isInputValid(
          prevState.username,
          action.payload,
          prevState.email2,
        ),
      };
    case StateActionType.Email2Updated:
      return {
        ...prevState,
        email2: action.payload,
        isNextButtonEnabled: isInputValid(
          prevState.username,
          prevState.email1,
          action.payload,
        ),
      };
  }
};

type Props = {
  onNext: (username: string, email: string) => void;
};

const SetupStep1 = (props: Props) => {
  const theme = useTheme();
  const loader = useLoading();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading]);

  /* // Error
  useEffect(() => {
    if (request.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [request.isError]);

  // Success
  useEffect(() => {
    if (!request.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: request.data,
    });
  }, [request.data]);*/

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(1), m: theme.spacing(0) }}>
      <Stack spacing={2}>
        <Typography variant="body1" pb={theme.spacing(4)}>
          {t('setup.step1Description')}
        </Typography>
        <TextField
          id="username"
          name="username"
          label="Username"
          margin="normal"
          fullWidth
          value={state.username}
          onChange={(e) =>
            dispatch({
              type: StateActionType.UsernameUpdated,
              payload: e.target.value,
            })
          }
          helperText={t('setup.step1UsernameHelperText')}
        />
        <TextField
          id="email"
          name="email"
          label="Email"
          margin="normal"
          type="email"
          fullWidth
          value={state.email1}
          onChange={(e) =>
            dispatch({
              type: StateActionType.Email1Updated,
              payload: e.target.value,
            })
          }
          helperText={'abc@hooli.xyz'}
          error={state.email1 != state.email2}
        />
        <TextField
          id="email2"
          name="email2"
          label={t('setup.step1EmailConfirmationLabel')}
          margin="normal"
          type="email"
          fullWidth
          value={state.email2}
          onChange={(e) =>
            dispatch({
              type: StateActionType.Email2Updated,
              payload: e.target.value,
            })
          }
          helperText={'abc@hooli.xyz'}
          error={state.email1 != state.email2}
        />
        <Stack direction="row" justifyContent="center" mt={theme.spacing(2)}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!state.isNextButtonEnabled}
            endIcon={<KeyboardDoubleArrowRight />}
            onClick={() => props.onNext(state.username, state.email1)}
          >
            {t('common.next')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SetupStep1;
