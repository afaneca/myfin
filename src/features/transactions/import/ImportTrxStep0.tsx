import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { Box, useTheme } from '@mui/material';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';

export type Props = {
  onNext: (clipboardText: string) => void;
};

const ImportTrxStep0 = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  /**
   * Will try to use the Clipboard API to ask for clipboard permission (if needed) and read the clipboard.
   * Provides fallback method for browsers that do not fully support this API.
   */
  const copyFromClipboard = async () => {
    try {
      // Check if Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.readText) {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({
              name: 'clipboard-read' as PermissionName,
            });

            if (
              permissionStatus.state === 'granted' ||
              permissionStatus.state === 'prompt'
            ) {
              const text = await navigator.clipboard.readText();
              props.onNext(text);
              return;
            } else {
              snackbar.showSnackbar(
                t('transactions.clipboardPermissionMessage'),
                AlertSeverity.WARNING,
              );
            }
          } catch (permissionError) {
            console.warn(
              'Clipboard permission query not supported',
              permissionError,
            );
            // Proceed to try clipboard reading without explicit permission check
          }
        }

        // If permission API is not available or permission is not granted, try reading anyway
        // This will work in some browsers and fail in others
        try {
          const text = await navigator.clipboard.readText();
          props.onNext(text);
          return;
        } catch (clipboardError) {
          console.warn('Clipboard reading failed', clipboardError);
          // Proceed to fallback method
        }
      }

      // Fallback method for browsers not supporting Clipboard API.
      // In some browsers, the clipboard can only be retrieved by
      // pasting it in a textarea element
      const textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      document.execCommand('paste');
      const text = textArea.value;
      document.body.removeChild(textArea);
      props.onNext(text);
    } catch (error) {
      console.error('Failed to copy:', error);
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        mt: theme.spacing(8),
      }}
    >
      <Typography variant="h5" component="div" sx={{ mb: theme.spacing(2) }}>
        {t('importTransactions.step0Title')}
      </Typography>
      <Typography
        variant="body1"
        component="div"
        sx={{ textAlign: 'center', pl: theme.spacing(4), pr: theme.spacing(4) }}
      >
        {t('importTransactions.step0Text')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        endIcon={<KeyboardDoubleArrowRight />}
        onClick={() => copyFromClipboard()}
        sx={{ width: 'fit-content', mt: theme.spacing(2) }}
      >
        {t('transactions.continueImport')}
      </Button>
    </Box>
  );
};

export default ImportTrxStep0;
