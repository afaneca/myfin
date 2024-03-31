import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useGetTopSummaryValues } from '../services/user/userHooks.ts';
import { formatStringAsCurrency } from '../utils/textUtils';

const TopSummary = () => {
  const { operatingFundsSum, investingSum, debtSum, netWorthsum } =
    useGetTopSummaryValues();

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        display: { xs: 'none', sm: 'none', md: 'flex' }, // Hide on screens smaller than 'md'
      }}
    >
      <Stack direction="column">
        <TopSummaryLabel value="Operating funds" />
        <TopSummaryAmount value={formatStringAsCurrency(operatingFundsSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value="Investing" />
        <TopSummaryAmount value={formatStringAsCurrency(investingSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value="Debt" />
        <TopSummaryAmount value={formatStringAsCurrency(debtSum)} />
      </Stack>
      <Stack direction="column">
        <TopSummaryLabel value="Net worth" />
        <TopSummaryAmount value={formatStringAsCurrency(netWorthsum)} />
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
