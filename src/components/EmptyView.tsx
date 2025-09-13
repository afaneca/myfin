import { Coffee } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const EmptyView = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '-webkit-fill-available',
      }}
    >
      <Coffee style={{ color: theme.palette.text.secondary }} />
      <Typography variant="body1" color={theme.palette.text.secondary}>
        {t('common.tableInfoEmpty')}
      </Typography>
    </Stack>
  );
};

export default EmptyView;
