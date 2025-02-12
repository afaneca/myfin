import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useGetTopSummaryValues } from '../services/user/userHooks.ts';
import { formatNumberAsCurrency } from '../utils/textUtils';
import { useTranslation } from 'react-i18next';

const TopSummary = () => {
  const { operatingFundsSum, investingSum, debtSum, netWorthSum } =
    useGetTopSummaryValues();
  const { t } = useTranslation();

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
        <TopSummaryAmount value={formatNumberAsCurrency(operatingFundsSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.investing')} />
        <TopSummaryAmount value={formatNumberAsCurrency(investingSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.debt')} />
        <TopSummaryAmount value={formatNumberAsCurrency(debtSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value={t('topBar.netWorth')} />
        <TopSummaryAmount value={formatNumberAsCurrency(netWorthSum)} />
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
