import { cssGradients } from '../../../utils/gradientUtils.ts';
import { ColorGradient } from '../../../consts';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Stack from '@mui/material/Stack/Stack';
import { Card } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography/Typography';
import Chip from '@mui/material/Chip/Chip';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';

type Props = {
  isOpen: boolean;
  initialBalance: number;
  calculatedBalances: {
    plannedBalance: number;
    currentBalance: number;
    plannedIncome: number;
    plannedExpenses: number;
    currentIncome: number;
    currentExpenses: number;
  };
};

const TopSummaryLabelValue = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <>
      <Typography color="white" variant="h6">
        {label}
      </Typography>
      <Chip
        label={value}
        variant="filled"
        size="medium"
        sx={{ color: 'white' }}
      />
      {/*<Typography variant="h5">{value}</Typography>*/}
    </>
  );
};

const BudgetSummaryBoard = (props: Props) => {
  const { t } = useTranslation();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

  return (
    <Card
      variant="elevation"
      sx={{
        width: '100%',
        p: 5,
        background: cssGradients[ColorGradient.Blue],
      }}
    >
      <Grid
        container
        spacing={2}
        display="flex"
        justifyContent="space-between"
        textAlign="center"
      >
        <Grid>
          <Stack spacing={4}>
            <Stack>
              <TopSummaryLabelValue
                label={t(
                  props.isOpen
                    ? 'budgetDetails.estimatedExpenses'
                    : 'budgetDetails.actualExpenses',
                )}
                value={formatNumberAsCurrency.invoke(
                  props.isOpen
                    ? props.calculatedBalances.plannedExpenses
                    : props.calculatedBalances.currentExpenses,
                )}
              />
            </Stack>
            <Stack>
              <TopSummaryLabelValue
                label={t('budgetDetails.initialBalance')}
                value={formatNumberAsCurrency.invoke(props.initialBalance)}
              />
            </Stack>
          </Stack>
        </Grid>
        <Grid>
          <Stack spacing={4}>
            <Stack>
              <TopSummaryLabelValue
                label={t(
                  props.isOpen
                    ? 'budgetDetails.estimatedBalance'
                    : 'budgetDetails.actualBalance',
                )}
                value={formatNumberAsCurrency.invoke(
                  props.isOpen
                    ? props.calculatedBalances.plannedBalance
                    : props.calculatedBalances.currentBalance,
                )}
              />
            </Stack>
            <Stack>
              <TopSummaryLabelValue
                label={t('budgetDetails.status')}
                value={t(
                  props.isOpen
                    ? 'budgetDetails.opened'
                    : 'budgetDetails.closed',
                )}
              />
            </Stack>
          </Stack>
        </Grid>
        <Grid>
          <Stack spacing={4}>
            <Stack>
              <TopSummaryLabelValue
                label={t(
                  props.isOpen
                    ? 'budgetDetails.estimatedIncome'
                    : 'budgetDetails.actualIncome',
                )}
                value={formatNumberAsCurrency.invoke(
                  props.isOpen
                    ? props.calculatedBalances.plannedIncome
                    : props.calculatedBalances.currentIncome,
                )}
              />
            </Stack>
            <Stack>
              <TopSummaryLabelValue
                label={t('budgetDetails.finalBalance')}
                value={formatNumberAsCurrency.invoke(
                  props.initialBalance +
                    (props.isOpen
                      ? props.calculatedBalances.plannedBalance
                      : props.calculatedBalances.currentBalance),
                )}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};
export default BudgetSummaryBoard;
