import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTE_TRX } from '../../../providers/RoutesProvider.tsx';

export type Props = {
  nrOfTrxImported: number;
  accountName: string;
};

const ImportTrxStep3 = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToTransactions = () => {
    navigate(ROUTE_TRX);
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
        {t('importTransactions.step3Label')}
      </Typography>
      <Typography variant="body1" component="div">
        {t('importTransactions.step3Text', {
          count: props.nrOfTrxImported,
          accountName: props.accountName,
        })}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        endIcon={<KeyboardDoubleArrowRight />}
        onClick={() => goToTransactions()}
        sx={{ width: 'fit-content', mt: theme.spacing(2) }}
      >
        {t('dashboard.seeTransactions')}
      </Button>
    </Box>
  );
};

export default ImportTrxStep3;
