import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper/Paper';
import Button from '@mui/material/Button/Button';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Typography from '@mui/material/Typography/Typography';
import Stack from '@mui/material/Stack/Stack';

export type Props = {
  onNext: () => void;
};

const SetupStep3 = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(1), m: theme.spacing(0) }}>
      <Stack spacing={2}>
        <Typography variant="body1">{t('setup.step3Description')}</Typography>

        <Stack direction="row" justifyContent="center" mt={theme.spacing(2)}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<KeyboardDoubleArrowRight />}
            onClick={() => props.onNext()}
          >
            {t('login.signIn')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SetupStep3;
