import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  Card,
  CardActions,
  Chip,
  Divider,
  InputAdornment,
  LinearProgress,
  linearProgressClasses,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import { Euro } from '@mui/icons-material';
import { cssGradients } from '../../../utils/gradientUtils.ts';
import { BudgetCategory } from '../../../services/budget/budgetServices.ts';
import { ColorGradient } from '../../../consts';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import Container from '@mui/material/Container/Container';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

type Props = {
  isOpen: boolean;
  month: number;
  year: number;
  isDebit: boolean;
  category: BudgetCategory;
  onCategoryClick: (category: BudgetCategory, isDebit: boolean) => void;
  onInputChange: (input: number) => void;
};

interface TooltipContentProps {
  category: BudgetCategory;
  isDebit: boolean;
  t: (key: string) => string;
  month: number;
  year: number;
}

// Separate Tooltip Content for memoization
const TooltipContent = memo(
  ({ category, isDebit, t, month, year }: TooltipContentProps) => (
    <>
      <Container>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          <strong>
            <em>{category.description || '-'}</em>
          </strong>
        </Typography>
        {category.exclude_from_budgets === 1 && (
          <Chip
            label={t('categories.excludedFromBudgets')}
            sx={{ mt: 1, display: 'flex' }}
          />
        )}
      </Container>
      <Divider sx={{ m: 2 }} />
      <Grid container xs={12} spacing={2}>
        <Grid xs={6}>
          <Typography variant="caption">
            {getMonthsFullName(month)} {year - 1}
          </Typography>
        </Grid>
        <Grid xs={6} sx={{ textAlign: 'right' }}>
          <Chip
            label={formatNumberAsCurrency(
              isDebit
                ? category.avg_same_month_previous_year_debit
                : category.avg_same_month_previous_year_credit,
            )}
          />
        </Grid>
      </Grid>
      <Grid container xs={12} spacing={2}>
        <Grid xs={6}>
          <Typography variant="caption">
            {t('budgetDetails.previousMonth')}
          </Typography>
        </Grid>
        <Grid xs={6} sx={{ textAlign: 'right' }}>
          <Chip
            label={formatNumberAsCurrency(
              isDebit
                ? category.avg_previous_month_debit
                : category.avg_previous_month_credit,
            )}
          />
        </Grid>
      </Grid>
      <Grid container xs={12} spacing={2}>
        <Grid xs={6}>
          <Typography variant="caption">
            {t('budgetDetails.12MonthAvg')}
          </Typography>
        </Grid>
        <Grid xs={6} sx={{ textAlign: 'right' }}>
          <Chip
            label={formatNumberAsCurrency(
              isDebit
                ? category.avg_12_months_debit
                : category.avg_12_months_credit,
            )}
          />
        </Grid>
      </Grid>
      <Grid container xs={12} spacing={2}>
        <Grid xs={6}>
          <Typography variant="caption">
            {t('budgetDetails.globalAverage')}
          </Typography>
        </Grid>
        <Grid xs={6} sx={{ textAlign: 'right' }}>
          <Chip
            label={formatNumberAsCurrency(
              isDebit
                ? category.avg_lifetime_debit
                : category.avg_lifetime_credit,
            )}
          />
        </Grid>
      </Grid>
      <Card variant="elevation" sx={{ width: '100%', mt: 2 }}>
        <center>
          <TooltipBottomCard category={category} isDebit={isDebit} />
        </center>
      </Card>
    </>
  ),
);
TooltipContent.displayName = 'TooltipContent';

const TooltipBottomCard = ({
  category,
  isDebit,
}: {
  category: BudgetCategory;
  isDebit: boolean;
}) => {
  const { t } = useTranslation();
  let diff = 0;
  let textKey = '';
  if (isDebit) {
    diff =
      Number(category.current_amount_debit + '') -
      Number(category.planned_amount_debit + '');
    switch (true) {
      case diff > 0:
        textKey = 'budgetDetails.catRemainderDebitOver';
        break;
      case diff < 0:
        textKey = 'budgetDetails.catRemainderDebitUnder';
        break;
      default:
        textKey = t('budgetDetails.catRemainderDebitEqual', {
          amount: formatNumberAsCurrency(diff),
        });
        break;
    }
  } else {
    diff =
      Number(category.current_amount_credit + '') -
      Number(category.planned_amount_credit + '');
    switch (true) {
      case diff > 0:
        textKey = 'budgetDetails.catRemainderCreditOver';
        break;
      case diff < 0:
        textKey = 'budgetDetails.catRemainderCreditUnder';
        break;
      default:
        textKey = 'budgetDetails.catRemainderCreditEqual';
        break;
    }
  }

  let background = '';
  switch (true) {
    case isDebit && diff < 0:
    case !isDebit && diff > 0:
      background = cssGradients[ColorGradient.Green];
      break;
    case isDebit && diff > 0:
    case !isDebit && diff < 0:
      background = cssGradients[ColorGradient.Red];
      break;
    default:
      background = cssGradients[ColorGradient.Orange];
      break;
  }

  return (
    <Container sx={{ p: 2, background: background }}>
      <Typography variant="body2">
        <Trans
          i18nKey={textKey}
          values={{
            amount: formatNumberAsCurrency(Math.abs(diff)),
          }}
        />
      </Typography>
    </Container>
  );
};

const DebitBorderLinearProgress = memo(
  styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Red],
    },
  })),
);

const CreditBorderLinearProgress = memo(
  styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Green],
    },
  })),
);

function getCurrentCategoryValuePercentage(
  category: BudgetCategory,
  isDebit: boolean,
) {
  if (isDebit)
    return Math.min(
      Math.ceil(
        (category.current_amount_debit * 100) / category.planned_amount_debit,
      ),
      100,
    );
  return Math.min(
    Math.ceil(
      (category.current_amount_credit * 100) / category.planned_amount_credit,
    ),
    100,
  );
}

const BudgetCategoryRow = memo(function BudgetCategoryRow({
  isOpen,
  isDebit,
  month,
  year,
  category,
  onCategoryClick,
  onInputChange,
}: Props) {
  const { t } = useTranslation();

  const renderCategoryTooltip = useMemo(
    () => (
      <TooltipContent
        category={category}
        isDebit={isDebit}
        month={month}
        year={year}
        t={t}
      />
    ),
    [category, isDebit, month, year],
  );

  const handleCategoryClick = useCallback(() => {
    onCategoryClick(category, isDebit);
  }, [category, isDebit, onCategoryClick]);

  const handleInputChange = useCallback(
    (values: NumberFormatValues) => {
      const { floatValue } = values;
      onInputChange(floatValue ?? 0);
    },
    [onInputChange],
  );

  return (
    <Card variant="elevation" sx={{ width: '100%', pt: 1, pb: 1 }}>
      <Grid container xs={12} spacing={2} p={2}>
        <Grid xs={12} md={4}>
          <Tooltip title={renderCategoryTooltip}>
            <ListItemText
              primary={category.name}
              sx={{ cursor: 'pointer' }}
              onClick={handleCategoryClick}
            />
          </Tooltip>
        </Grid>
        <Grid xs={12} md={4}>
          <NumericFormat
            required
            disabled={!isOpen}
            onValueChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
            margin="none"
            customInput={TextField}
            label={t('budgetDetails.estimated')}
            fullWidth
            variant="outlined"
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator
            value={
              isDebit
                ? category.planned_amount_debit
                : category.planned_amount_credit
            }
            onFocus={(event) => {
              event.target.select();
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <NumericFormat
            required
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
            margin="none"
            customInput={TextField}
            label={t('budgetDetails.current')}
            fullWidth
            variant="outlined"
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator
            defaultValue={
              isDebit
                ? category.current_amount_debit
                : category.current_amount_credit
            }
          />
        </Grid>
      </Grid>
      <CardActions disableSpacing>
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          {isDebit ? (
            <DebitBorderLinearProgress
              variant="determinate"
              value={getCurrentCategoryValuePercentage(category, isDebit)}
            />
          ) : (
            <CreditBorderLinearProgress
              variant="determinate"
              value={getCurrentCategoryValuePercentage(category, isDebit)}
            />
          )}
        </Stack>
      </CardActions>
    </Card>
  );
});

export default BudgetCategoryRow;
