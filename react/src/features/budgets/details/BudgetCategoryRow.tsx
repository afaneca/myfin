import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Card,
  Divider,
  linearProgressClasses,
  ListItemText,
  Tooltip,
} from '@mui/material';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import { Euro } from '@mui/icons-material';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack/Stack';
import React, { memo, useCallback } from 'react';
import { BudgetCategory } from '../../../services/budget/budgetServices.ts';
import Container from '@mui/material/Container/Container';
import Typography from '@mui/material/Typography/Typography';
import Chip from '@mui/material/Chip/Chip';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import { Trans, useTranslation } from 'react-i18next';
import { cssGradients } from '../../../utils/gradientUtils.ts';
import { ColorGradient } from '../../../consts';
import styled from '@mui/material/styles/styled';
import LinearProgress from '@mui/material/LinearProgress/LinearProgress';
import { debounce } from 'lodash';

type Props = {
  isOpen: boolean;
  month: number;
  year: number;
  isDebit: boolean;
  category: BudgetCategory;
  onCategoryClick: (category: BudgetCategory, isDebit: boolean) => void;
  onInputChange: (input: number) => void;
};

function BudgetCategoryRow({
  isOpen,
  isDebit,
  month,
  year,
  category,
  onCategoryClick,
  onInputChange,
}: Props) {
  const { t } = useTranslation();

  const debouncedOnInputChange = useCallback(
    debounce((value: number) => {
      onInputChange(value);
    }, 300),
    [onInputChange],
  );

  const renderCategoryTooltip = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
    return (
      <React.Fragment>
        <Container>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <strong>
              <em>{category.description || '-'}</em>
            </strong>
          </Typography>
          {category.exclude_from_budgets == true && (
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
          <center>{buildTooltipBottomCard(category, isDebit)}</center>
        </Card>
      </React.Fragment>
    );
  };

  const buildTooltipBottomCard = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
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

  const DebitBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
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
  }));

  const CreditBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
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
  }));

  function getCurrentCategoryValuePercentage(
    category: BudgetCategory,
    isDebit: boolean,
  ): number {
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

  return (
    <Card variant="elevation" sx={{ width: '100%', pt: 1, pb: 1 }}>
      <Grid container xs={12} spacing={2} p={2}>
        <Grid xs={12} md={4}>
          <Tooltip title={renderCategoryTooltip(category, isDebit)}>
            <ListItemText
              primary={category.name}
              sx={{ cursor: 'pointer' }}
              onClick={() => onCategoryClick(category, isDebit)}
            />
          </Tooltip>
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            required
            disabled={!isOpen}
            id={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
            name={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              debouncedOnInputChange(value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
            margin="none"
            type="number"
            label={t('budgetDetails.estimated')}
            fullWidth
            variant="outlined"
            inputProps={{
              step: 0.01,
            }}
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
          <TextField
            required
            disabled
            id={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
            name={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Euro />
                </InputAdornment>
              ),
            }}
            margin="none"
            type="number"
            label={t('budgetDetails.current')}
            fullWidth
            variant="outlined"
            inputProps={{
              step: 0.01,
            }}
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
}

export default memo(BudgetCategoryRow);
