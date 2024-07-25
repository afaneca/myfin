import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Button from '@mui/material/Button/Button';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography/Typography';
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

  const copyFromClipboard = async () => {
    try {
      // Check clipboard permission
      const permissionStatus = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      });

      if (permissionStatus.state === 'granted') {
        const text = await navigator.clipboard.readText();
        //console.log('Clipboard content:', text);
        props.onNext(text);
        //setSnackbarMessage('Copied from clipboard successfully');
      } else if (permissionStatus.state === 'prompt') {
        // Request permission
        try {
          const text = await navigator.clipboard.readText();
          props.onNext(text);
        } catch (error) {
          //setSnackbarMessage('Permission denied');
          snackbar.showSnackbar(
            t('transactions.clipboardPermissionMessage'),
            AlertSeverity.WARNING,
          );
        }
      } else {
        snackbar.showSnackbar(
          t('transactions.clipboardPermissionMessage'),
          AlertSeverity.WARNING,
        );
      }
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
