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
      spacing={2}
      sx={{
        display: { xs: 'none', sm: 'none', md: 'flex' }, // Hide on screens smaller than 'md'
      }}
    >
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.operatingFunds')} />
        <TopSummaryAmount
          value={formatNumberAsCurrency.invoke(operatingFundsSum)}
        />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.investing')} />
        <TopSummaryAmount value={formatNumberAsCurrency.invoke(investingSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.debt')} />
        <TopSummaryAmount value={formatNumberAsCurrency.invoke(debtSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.netWorth')} />
        <TopSummaryAmount value={formatNumberAsCurrency.invoke(netWorthSum)} />
      </Stack>
    </Stack>
  );
};

type TopSummaryLabelValueProps = {
  value: string;
};

const TopSummaryLabel = (props: TopSummaryLabelValueProps) => {
  return <Typography variant="caption">{props.value}</Typography>;
};

const TopSummaryAmount = (props: TopSummaryLabelValueProps) => {
  const theme = useTheme();
  return (
    <Box
      bgcolor={theme.palette.background.paper}
      sx={{ borderRadius: 2, display: 'inline-flex', width: 'fit-content' }}
    >
      <Typography p={1} variant="caption">
        {props.value}
      </Typography>
    </Box>
  );
};

export default TopSummary;
