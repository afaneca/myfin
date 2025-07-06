import {
  Divider,
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
import {
  CalculateOutlined,
  CloudDownloadOutlined,
  Restore,
  RocketLaunchOutlined,
} from '@mui/icons-material';
import {
  useAutoPopulateWithDemoData,
  useRecalculateAllBalances,
} from '../../services/account/accountHooks.ts';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import { useLogout } from '../../services/auth/authHooks.ts';
import { useGetBackupData } from '../../services/user/userHooks.ts';
import { downloadJsonFile } from '../../utils/fileUtils.ts';
import dayjs from 'dayjs';
import RestoreUserDialog from './RestoreUserDialog.tsx';
import { useUserData } from '../../providers/UserProvider.tsx';

type UiState = {
  isLoading: boolean;
  isDemoDataConfirmationDialogOpen: boolean;
  isBackupUserConfirmationDialogOpen: boolean;
  isRestoreUserDialogOpen: boolean;
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestFailure,
  ConfirmationDialogClosed,
  PopulateDemoDataClicked,
  BackupUserClicked,
  RestoreUserClicked,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.ConfirmationDialogClosed }
  | { type: StateActionType.PopulateDemoDataClicked }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestFailure }
  | { type: StateActionType.BackupUserClicked }
  | { type: StateActionType.RestoreUserClicked };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
    isDemoDataConfirmationDialogOpen: false,
    isBackupUserConfirmationDialogOpen: false,
    isRestoreUserDialogOpen: false,
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
        isDemoDataConfirmationDialogOpen: false,
        isBackupUserConfirmationDialogOpen: false,
        isRestoreUserDialogOpen: false,
      };
    case StateActionType.PopulateDemoDataClicked:
      return {
        ...prevState,
        isDemoDataConfirmationDialogOpen: true,
      };
    case StateActionType.BackupUserClicked:
      return {
        ...prevState,
        isBackupUserConfirmationDialogOpen: true,
      };
    case StateActionType.RestoreUserClicked:
      return {
        ...prevState,
        isRestoreUserDialogOpen: true,
      };
  }
};

const generateBackupFileName = (username: string) => {
  return `myfin_${username}_${dayjs().format('YYYY_MM_DD_HH_mm_ss')}.json`;
};

const Utilities = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const recalculateAllBalancesRequest = useRecalculateAllBalances();
  const autoPopulateWithDemoData = useAutoPopulateWithDemoData();
  const backupUserData = useGetBackupData();
  const logout = useLogout();
  const { userSessionData } = useUserData();

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
      logout();
    }
  }, [autoPopulateWithDemoData.data]);

  useEffect(() => {
    if (backupUserData.isSuccess && backupUserData.data) {
      dispatch({ type: StateActionType.RequestSuccess });
      snackbar.showSnackbar(
        t('common.taskSuccessfullyCompleted'),
        AlertSeverity.SUCCESS,
      );
      downloadJsonFile(
        backupUserData.data,
        generateBackupFileName(userSessionData?.username ?? ''),
      );
    }
  }, [backupUserData.isSuccess]);

  return (
    <>
      {state.isRestoreUserDialogOpen && (
        <RestoreUserDialog
          isOpen={state.isRestoreUserDialogOpen}
          onClose={() =>
            dispatch({ type: StateActionType.ConfirmationDialogClosed })
          }
        />
      )}
      {state.isBackupUserConfirmationDialogOpen && (
        <GenericConfirmationDialog
          isOpen={state.isBackupUserConfirmationDialogOpen}
          onClose={() =>
            dispatch({ type: StateActionType.ConfirmationDialogClosed })
          }
          onPositiveClick={() => {
            dispatch({ type: StateActionType.ConfirmationDialogClosed });
            dispatch({ type: StateActionType.RequestStarted });
            backupUserData.mutate();
          }}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.ConfirmationDialogClosed })
          }
          titleText={t('profile.exportDataConfirmationTitle')}
          descriptionText={t('profile.exportDataConfirmationSubtitle')}
          positiveText={t('common.confirm')}
          alert={''}
        />
      )}
      {state.isDemoDataConfirmationDialogOpen && (
        <GenericConfirmationDialog
          isOpen={state.isDemoDataConfirmationDialogOpen}
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
              <CalculateOutlined />
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
              <RocketLaunchOutlined />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.autoPopulateDemoData')}
              secondary={t('profile.autoPopulateDemoDataDescription')}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={(_) => {
              dispatch({ type: StateActionType.BackupUserClicked });
            }}
          >
            <ListItemIcon>
              <CloudDownloadOutlined />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.exportDataTitle')}
              secondary={t('profile.exportDataDescription')}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={(_) => {
              dispatch({ type: StateActionType.RestoreUserClicked });
            }}
          >
            <ListItemIcon>
              <Restore />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.importDataTitle')}
              secondary={t('profile.importDataDescription')}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );
};

export default Utilities;
