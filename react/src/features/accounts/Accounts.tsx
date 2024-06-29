import { Tab, Tabs, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper/Paper';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useGetAccounts } from '../../services/account/accountHooks.ts';
import React, { useEffect, useMemo, useState } from 'react';
import { Account, AccountType } from '../../services/auth/authServices.ts';
import MyFinTable from '../../components/MyFinTable.tsx';
import { GridColDef } from '@mui/x-data-grid';
import { formatStringAsCurrency } from '../../utils/textUtils.ts';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit } from '@mui/icons-material';
import Stack from '@mui/material/Stack/Stack';
import { cssGradients } from '../../utils/gradientUtils.ts';
import Chip from '@mui/material/Chip/Chip';
import Button from '@mui/material/Button/Button';
import { ColorGradient } from '../../consts';

const Accounts = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getAccountsRequest = useGetAccounts();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filter, setFilter] = useState<AccountType[] | null>(null);

  const filteredAccounts = useMemo(() => {
    if (filter == null)
      return accounts.sort((a, b) => a.status.localeCompare(b.status));
    return accounts
      .filter((acc) => filter.includes(acc.type))
      .sort((a, b) => a.status.localeCompare(b.status));
  }, [filter, accounts]);

  // Loading
  useEffect(() => {
    if (getAccountsRequest.isFetching) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getAccountsRequest.isFetching]);

  // Error
  useEffect(() => {
    if (getAccountsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getAccountsRequest.isError]);

  // Success
  useEffect(() => {
    if (!getAccountsRequest.data) return;
    setAccounts(getAccountsRequest.data);
  }, [getAccountsRequest.data]);

  useEffect(() => {
    switch (selectedTab) {
      case 0:
        setFilter(null);
        break;
      case 1:
        setFilter([
          AccountType.Checking,
          AccountType.Savings,
          AccountType.Meal,
          AccountType.Wallet,
        ]);
        break;
      case 2:
        setFilter([AccountType.Credit]);
        break;
      case 3:
        setFilter([AccountType.Investing]);

        break;
      case 4:
        setFilter([AccountType.Other]);
        break;
    }
  }, [selectedTab]);

  const rows = filteredAccounts.map((account: Account) => ({
    id: account.account_id,
    color: account.color_gradient,
    name: account.name,
    type: account.type,
    balance: account.balance,
    status: account.status,
    actions: account,
  }));

  const columns: GridColDef[] = [
    {
      field: 'color',
      headerName: t('accounts.color'),
      minWidth: 40,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <div
          style={{
            margin: 10,
            background: cssGradients[params.value as ColorGradient] ?? '',
            width: 30,
            height: 30,
            borderRadius: 20,
          }}
        ></div>
      ),
    },
    {
      field: 'name',
      headerName: t('accounts.name'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'type',
      headerName: t('accounts.type'),
      width: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <p>{t(`accounts.${params.value.toLowerCase()}`)}</p>
      ),
    },
    {
      field: 'balance',
      headerName: t('accounts.balance'),
      width: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip variant="outlined" label={formatStringAsCurrency(params.value)} />
      ),
    },
    {
      field: 'status',
      headerName: t('accounts.status'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value}
          variant="outlined"
          color={params.value.startsWith('Ativa') ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: () => (
        <Stack direction="row" gap={0}>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() => {
              // TODO
            }}
          >
            <Edit fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={() => {
              // TODO
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('accounts.accounts')}
          subtitle={t('accounts.strapLine')}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        startIcon={<AddCircleOutline />}
        onClick={() => {
          // TODO
        }}
      >
        {t('accounts.addAccount')}
      </Button>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Tabs
            selectionFollowsFocus
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
          >
            <Tab label={t('accounts.all')} />
            <Tab label={t('topBar.operatingFunds')} />
            <Tab label={t('topBar.debt')} />
            <Tab label={t('accounts.investments')} />
            <Tab label={t('accounts.others')} />
          </Tabs>
        </Grid>
        <Grid xs={12}>
          <MyFinTable
            isRefetching={getAccountsRequest.isRefetching}
            rows={rows}
            columns={columns}
            itemCount={filteredAccounts.length}
            paginationModel={{ pageSize: 100, page: 0 }}
            setPaginationModel={() => {}}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Accounts;
