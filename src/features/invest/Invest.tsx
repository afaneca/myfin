import { Tab, Tabs, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import PageHeader from '../../components/PageHeader.tsx';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import InvestDashboard from './InvestDashboard.tsx';
import InvestAssets from './assets/InvestAssets.tsx';
import InvestTransactions from './transactions/InvestTransactions.tsx';
import InvestStats from './stats/InvestStats.tsx';
import {
  ROUTE_INVEST_ASSETS,
  ROUTE_INVEST_DASHBOARD,
  ROUTE_INVEST_STATS,
  ROUTE_INVEST_TRANSACTIONS,
} from '../../providers/RoutesProvider.tsx';
import { useNavigate } from 'react-router-dom';

export enum InvestTab {
  Summary = 0,
  Assets = 1,
  Transactions = 2,
  Reports = 3,
}

const Invest = ({ defaultTab }: { defaultTab?: InvestTab }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<InvestTab>(defaultTab || 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    switch (selectedTab) {
      case InvestTab.Assets:
        navigate(ROUTE_INVEST_ASSETS);
        break;
      case InvestTab.Transactions:
        navigate(ROUTE_INVEST_TRANSACTIONS);
        break;
      case InvestTab.Reports:
        navigate(ROUTE_INVEST_STATS);
        break;
      case InvestTab.Summary:
      default:
        navigate(ROUTE_INVEST_DASHBOARD);
        break;
    }
  }, [selectedTab]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case InvestTab.Summary:
        return <InvestDashboard />;
      case InvestTab.Assets:
        return <InvestAssets />;
      case InvestTab.Transactions:
        return <InvestTransactions />;
      case InvestTab.Reports:
        return <InvestStats />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('investments.investments')}
          subtitle={t('investments.strapLine')}
        />
      </Box>
      <Grid container spacing={2}>
        {' '}
        <Grid size={12}>
          <Tabs
            selectionFollowsFocus
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
          >
            <Tab label={t('investments.summary')} />
            <Tab label={t('investments.assets')} />
            <Tab label={t('investments.transactions')} />
            <Tab label={t('investments.reports')} />
          </Tabs>
          <Box mt={4}>{renderTabContent()}</Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Invest;
