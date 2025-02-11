import { Tooltip, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useTranslation } from 'react-i18next';
import DataCard from '../../components/DataCard.tsx';
import MonthlyOverviewChart, {
  ChartDataItem as MonthlyOverviewChartDataItem,
} from './MonthlyOverviewChart.tsx';
import { PanelTitle } from '../../theme/styled.ts';
import DashboardPieChart, { ChartDataItem } from './DashboardPieChart.tsx';
import MonthByMonthBalanceChart, {
  MonthByMonthChartDataItem,
} from './MonthByMonthBalanceChart.tsx';
import {
  useGetMonthByMonthData,
  useGetMonthExpensesIncomeDistributionData,
} from '../../services/stats/statHooks.ts';
import { memo, useEffect, useState } from 'react';
import { addLeadingZero } from '../../utils/textUtils.ts';

import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import {
  MonthByMonthDataItem,
  MonthExpensesDistributionDataResponse,
} from '../../services/stats/statServices.ts';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import Typography from '@mui/material/Typography/Typography';
import { AccessTime } from '@mui/icons-material';
import Stack from '@mui/material/Stack/Stack';
import {
  useGetDebtAccounts,
  useGetInvestingAccounts,
} from '../../services/user/userHooks.ts';
import { Account } from '../../services/auth/authServices.ts';

const Dashboard = () => {
  const MONTH_BY_MONTH_MAX_MONTHS = 6;
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const [monthYear, setMonthYear] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });
  const monthIncomeExpensesDistributionData =
    useGetMonthExpensesIncomeDistributionData(monthYear.month, monthYear.year);
  const [expensesChartData, setExpensesChartData] = useState<ChartDataItem[]>(
    [],
  );
  const [incomeChartData, setIncomeChartData] = useState<ChartDataItem[]>([]);
  const [monthlyOverviewChartData, setMonthlyOverviewChartData] = useState<
    MonthlyOverviewChartDataItem[]
  >([]);
  const [monthByMonthChartData, setMonthByMonthChartData] = useState<
    MonthByMonthChartDataItem[]
  >([]);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string>('');

  const debtAccounts = useGetDebtAccounts();
  const investAccounts = useGetInvestingAccounts();
  const [debtChartData, setDebtChartData] = useState<ChartDataItem[]>([]);
  const [investChartData, setInvestChartData] = useState<ChartDataItem[]>([]);
  const getMonthByMonthData = useGetMonthByMonthData(MONTH_BY_MONTH_MAX_MONTHS);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (
      monthIncomeExpensesDistributionData.isLoading ||
      getMonthByMonthData.isLoading
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    monthIncomeExpensesDistributionData.isLoading,
    getMonthByMonthData.isLoading,
  ]);

  useEffect(() => {
    // Show error when isError is true
    if (
      monthIncomeExpensesDistributionData.isError ||
      getMonthByMonthData.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    monthIncomeExpensesDistributionData.isError,
    getMonthByMonthData.isError,
  ]);

  useEffect(() => {
    // Transform data & update state when fetch is successful
    if (monthIncomeExpensesDistributionData.isSuccess) {
      setupLastUpdatedTimestamp(
        monthIncomeExpensesDistributionData.data.last_update_timestamp,
      );
      setupMonthlyOverviewChart(monthIncomeExpensesDistributionData.data);
      setupIncomeDistributionChart(monthIncomeExpensesDistributionData.data);
      setupExpenseDistributionChart(monthIncomeExpensesDistributionData.data);
    }
  }, [monthIncomeExpensesDistributionData.data]);

  function transformBudgetData(
    data: MonthByMonthDataItem[],
  ): MonthByMonthChartDataItem[] {
    /**
     * If it contains budget for current month, get data for current & previous 4 months.
     * Else, show data for most recent budgeted month & 4 previous months
     */
    const transformedData: MonthByMonthChartDataItem[] = [];
    for (let i = 0; i < MONTH_BY_MONTH_MAX_MONTHS; i++) {
      const currentDate = dayjs().subtract(i, 'month');
      const budget = data.find(
        (budget) => budget.month === currentDate.month() + 1,
      );
      const balance = budget ? budget.balance_value : 0;
      transformedData[i] = {
        month: `${currentDate.month() + 1}/${currentDate.year()}`,
        balance,
      };
    }
    return transformedData.reverse();
  }

  useEffect(() => {
    // transform budget data
    if (getMonthByMonthData.isSuccess) {
      setMonthByMonthChartData(transformBudgetData(getMonthByMonthData.data));
    }
  }, [getMonthByMonthData.data]);

  useEffect(() => {
    setDebtChartData(generateDebtIncomeDistributionChartData(debtAccounts));
  }, [debtAccounts]);

  useEffect(() => {
    setInvestChartData(generateDebtIncomeDistributionChartData(investAccounts));
  }, [investAccounts]);

  const generateDebtIncomeDistributionChartData = (accounts: Account[]) => {
    return (
      accounts
        ?.filter((acc) => acc.balance != 0)
        ?.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        ?.slice(0, 5)
        ?.map((acc) => ({
          id: acc.name ?? '',
          color: acc.color_gradient ?? '',
          value: Math.abs(acc.balance ?? 0),
        })) ?? []
    );
  };

  const setupIncomeDistributionChart = (
    data: MonthExpensesDistributionDataResponse,
  ) => {
    setIncomeChartData(
      data.categories
        ?.filter(
          (category) =>
            category.current_amount_credit != 0 &&
            category.exclude_from_budgets != 1,
        )
        ?.sort(
          (a, b) =>
            Math.abs(b.current_amount_credit ?? 0) -
            Math.abs(a.current_amount_credit ?? 0),
        )
        ?.slice(0, 5)
        ?.map((category) => ({
          id: category.name ?? '',
          color: category.color_gradient ?? '',
          value: category.current_amount_credit ?? 0,
        })) ?? [],
    );
  };

  const setupExpenseDistributionChart = (
    data: MonthExpensesDistributionDataResponse,
  ) => {
    setExpensesChartData(
      data.categories
        ?.filter((category) => category.current_amount_debit != 0)
        ?.sort(
          (a, b) =>
            Math.abs(b.current_amount_debit ?? 0) -
            Math.abs(a.current_amount_debit ?? 0),
        )
        ?.slice(0, 5)
        ?.map((category) => ({
          id: category.name ?? '',
          color: category.color_gradient ?? '',
          value: category.current_amount_debit ?? 0,
        })) ?? [],
    );
  };

  const setupLastUpdatedTimestamp = (
    timestamp: number | string | undefined,
  ) => {
    if (!timestamp || timestamp == '0') return '-';
    setLastUpdatedTimestamp(
      dayjs.unix(timestamp as number).format('YYYY-MM-DD'),
    );
  };

  const setupMonthlyOverviewChart = (
    data: MonthExpensesDistributionDataResponse,
  ) => {
    let totalExpensesRealAmount = 0;
    let totalExpensesBudgetedAmount = 0;

    data.categories?.forEach((category) => {
      if (category.exclude_from_budgets !== 1) {
        totalExpensesRealAmount += category.current_amount_debit ?? 0;
        totalExpensesBudgetedAmount += parseFloat(
          category.planned_amount_debit ?? '0',
        );
      }
    });

    if (totalExpensesBudgetedAmount == 0 && totalExpensesRealAmount == 0) {
      setMonthlyOverviewChartData([]);
    } else {
      setMonthlyOverviewChartData([
        {
          id: t('dashboard.current'),
          type: '0',
          value: totalExpensesRealAmount,
        },
        {
          id: t('dashboard.remaining'),
          type: '1',
          value: Math.max(
            totalExpensesBudgetedAmount - totalExpensesRealAmount,
            0,
          ),
        },
      ]);
    }
  };

  const handleMonthChange = (newDate: Dayjs | null) => {
    if (newDate == null) return;
    setMonthYear({ month: newDate.month() + 1, year: newDate.year() });
  };

  return (
    <Grid container spacing={2} sx={{ p: theme.spacing(2) }}>
      <Grid xs={12} md={3}>
        <DatePicker
          label={t('stats.month')}
          views={['month', 'year']}
          onChange={(newDate) => handleMonthChange(newDate)}
          value={dayjs(`${monthYear.year}-${addLeadingZero(monthYear.month)}`)}
        />
      </Grid>
      <Grid
        xs={3}
        xsOffset={6}
        direction="column"
        sx={{
          // Hide on screens smaller than 'md'
          display: { xs: 'none', sm: 'none', md: 'flex' },
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
        visibility={lastUpdatedTimestamp == '' ? 'hidden' : 'visible'}
      >
        <Tooltip title={t('dashboard.lastUpdate')}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <AccessTime
              fontSize="inherit"
              style={{ color: theme.palette.text.secondary }}
            />
            <Typography variant="button" color="text.secondary">
              {lastUpdatedTimestamp}
            </Typography>
          </Stack>
        </Tooltip>
      </Grid>
      <Grid xs={12} md={4}>
        <DataCard>
          <PanelTitle>{t('dashboard.monthlyOverview')}</PanelTitle>
          <MonthlyOverviewChart data={monthlyOverviewChartData} />
        </DataCard>
      </Grid>
      <Grid xs={12} md={8}>
        <DataCard>
          <PanelTitle>{t('dashboard.monthlySavings')}</PanelTitle>
          <MonthByMonthBalanceChart data={monthByMonthChartData} />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('dashboard.incomeDistribution')}</PanelTitle>
          <DashboardPieChart data={incomeChartData} />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('dashboard.expenseDistribution')}</PanelTitle>
          <DashboardPieChart data={expensesChartData} />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('common.investmentPortfolio')}</PanelTitle>
          <DashboardPieChart data={investChartData} />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('common.debtDistribution')}</PanelTitle>
          <DashboardPieChart data={debtChartData} />
        </DataCard>
      </Grid>
    </Grid>
  );
};

export default memo(Dashboard);
