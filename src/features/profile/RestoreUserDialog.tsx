import { useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Dialog from '@mui/material/Dialog';
import Dropzone from 'react-dropzone';
import UploadDropzoneBox from '../../components/UploadDropzoneBox.tsx';
import { useRestoreUserData } from '../../services/user/userHooks.ts';
import { useLogout } from '../../services/auth/authHooks.ts';
import { BusinessLogicError } from '../../data/customApiError.ts';
import { RestoreUserErrorCodes } from '../../services/user/userServices.ts';

type UiState = {
  isLoading: boolean;
};

const enum StateActionType {
  FileUploadSuccess,
  FileUploadError,
  RequestStarted,
  RequestError,
  RequestSuccess,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestError }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.FileUploadError }
  | { type: StateActionType.FileUploadSuccess };

const createInitialState = (): UiState => {
  return {
    isLoading: false,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.RequestSuccess:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.FileUploadError:
      return {
        ...prevState,
        isLoading: false,
      };
    case StateActionType.FileUploadSuccess:
      return {
        ...prevState,
        isLoading: false,
      };
  }
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const RestoreUserDialog = (props: Props) => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const logout = useLogout();
  const restoreUserDataRequest = useRestoreUserData();

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
    if (restoreUserDataRequest.isError) {
      dispatch({ type: StateActionType.RequestError });
      const error = restoreUserDataRequest.error;
      let errorMessage = t('common.somethingWentWrongTryAgain');

      if (error instanceof BusinessLogicError) {
        switch (error.rationale) {
          case RestoreUserErrorCodes.IncompatibleVersions:
            errorMessage = t('dropZone.uploadIncompatibleVersionError');
            break;
        }
      }

      snackbar.showSnackbar(errorMessage, AlertSeverity.ERROR);
    }
  }, [restoreUserDataRequest.isError]);

  // Success
  useEffect(() => {
    if (!restoreUserDataRequest.data) return;
    dispatch({ type: StateActionType.RequestSuccess });
    snackbar.showSnackbar(
      t('common.taskSuccessfullyCompleted'),
      AlertSeverity.SUCCESS,
    );
    logout();
  }, [restoreUserDataRequest.data]);

  const onFilesUploaded = (fileList: File[]) => {
    if (!fileList || fileList.length < 1) {
      snackbar.showSnackbar(t('dropZone.uploadFailure'), AlertSeverity.ERROR);
      return;
    }
    const file = fileList[0];
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () =>
      snackbar.showSnackbar(t('dropZone.uploadFailure'), AlertSeverity.ERROR);
    reader.onload = () => {
      const content = reader.result?.toString() ?? '';
      dispatch({ type: StateActionType.RequestStarted });
      restoreUserDataRequest.mutate(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={props.isOpen}
      onClose={() => props.onClose()}
    >
      <DialogTitle>{t('profile.importDataTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          {t('profile.importDataDescription')}:
        </DialogContentText>
        <Dropzone
          accept={{ 'application/json': ['.json'] }}
          onDrop={(fileList) => onFilesUploaded(fileList)}
          maxFiles={1}
        >
          {({
            getRootProps,
            getInputProps,
            isDragAccept,
            isDragReject,
            isFocused,
          }) => (
            <UploadDropzoneBox
              {...getRootProps()}
              theme={theme}
              isFocused={isFocused}
              isDragAccept={isDragAccept}
              isDragReject={isDragReject}
            >
              <input {...getInputProps()} />
              <p>{t('dropZone.uploadText')}</p>
            </UploadDropzoneBox>
          )}
        </Dropzone>
      </DialogContent>
    </Dialog>
  );
};

export default RestoreUserDialog;
