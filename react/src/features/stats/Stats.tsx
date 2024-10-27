import { Tab, Tabs, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
  ROUTE_STATS_EXPENSES,
  ROUTE_STATS_INCOME,
  ROUTE_STATS_PATRIMONY_EVO,
  ROUTE_STATS_PROJECTIONS,
  ROUTE_STATS_YEAR_BY_YEAR,
} from '../../providers/RoutesProvider.tsx';
import Paper from '@mui/material/Paper/Paper';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import PatrimonyEvolutionStats from './patrimony/PatrimonyEvolutionStats.tsx';

export enum StatTab {
  PatrimonyEvolution = 0,
  Projections = 1,
  Expenses = 2,
  Income = 3,
  YearByYear = 4,
}

const Stats = ({ defaultTab }: { defaultTab?: StatTab }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<StatTab>(defaultTab || 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    switch (selectedTab) {
      case StatTab.Projections:
        navigate(ROUTE_STATS_PROJECTIONS);
        break;
      case StatTab.Expenses:
        navigate(ROUTE_STATS_EXPENSES);
        break;
      case StatTab.Income:
        navigate(ROUTE_STATS_INCOME);
        break;
      case StatTab.YearByYear:
        navigate(ROUTE_STATS_YEAR_BY_YEAR);
        break;
      case StatTab.PatrimonyEvolution:
      default:
        navigate(ROUTE_STATS_PATRIMONY_EVO);
        break;
    }
  }, [selectedTab]);

  const renderTabContent = () => {
    switch (selectedTab) {
      /*case StatTab.Projections:
        navigate(ROUTE_STATS_PROJECTIONS);
        break;
      case StatTab.Expenses:
        navigate(ROUTE_STATS_EXPENSES);
        break;
      case StatTab.Income:
        navigate(ROUTE_STATS_INCOME);
        break;
      case StatTab.YearByYear:
        navigate(ROUTE_STATS_YEAR_BY_YEAR);
        break;*/
      case StatTab.PatrimonyEvolution:
        return <PatrimonyEvolutionStats />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader title={t('stats.stats')} subtitle={t('stats.strapLine')} />
      </Box>
      <Grid container spacing={2}>
        {' '}
        <Grid xs={12}>
          <Tabs
            selectionFollowsFocus
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
          >
            <Tab label={t('stats.netWorthEvolution')} />
            <Tab label={t('stats.projections')} />
            <Tab label={t('stats.expenses')} />
            <Tab label={t('stats.income')} />
            <Tab label={t('stats.yearByYear')} />
          </Tabs>
          <Box mt={4}>{renderTabContent()}</Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Stats;
