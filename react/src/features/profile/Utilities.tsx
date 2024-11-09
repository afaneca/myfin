import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import { RocketLaunch } from '@mui/icons-material';
import {
  useAutoPopulateWithDemoData,
  useRecalculateAllBalances,
} from '../../services/account/accountHooks.ts';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';

type UiState = {
  isLoading: boolean;
  isConfirmationDialogOpen: boolean;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestFailure,
  ConfirmationDialogClosed,
  PopulateDemoDataClicked,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.ConfirmationDialogClosed }
  | { type: StateActionType.PopulateDemoDataClicked }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestFailure };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    isConfirmationDialogOpen: false,
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
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.RequestFailure:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.ConfirmationDialogClosed:
      return {
        ...prevState,
        isConfirmationDialogOpen: false,
      };
    case StateActionType.PopulateDemoDataClicked:
      return {
        ...prevState,
        isConfirmationDialogOpen: true,
      };
  }
};

const Utilities = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const recalculateAllBalancesRequest = useRecalculateAllBalances();
  const autoPopulateWithDemoData = useAutoPopulateWithDemoData();

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
      recalculateAllBalancesRequest.isError ||
      autoPopulateWithDemoData.isError
    ) {
      dispatch({ type: StateActionType.RequestFailure });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [recalculateAllBalancesRequest.isError, autoPopulateWithDemoData.isError]);

  // Success
  useEffect(() => {
    if (recalculateAllBalancesRequest.isSuccess) {
      dispatch({ type: StateActionType.RequestSuccess });
      snackbar.showSnackbar(
        t('common.taskSuccessfullyCompleted'),
        AlertSeverity.SUCCESS,
      );
    }
  }, [recalculateAllBalancesRequest.data]);

  useEffect(() => {
    if (autoPopulateWithDemoData.isSuccess) {
      dispatch({ type: StateActionType.RequestSuccess });
      snackbar.showSnackbar(
        t('common.taskSuccessfullyCompleted'),
        AlertSeverity.SUCCESS,
      );
    }
  }, [autoPopulateWithDemoData.data]);

  return (
    <>
      {state.isConfirmationDialogOpen && (
        <GenericConfirmationDialog
          isOpen={state.isConfirmationDialogOpen}
          onClose={() =>
            dispatch({ type: StateActionType.ConfirmationDialogClosed })
          }
          onPositiveClick={() => {
            dispatch({ type: StateActionType.ConfirmationDialogClosed });
            dispatch({ type: StateActionType.RequestStarted });
            autoPopulateWithDemoData.mutate();
          }}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.ConfirmationDialogClosed })
          }
          titleText={t('profile.demoDataConfirmationTitle')}
          descriptionText={t('profile.demoDataConfirmationSubtitle')}
          positiveText={t('common.confirm')}
        />
      )}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={(_) => {
              dispatch({ type: StateActionType.RequestStarted });
              recalculateAllBalancesRequest.mutate();
            }}
          >
            <ListItemIcon>
              <RocketLaunch />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.recalculateBalancesOfAllAccounts')}
              secondary={t(
                'profile.recalculateBalancesOfAllAccountsDescription',
              )}
            />
          </ListItemButton>
        </ListItem>
        {/*<Divider />*/}
        <ListItem disablePadding>
          <ListItemButton
            onClick={(_) => {
              dispatch({ type: StateActionType.PopulateDemoDataClicked });
            }}
          >
            <ListItemIcon>
              <RocketLaunch />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.autoPopulateDemoData')}
              secondary={t('profile.autoPopulateDemoDataDescription')}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
};

export default Utilities;
