import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import Grid from '@mui/material/Unstable_Grid2';
import { useTranslation } from 'react-i18next';
import DataCard from '../../components/DataCard.tsx';
import MonthlyOverviewChart from './MonthlyOverviewChart.tsx';
import { PanelTitle } from '../../theme/styled.ts';
import MonthByMonthBalanceChart from './MonthByMonthBalanceChart.tsx';

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
  const { t } = useTranslation();

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
    </Grid>
  );
};

export default Dashboard;
