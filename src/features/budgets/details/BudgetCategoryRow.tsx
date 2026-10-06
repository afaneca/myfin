import {
  ExpandMore,
  MoreHoriz,
  ReceiptLongOutlined,
  FormatListBulleted,
} from '@mui/icons-material';
import BudgetBreakdownEditor from '../BudgetBreakdownEditor.tsx';
import type { BudgetBreakdownItem } from '../../../services/budget/budgetServices.ts';
import {
  Card,
  Button,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  alpha,
  useTheme,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { memo, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import { ColorGradient } from '../../../consts';
import {
  BudgetCategory,
  BudgetCategoryTooltipData,
} from '../../../services/budget/budgetServices.ts';
import CategoryIconBadge from '../../../services/category/CategoryIconBadge.tsx';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { cssGradients } from '../../../utils/gradientUtils.ts';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';

type Props = {
  isOpen: boolean;
  breakdownRevision: number;
  month: number;
  year: number;
  isDebit: boolean;
  category: BudgetCategory;
  onCategoryClick: (category: BudgetCategory, isDebit: boolean) => void;
  onInputChange: (categoryId: bigint, isDebit: boolean, input: number) => void;
  onBreakdownChange: (
    categoryId: bigint,
    isDebit: boolean,
    items: BudgetBreakdownItem[],
    total: number,
  ) => void;
  onBreakdownValidityChange: (key: string, valid: boolean) => void;
};

interface TooltipContentProps {
  category: BudgetCategoryTooltipData;
  isDebit: boolean;
  t: (key: string) => string;
  month: number;
  year: number;
}

// Separate Tooltip Content for memoization
export const BudgetCategoryTooltipContent = memo(
  ({ category, isDebit, t, month, year }: TooltipContentProps) => {
    const formatNumberAsCurrency = useFormatNumberAsCurrency();
    return (
      <>
        <Container>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <strong>
              <em>{category.description || '-'}</em>
            </strong>
          </Typography>
          {category.exclude_from_budgets === 1 && (
            <Chip
              size="small"
              label={t('categories.excludedFromBudgets')}
              sx={{ mt: 1, display: 'flex' }}
            />
          )}
        </Container>
        <Divider sx={{ m: 2 }} />
        <Grid container spacing={2} size={12} sx={{ mb: 1 }}>
          <Grid size={6}>
            <Typography variant="caption">
              {getMonthsFullName(month)} {year - 1}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={6}>
            <Chip
              size="small"
              label={formatNumberAsCurrency.invoke(
                isDebit
                  ? category.avg_same_month_previous_year_debit
                  : category.avg_same_month_previous_year_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} size={12} sx={{ mb: 1 }}>
          <Grid size={6}>
            <Typography variant="caption">
              {t('budgetDetails.previousMonth')}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={6}>
            <Chip
              size="small"
              label={formatNumberAsCurrency.invoke(
                isDebit
                  ? category.avg_previous_month_debit
                  : category.avg_previous_month_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} size={12} sx={{ mb: 1 }}>
          <Grid size={6}>
            <Typography variant="caption">
              {t('budgetDetails.12MonthAvg')}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={6}>
            <Chip
              size="small"
              label={formatNumberAsCurrency.invoke(
                isDebit
                  ? category.avg_12_months_debit
                  : category.avg_12_months_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} size={12} sx={{ mb: 1 }}>
          <Grid size={6}>
            <Typography variant="caption">
              {t('budgetDetails.globalAverage')}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'right' }} size={6}>
            <Chip
              size="small"
              label={formatNumberAsCurrency.invoke(
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
    );
  },
);
BudgetCategoryTooltipContent.displayName = 'BudgetCategoryTooltipContent';

const TooltipBottomCard = ({
  category,
  isDebit,
}: {
  category: BudgetCategoryTooltipData;
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

const BudgetCategoryRow = memo(function BudgetCategoryRow({
  isOpen,
  breakdownRevision,
  isDebit,
  month,
  year,
  category,
  onCategoryClick,
  onInputChange,
  onBreakdownChange,
  onBreakdownValidityChange,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const format = useFormatNumberAsCurrency();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownValid, setBreakdownValid] = useState(true);
  const items =
    (isDebit ? category.expense_items : category.income_items) ?? [];
  const total = isDebit
    ? category.planned_amount_debit
    : category.planned_amount_credit;

  const renderCategoryTooltip = useMemo(
    () => (
      <BudgetCategoryTooltipContent
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
      onInputChange(category.category_id, isDebit, floatValue ?? 0);
    },
    [category.category_id, isDebit, onInputChange],
  );

  const handleBreakdownChange = useCallback(
    (next: BudgetBreakdownItem[], amount: number) => {
      onBreakdownChange(category.category_id, isDebit, next, amount);
    },
    [category.category_id, isDebit, onBreakdownChange],
  );
  const handleBreakdownValidityChange = useCallback(
    (valid: boolean) => {
      setBreakdownValid(valid);
      onBreakdownValidityChange(
        `${category.category_id}:${isDebit ? 'expense' : 'income'}`,
        valid,
      );
    },
    [category.category_id, isDebit, onBreakdownValidityChange],
  );

  const actual = isDebit
    ? category.current_amount_debit
    : category.current_amount_credit;
  const percentage = total > 0 ? Math.max(0, (actual / total) * 100) : 0;
  const progressColor = isDebit
    ? percentage >= 100
      ? '#f66c78'
      : percentage >= 80
        ? '#f6bd42'
        : '#34d77b'
    : '#34d77b';
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: breakdownOpen
          ? '#20b9dd'
          : alpha(theme.palette.text.primary, 0.08),
        borderRadius: 2,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(110deg, #14202d, #111b27)'
            : theme.palette.background.paper,
        transition: 'border-color 180ms',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'minmax(0, 1fr) 96px 128px 28px',
            lg: 'minmax(0, 1fr) 88px 112px 24px',
            xl: 'minmax(0, 1fr) 100px 144px 28px',
          },
          position: 'relative',
          gap: { xs: 1.5, sm: 2 },
          alignItems: 'center',
          px: { xs: 1.5, sm: 2 },
          py: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            minWidth: 0,
            gridColumn: { xs: '1 / 3', sm: 1 },
            pr: { xs: 4, sm: 0 },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: alpha(progressColor, 0.1),
              borderRadius: 1.5,
              '& > div': {
                bgcolor: 'transparent',
                width: 38,
                height: 38,
                '& svg': { fontSize: 24 },
              },
            }}
          >
            <CategoryIconBadge
              iconKey={category.icon_key}
              colorGradient={category.color_gradient}
            />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={renderCategoryTooltip}>
              <Button
                onClick={handleCategoryClick}
                color="inherit"
                sx={{
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'left',
                  lineHeight: 1.4,
                }}
              >
                {category.name}
              </Button>
            </Tooltip>
            <Typography
              sx={{
                fontSize: 12,
                mt: 0.5,
                color: breakdownValid ? 'text.secondary' : 'error.main',
              }}
            >
              {items.length
                ? t('budgetBreakdown.items', { count: items.length })
                : t('budgetBreakdown.singleAmount')}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={`${category.name}: ${t('budgetBreakdown.title')}`}
            aria-expanded={breakdownOpen}
            disabled={!isOpen && !items.length}
            onClick={() => setBreakdownOpen((value) => !value)}
            sx={{ color: 'text.secondary', mr: -0.5 }}
          >
            <ExpandMore
              sx={{
                fontSize: 20,
                transform: breakdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 180ms',
              }}
            />
          </IconButton>
        </Stack>
        <Box
          sx={{
            gridRow: { xs: 2, sm: 1 },
            gridColumn: { xs: 1, sm: 2 },
            borderLeft: { sm: '1px solid' },
            borderColor: 'divider',
            pl: { xs: 0, sm: 2 },
          }}
        >
          <Typography sx={{ color: 'text.secondary', fontSize: 11, mb: 0.5 }}>
            {t('budgetDetails.estimated')}
          </Typography>
          <NumericFormat
            customInput={InputBase}
            inputProps={{
              'aria-label': `${category.name}: ${t('budgetDetails.estimated')}`,
            }}
            readOnly={!isOpen || items.length > 0 || breakdownOpen}
            onValueChange={
              items.length || breakdownOpen || !isOpen
                ? undefined
                : handleInputChange
            }
            onClick={() => {
              if (items.length) setBreakdownOpen(true);
            }}
            onKeyDown={(event) => {
              if (
                items.length &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault();
                setBreakdownOpen(true);
              }
            }}
            allowNegative={false}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator
            prefix={format.invoke(0).replace(/[\d.,\s]/g, '')}
            value={total}
            onFocus={(event) => event.target.select()}
            sx={{
              width: '100%',
              fontSize: 14,
              fontWeight: 650,
              fontVariantNumeric: 'tabular-nums',
              '& input': { p: 0 },
              borderRadius: 0.5,
              '&:focus-within': {
                outline: isOpen && !items.length ? '1px solid' : 'none',
                outlineColor: 'primary.main',
              },
            }}
          />
        </Box>
        <Box sx={{ gridRow: { xs: 2, sm: 1 }, gridColumn: { xs: 2, sm: 3 } }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 11, mb: 0.5 }}>
            {t('budgetDetails.current')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {format.invoke(actual)}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 32 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, percentage)}
                aria-label={`${category.name}: ${t('budgetDetails.current')}`}
                sx={{
                  height: 5,
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.text.primary, 0.17),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressColor,
                    borderRadius: 5,
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 10,
                  textAlign: 'right',
                  mt: 0.5,
                  color:
                    percentage >= 80 && isDebit
                      ? progressColor
                      : 'text.secondary',
                }}
              >
                {Math.round(percentage)}%
              </Typography>
            </Box>
          </Stack>
        </Box>
        <IconButton
          size="small"
          aria-label={`${category.name}: ${t('budgetBreakdown.options')}`}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{
            position: { xs: 'absolute', sm: 'static' },
            top: 16,
            right: 12,
            gridRow: 1,
            gridColumn: { xs: 2, sm: 4 },
            alignSelf: 'start',
            color: 'text.secondary',
            mt: -0.5,
          }}
        >
          <MoreHoriz sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            handleCategoryClick();
          }}
        >
          <ListItemIcon>
            <ReceiptLongOutlined fontSize="small" />
          </ListItemIcon>
          {t('budgetDetails.transactionsList')}
        </MenuItem>
        <MenuItem
          disabled={!isOpen && !items.length}
          onClick={() => {
            setMenuAnchor(null);
            setBreakdownOpen(true);
          }}
        >
          <ListItemIcon>
            <FormatListBulleted fontSize="small" />
          </ListItemIcon>
          {t(items.length ? 'budgetBreakdown.title' : 'budgetBreakdown.add')}
        </MenuItem>
      </Menu>
      <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: breakdownOpen ? 1.5 : 0 }}>
        <BudgetBreakdownEditor
          key={breakdownRevision}
          inline
          open={breakdownOpen}
          onOpen={() => setBreakdownOpen(true)}
          onClose={() => setBreakdownOpen(false)}
          title={`${category.name} · ${t(isDebit ? 'common.debit' : 'common.credit')}`}
          items={items}
          total={total}
          readOnly={!isOpen}
          onChange={handleBreakdownChange}
          onValidityChange={handleBreakdownValidityChange}
          onSave={async (next, amount) => handleBreakdownChange(next, amount)}
        />
      </Box>
    </Card>
  );
});

export default BudgetCategoryRow;
