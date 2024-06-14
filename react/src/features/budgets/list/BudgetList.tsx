import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { memo, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper/Paper';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../../components/PageHeader.tsx';
import Stack from '@mui/material/Stack/Stack';
import { useGetBudgets } from '../../../services/budget/budgetHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import { GridColDef } from '@mui/x-data-grid';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { Budget } from '../../../services/budget/budgetServices.ts';
import {
  AddCircleOutline,
  Delete,
  Lock,
  LockOpen,
  Search,
  Visibility,
} from '@mui/icons-material';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Button from '@mui/material/Button/Button';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import MyFinTable from '../../../components/MyFinTable.tsx';
import Typography from '@mui/material/Typography/Typography';
import Chip from '@mui/material/Chip/Chip';

const BudgetList = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 15,
    page: 0,
  });
  const getBudgetsRequest = useGetBudgets(
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
  );

  // Loading
  useEffect(() => {
    if (getBudgetsRequest.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getBudgetsRequest.isLoading]);

  // Error
  useEffect(() => {
    if (getBudgetsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getBudgetsRequest.isError]);

  if (getBudgetsRequest.isLoading || !getBudgetsRequest.data) {
    return null;
  }

  const getPercentageTextColor = (percentage: number) => {
    switch (true) {
      case percentage > 0:
        return 'success';
      case percentage < 0:
        return 'error';
      default:
        return 'default';
    }
  };

  function goToBudgetDetails(_: Budget) {
    // TODO
  }

  function handleRemoveBudgetClick(_: Budget) {
    // TODO
  }

  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: '',
      width: 10,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => (params.value ? <LockOpen /> : <Lock />),
    },
    {
      field: 'month',
      headerName: t('budgets.month'),
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack gap={1} pt={2} pb={2}>
          <Stack direction="row" alignItems="start" gap={0.5}>
            <Typography variant="body1">
              <strong>{getMonthsFullName(params.value.month)}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="start" gap={0.5}>
            <Typography variant="caption">
              {params.value.month}/{params.value.year}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'observations',
      headerName: t('budgets.observations'),
      flex: 5,
      minWidth: 300,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'expenses',
      headerName: t('transactions.expense'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => <>{formatNumberAsCurrency(params.value)}</>,
    },
    {
      field: 'income',
      headerName: t('transactions.income'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => <>{formatNumberAsCurrency(params.value)}</>,
    },
    {
      field: 'balance',
      headerName: t('budgets.balance'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack pt={2} pb={2}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <strong>{formatNumberAsCurrency(params.value.value)}</strong>
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
            <Chip
              size="small"
              variant="outlined"
              color={getPercentageTextColor(params.value.changePercentage)}
              label={formatNumberAsPercentage(
                params.value.changePercentage,
                true,
              )}
            />
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'savings',
      headerName: t('budgets.savings'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Chip
          color={getPercentageTextColor(params.value)}
          label={formatNumberAsPercentage(params.value, true)}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={3}>
          <Visibility
            fontSize="medium"
            color="action"
            onClick={() => {
              goToBudgetDetails(params.value);
            }}
            sx={{ cursor: 'pointer' }}
          />
          <Delete
            fontSize="medium"
            color="action"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              handleRemoveBudgetClick(params.value);
            }}
          />
        </Stack>
      ),
    },
  ];

  const rows = getBudgetsRequest.data.results.map((result: Budget) => ({
    id: result.budget_id,
    status: result.is_open,
    month: {
      month: result.month,
      year: result.year,
    },
    observations: result.observations,
    expenses: result.debit_amount,
    income: result.credit_amount,
    balance: {
      value: result.balance_value,
      changePercentage: result.balance_change_percentage,
    },
    savings: result.savings_rate_percentage,
    actions: result,
  }));

  return (
    <Paper elevation={2} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader
          title={t('budgets.budgets')}
          subtitle={t('budgets.strapLine')}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid sm={8} xs={12} container spacing={2}>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={() => {
                /*handleAddTransactionClick();*/
              }}
            >
              {t('budgets.addBudget')}
            </Button>
          </Grid>
        </Grid>
        <Grid
          sm={12}
          lg={4}
          xsOffset="auto"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {' '}
          <TextField
            id="outlined-basic"
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
              setSearchQuery(event.target.value);
            }}
          />
        </Grid>
        <Grid xs={12}>
          <MyFinTable
            isRefetching={getBudgetsRequest.isRefetching}
            rows={rows}
            columns={columns}
            itemCount={getBudgetsRequest.data.filtered_count}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default memo(BudgetList);
