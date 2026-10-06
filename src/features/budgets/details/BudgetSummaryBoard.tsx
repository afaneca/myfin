import {
  ArrowDownward,
  ArrowUpward,
  BalanceOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DescriptionOutlined,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';

type Props = {
  isOpen: boolean;
  initialBalance: number;
  monthLabel: string;
  description: ReactNode;
  calculatedBalances: {
    plannedBalance: number;
    currentBalance: number;
    plannedIncome: number;
    plannedExpenses: number;
    currentIncome: number;
    currentExpenses: number;
  };
};

export default function BudgetSummaryBoard({
  isOpen,
  initialBalance,
  monthLabel,
  description,
  calculatedBalances: balances,
}: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const format = useFormatNumberAsCurrency();
  const balance = isOpen ? balances.plannedBalance : balances.currentBalance;
  const income = isOpen ? balances.plannedIncome : balances.currentIncome;
  const expenses = isOpen ? balances.plannedExpenses : balances.currentExpenses;
  const balanceCents = Math.round(balance * 100);
  const incomeCents = Math.round(income * 100);
  const expensesCents = Math.round(expenses * 100);
  const combinedCents = incomeCents + expensesCents;
  const finalBalance = (Math.round(initialBalance * 100) + balanceCents) / 100;
  const savingsRate = incomeCents > 0 ? balanceCents / incomeCents : null;
  const formattedSavingsRate =
    savingsRate === null
      ? '—'
      : new Intl.NumberFormat(i18n.resolvedLanguage, {
          style: 'percent',
          maximumFractionDigits: 1,
        }).format(savingsRate);
  const balanceColor =
    balance < 0
      ? theme.palette.error.main
      : balance > 0
        ? theme.palette.success.main
        : theme.palette.text.secondary;
  const card = {
    p: { xs: 2, xl: 2.5 },
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    bgcolor: theme.palette.mode === 'dark' ? '#111d2a' : 'background.paper',
    minWidth: 0,
  };
  const heading = { fontSize: 13, fontWeight: 600 };
  const iconTile = {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 1,
  };
  const comparison = [
    {
      label: t(
        isOpen
          ? 'budgetDetails.estimatedExpenses'
          : 'budgetDetails.actualExpenses',
      ),
      amount: expenses,
      color:
        theme.palette.mode === 'dark' ? '#ff5483' : theme.palette.error.main,
      Icon: CreditCardOutlined,
    },
    {
      label: t(
        isOpen ? 'budgetDetails.estimatedIncome' : 'budgetDetails.actualIncome',
      ),
      amount: income,
      color:
        theme.palette.mode === 'dark' ? '#10cea1' : theme.palette.success.main,
      Icon: TrendingUp,
    },
  ];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: '1.15fr 1.25fr 0.95fr',
          xl: '1.15fr 1.25fr 0.95fr 1.5fr',
        },
        gap: 1.5,
      }}
    >
      <Box sx={card}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                ...iconTile,
                color: balanceColor,
                bgcolor: alpha(balanceColor, 0.14),
              }}
            >
              <TrendingUp sx={{ fontSize: 21 }} />
            </Box>
            <Typography sx={heading}>
              {t('budgetDetails.budgetBalance')}
            </Typography>
          </Stack>
          <Tooltip
            title={t(
              savingsRate === null
                ? 'budgetDetails.savingsRateUnavailableHelp'
                : isOpen
                  ? 'budgetDetails.savingsRatePlannedHelp'
                  : 'budgetDetails.savingsRateActualHelp',
            )}
          >
            <Chip
              size="small"
              icon={
                savingsRate === null ? undefined : balance < 0 ? (
                  <ArrowDownward />
                ) : balance > 0 ? (
                  <ArrowUpward />
                ) : (
                  <BalanceOutlined />
                )
              }
              label={t('budgetDetails.savingsRateIndicator', {
                rate: formattedSavingsRate,
              })}
              sx={{
                color: savingsRate === null ? 'text.secondary' : balanceColor,
                bgcolor: alpha(
                  savingsRate === null
                    ? theme.palette.text.secondary
                    : balanceColor,
                  0.08,
                ),
                borderRadius: 1,
                fontSize: 11,
                '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
              }}
            />
          </Tooltip>
        </Stack>
        <Typography
          sx={{
            mt: 2.5,
            fontSize: { xs: 32, xl: 40 },
            fontWeight: 700,
            color: balanceColor,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            overflowWrap: 'anywhere',
          }}
        >
          {format.invoke(balance)}
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 12, color: 'text.secondary' }}>
          {t('budgetDetails.netResult', { month: monthLabel })}
        </Typography>
      </Box>
      <Box sx={{ ...card, p: 2 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Box
            sx={{
              ...iconTile,
              bgcolor: alpha(theme.palette.info.main, 0.14),
              color: 'info.main',
            }}
          >
            <BarChartOutlined sx={{ fontSize: 21 }} />
          </Box>
          <Typography sx={{ ...heading, fontSize: 12 }}>
            {t(
              isOpen
                ? 'budgetDetails.estimatedComparison'
                : 'budgetDetails.actualComparison',
            )}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '34px max-content minmax(0, 1fr) 28px',
            columnGap: 1.5,
            rowGap: 2,
          }}
        >
          {comparison.map(({ label, amount, color, Icon }) => {
            const percentage =
              combinedCents > 0
                ? Math.round((Math.round(amount * 100) / combinedCents) * 100)
                : 0;
            return (
              <Box
                key={label}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'subgrid',
                  gridColumn: '1 / -1',
                  rowGap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 36,
                    gridRow: '1 / 3',
                    borderRadius: 1,
                    color,
                    bgcolor: alpha(color, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{
                    gridColumn: '2 / -1',
                    fontSize: 11,
                    color: 'text.secondary',
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {format.invoke(amount)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  aria-label={label}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.text.primary, 0.13),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: color,
                      borderRadius: 5,
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10,
                    color: 'text.secondary',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {percentage}%
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box sx={card}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              ...iconTile,
              color: '#20b9dd',
              bgcolor: alpha('#20b9dd', 0.14),
            }}
          >
            <BalanceOutlined sx={{ fontSize: 21 }} />
          </Box>
          <Typography sx={heading}>{t('budgetDetails.balances')}</Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('budgetDetails.initialBalance')}
            </Typography>
            <Typography
              sx={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
            >
              {format.invoke(initialBalance)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t(
                isOpen
                  ? 'budgetDetails.estimatedBalance'
                  : 'budgetDetails.actualBalance',
              )}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: balanceColor,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format.invoke(balance)}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('budgetDetails.finalBalance')}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 650,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {format.invoke(finalBalance)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ ...card, gridColumn: { lg: '1 / -1', xl: 'auto' } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              ...iconTile,
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.text.secondary, 0.14),
            }}
          >
            <DescriptionOutlined sx={{ fontSize: 21 }} />
          </Box>
          <Typography sx={heading}>{t('common.description')}</Typography>
        </Stack>
        {description}
      </Box>
    </Box>
  );
}
