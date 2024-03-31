import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import Grid from '@mui/material/Unstable_Grid2';
import { useTranslation } from 'react-i18next';
import DataCard from '../../components/DataCard.tsx';
import MonthlyOverviewChart from './MonthlyOverviewChart.tsx';
import { PanelTitle } from '../../theme/styled.ts';
import DashboardPieChart, { ChartDataItem } from './DashboardPieChart.tsx';
import MonthByMonthBalanceChart from './MonthByMonthBalanceChart.tsx';
import { useGetMonthExpensesIncomeDistributionData } from '../../services/stats/statHooks.ts';
import { useEffect, useState } from 'react';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { MonthExpensesDistributionDataResponse } from '../../services/stats/statServices.ts';

const monthByMonthData = [
  {
    month: 'Ago 2022',
    balance: 501.23,
  },
  {
    month: 'Set 2022',
    balance: 111.89,
  },
  {
    month: 'Out 2022',
    balance: -500,
  },
  {
    month: 'Nov 2022',
    balance: -592.21,
  },
  {
    month: 'Dez 2022',
    balance: 672.22,
  },
];
const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const [monthYear, setMonthYear] = useState({ month: 3, year: 2023 });
  const monthIncomeExpensesDistributionData =
    useGetMonthExpensesIncomeDistributionData(monthYear.month, monthYear.year);
  const [expensesChartData, setExpensesChartData] = useState<ChartDataItem[]>(
    [],
  );
  const [incomeChartData, setIncomeChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (monthIncomeExpensesDistributionData.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [monthIncomeExpensesDistributionData.isLoading]);

  useEffect(() => {
    // Show error when isError is true
    if (monthIncomeExpensesDistributionData.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [monthIncomeExpensesDistributionData.isError]);

  const setupIncomeDistributionChart = (
    data: MonthExpensesDistributionDataResponse,
  ) => {
    setIncomeChartData(
      data.categories
        ?.filter((category) => category.current_amount_credit != 0)
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
        ?.slice(0, 5)
        ?.map((category) => ({
          id: category.name ?? '',
          color: category.color_gradient ?? '',
          value: category.current_amount_debit ?? 0,
        })) ?? [],
    );
  };

  useEffect(() => {
    // Transform data & update state when fetch is successful
    if (monthIncomeExpensesDistributionData.isSuccess) {
      // TODO: setup last updated timestamp
      setupIncomeDistributionChart(monthIncomeExpensesDistributionData.data);
      setupExpenseDistributionChart(monthIncomeExpensesDistributionData.data);
    }
  }, [monthIncomeExpensesDistributionData.data]);

  const data = [
    {
      id: t('dashboard.current'),
      type: '0',
      value: 188,
    },
    {
      id: t('dashboard.remaining'),
      type: '1',
      value: 345,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ p: theme.spacing(2) }}>
      <Grid xs={12} md={4}>
        <DataCard>
          <PanelTitle>{t('dashboard.monthlyOverview')}</PanelTitle>
          <MonthlyOverviewChart data={data} />
        </DataCard>
      </Grid>
      <Grid xs={12} md={8}>
        <DataCard>
          <PanelTitle>{t('dashboard.monthlySavings')}</PanelTitle>
          <MonthByMonthBalanceChart data={monthByMonthData} />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('dashboard.incomeDistribution')}</PanelTitle>
          <DashboardPieChart
            data={incomeChartData}
            /*sx={{ height: 400 }}*/
          />
        </DataCard>
      </Grid>
      <Grid xs={12} lg={6}>
        <DataCard>
          <PanelTitle>{t('dashboard.expenseDistribution')}</PanelTitle>
          <DashboardPieChart data={expensesChartData} />
        </DataCard>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
