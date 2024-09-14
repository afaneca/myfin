import { Tab, Tabs, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import React, { useState } from 'react';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../components/PageHeader.tsx';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper/Paper';
import InvestDashboard from './InvestDashboard.tsx';
import InvestAssets from './assets/InvestAssets.tsx';
import InvestTransactions from './transactions/InvestTransactions.tsx';

export enum InvestTab {
  Summary = 0,
  Assets = 1,
  Transactions = 2,
  Reports = 3,
}

const Invest = ({ defaultTab }: { defaultTab: InvestTab }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useState<InvestTab>(defaultTab || 0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case InvestTab.Summary:
        return <InvestDashboard />;
      case InvestTab.Assets:
        return <InvestAssets />;
      case InvestTab.Transactions:
        return <InvestTransactions />;
      /*
      case InvestTab.Reports:
        return <InvestDashboard />;*/
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
        <Grid xs={12}>
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
