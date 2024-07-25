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
import {
  useGetAccounts,
  useRemoveAccount,
} from '../../services/account/accountHooks.ts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Account,
  AccountStatus,
  AccountType,
} from '../../services/auth/authServices.ts';
import { GridColDef } from '@mui/x-data-grid';
import { formatStringAsCurrency } from '../../utils/textUtils.ts';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import Stack from '@mui/material/Stack/Stack';
import { cssGradients } from '../../utils/gradientUtils.ts';
import Chip from '@mui/material/Chip/Chip';
import Button from '@mui/material/Button/Button';
import { ColorGradient } from '../../consts';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import AddEditAccountDialog from './AddEditAccountDialog.tsx';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import TextField from '@mui/material/TextField/TextField';
import { debounce } from 'lodash';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';

const Accounts = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getAccountsRequest = useGetAccounts();
  const removeAccountRequest = useRemoveAccount();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filter, setFilter] = useState<AccountType[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionableAccount, setActionableAccount] = useState<Account | null>(
    null,
  );
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditAccountDialogOpen, setAddEditDialogOpen] = useState(false);

  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const filteredAccounts = useMemo(() => {
    let filteredList = accounts;

    if (filter != null || searchQuery != null) {
      const lowerCaseQuery = searchQuery?.toLowerCase() || '';
      filteredList = accounts.filter((acc) => {
        const matchesFilter = !filter || filter.includes(acc.type);
        const matchesSearchQuery =
          !searchQuery || acc.name.toLowerCase().includes(lowerCaseQuery);
        return matchesFilter && matchesSearchQuery;
      });
    }

    return filteredList.sort((a, b) => a.status.localeCompare(b.status));
  }, [filter, searchQuery, accounts]);

  // Loading
  useEffect(() => {
    if (getAccountsRequest.isFetching || removeAccountRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getAccountsRequest.isFetching, removeAccountRequest.isPending]);

  // Error
  useEffect(() => {
    if (getAccountsRequest.isError || removeAccountRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getAccountsRequest.isError, removeAccountRequest.isError]);

  // Success
  useEffect(() => {
    if (!getAccountsRequest.data) return;
    setAccounts(getAccountsRequest.data);
  }, [getAccountsRequest.data]);

  // Tab filtering
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

  // Reset actionableAccount
  useEffect(() => {
    if (isRemoveDialogOpen == false && isAddEditAccountDialogOpen == false) {
      setActionableAccount(null);
    }
  }, [isRemoveDialogOpen, isAddEditAccountDialogOpen]);

  const handleEditButtonClick = (account: Account) => {
    setActionableAccount(account);
    setAddEditDialogOpen(true);
  };

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
          color={
            params.value.startsWith(AccountStatus.Active)
              ? 'success'
              : 'warning'
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={0}>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() => {
              handleEditButtonClick(params.value);
            }}
          >
            <Edit fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              setActionableAccount(params.value);
              setRemoveDialogOpen(true);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const removeAccount = () => {
    if (!actionableAccount) return;
    removeAccountRequest.mutate(actionableAccount.account_id);
    setRemoveDialogOpen(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchQuery(event.target.value);
    },
    [debouncedSearchQuery],
  );

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isAddEditAccountDialogOpen && (
        <AddEditAccountDialog
          isOpen={isAddEditAccountDialogOpen}
          onClose={() => setAddEditDialogOpen(false)}
          onPositiveClick={() => setAddEditDialogOpen(false)}
          onNegativeClick={() => setAddEditDialogOpen(false)}
          account={actionableAccount}
        />
      )}
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={() => removeAccount()}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('accounts.deleteAccountModalTitle', {
            name: actionableAccount?.name,
          })}
          descriptionText={t('accounts.deleteAccountModalSubtitle')}
          positiveText={t('common.delete')}
        />
      )}
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
          setAddEditDialogOpen(true);
        }}
      >
        {t('accounts.addAccount')}
      </Button>
      <Grid container spacing={2}>
        <Grid xs={12} md={8}>
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
        <Grid
          xs={12}
          md={4}
          xsOffset="auto"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <TextField
            id="search"
            label={t('common.search')}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSearchChange(event);
            }}
          />
        </Grid>
        <Grid xs={12}>
          <MyFinStaticTable
            isRefetching={getAccountsRequest.isRefetching}
            rows={rows}
            columns={columns}
            paginationModel={{ pageSize: 100 }}
            onRowClicked={(id) => {
              const account = accounts.find((acc) => acc.account_id == id);
              if (!account) return;
              handleEditButtonClick(account);
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Accounts;
