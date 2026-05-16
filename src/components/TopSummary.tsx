import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useGetTopSummaryValues } from '../services/user/userHooks.ts';
import { useTranslation } from 'react-i18next';
import { useFormatNumberAsCurrency } from '../utils/textHooks.ts';

const TopSummary = () => {
  const { operatingFundsSum, investingSum, debtSum, netWorthSum } =
    useGetTopSummaryValues();
  const { t } = useTranslation();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ display: { xs: 'none', md: 'flex' } }}
    >
      <TopSummaryItem
        label={t('topBar.operatingFunds')}
        value={formatNumberAsCurrency.invoke(operatingFundsSum)}
      />
      <TopSummaryItem
        label={t('topBar.investing')}
        value={formatNumberAsCurrency.invoke(investingSum)}
      />
      <TopSummaryItem
        label={t('topBar.debt')}
        value={formatNumberAsCurrency.invoke(debtSum)}
      />
      <TopSummaryItem
        label={t('topBar.netWorth')}
        value={formatNumberAsCurrency.invoke(netWorthSum)}
      />
    </Stack>
  );
};

type TopSummaryItemProps = {
  label: string;
  value: string;
};

const TopSummaryItem = ({ label, value }: TopSummaryItemProps) => {
  const theme = useTheme();
  return (
    <Box
      borderRadius={1}
      sx={{
        px: 1.5,
        py: 0.75,
        background: theme.palette.background.paper,
      }}
    >
      <Stack direction="column" spacing={0}>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, lineHeight: 1.3 }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
};

export default TopSummary;
