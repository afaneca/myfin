import { Checkbox, FormGroup, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { memo, useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import PageHeader from '../../../components/PageHeader.tsx';
import Stack from '@mui/material/Stack';
import {
  useGetBudgets,
  useRemoveBudget,
} from '../../../services/budget/budgetHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import { GridColDef } from '@mui/x-data-grid';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { Budget } from '../../../services/budget/budgetServices.ts';
import {
  AddCircleOutline,
  ArrowOutward,
  Delete,
  Lock,
  LockOpen,
  Search,
  Visibility,
} from '@mui/icons-material';
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthsFullName,
} from '../../../utils/dateUtils.ts';
import { formatNumberAsPercentage } from '../../../utils/textUtils.ts';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MyFinTable from '../../../components/MyFinTable.tsx';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import { useNavigate } from 'react-router-dom';
import {
  ROUTE_BUDGET_DETAILS,
  ROUTE_BUDGET_NEW,
} from '../../../providers/RoutesProvider.tsx';
import { debounce } from 'lodash';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';

const BudgetList = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 15,
    page: 0,
  });
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const getBudgetsRequest = useGetBudgets(
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
    showOnlyOpen ? 'O' : undefined,
  );
  const [actionableBudget, setActionableBudget] = useState<Budget | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const removeBudgetRequest = useRemoveBudget();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

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
    if (getBudgetsRequest.isError || removeBudgetRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getBudgetsRequest.isError, removeBudgetRequest.isError]);

  useEffect(() => {
    if (isRemoveDialogOpen == false) {
      setActionableBudget(null);
    }
  }, [isRemoveDialogOpen]);

  if (getBudgetsRequest.isLoading || !getBudgetsRequest.data) {
    return null;
  }

  const getPercentageTextColor = (percentage: number) => {
    switch (true) {
      case percentage > 0:
        return 'success';
      case percentage < 0:
        return 'warning';
      default:
        return 'default';
    }
  };

  const goToBudgetDetails = (budgetId: bigint) => {
    navigate(ROUTE_BUDGET_DETAILS.replace(':id', budgetId + ''));
  };

  const handleAddBudgetClick = () => {
    navigate(ROUTE_BUDGET_NEW);
  };

  const handleRemoveBudgetClick = (budget: Budget) => {
    setActionableBudget(budget);
    setRemoveDialogOpen(true);
  };

  const removeBudget = () => {
    if (!actionableBudget) return;
    removeBudgetRequest.mutate(actionableBudget?.budget_id);
    setRemoveDialogOpen(false);
  };

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
      renderCell: (params) => (
        <>{formatNumberAsCurrency.invoke(params.value)}</>
      ),
    },
    {
      field: 'income',
      headerName: t('transactions.income'),
      flex: 1,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <>{formatNumberAsCurrency.invoke(params.value)}</>
      ),
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
            <strong>{formatNumberAsCurrency.invoke(params.value.value)}</strong>
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
            <Chip
              size="small"
              variant={params.value.highlighted ? 'filled' : 'outlined'}
              color={
                params.value.highlighted
                  ? 'default'
                  : getPercentageTextColor(params.value.changePercentage)
              }
              label={formatNumberAsPercentage(
                params.value.changePercentage,
                true,
              )}
              icon={
                params.value.changePercentage === 0 ||
                !Number.isFinite(params.value.changePercentage) ? (
                  <></>
                ) : params.value.changePercentage < 0 ? (
                  <ArrowOutward sx={{ transform: 'rotate(90deg)' }} />
                ) : (
                  <ArrowOutward sx={{ transform: 'rotate(0deg)' }} />
                )
              }
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
          color={
            params.value.highlighted
              ? 'default'
              : getPercentageTextColor(params.value.value)
          }
          label={
            params.value.value == 0
              ? '-%'
              : formatNumberAsPercentage(params.value.value, true)
          }
          variant={params.value.highlighted ? 'filled' : 'outlined'}
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
        <Stack direction="row" gap={0}>
          <IconButton
            aria-label={t('common.seeMore')}
            onClick={() => {
              goToBudgetDetails(params.value.budget_id);
            }}
          >
            <Visibility fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveBudgetClick(params.value);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const shouldRowBeHighlighted = (budget: Budget): boolean => {
    return budget.month == getCurrentMonth() && budget.year == getCurrentYear();
  };

  const rows = getBudgetsRequest.data.results.map((result: Budget) => ({
    id: result.budget_id,
    highlight: shouldRowBeHighlighted(result),
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
      highlighted: shouldRowBeHighlighted(result),
    },
    savings: {
      value: result.savings_rate_percentage,
      highlighted: shouldRowBeHighlighted(result),
    },
    actions: result,
  }));

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={() => removeBudget()}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('budgets.deleteBudgetModalTitle', {
            month: actionableBudget?.month,
            year: actionableBudget?.year,
          })}
          descriptionText={t('budgets.deleteBudgetModalSubtitle')}
          positiveText={t('common.delete')}
        />
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader
          title={t('budgets.budgets')}
          subtitle={t('budgets.strapLine')}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid
          container
          spacing={2}
          size={{
            sm: 8,
            xs: 12,
          }}
        >
          <Grid>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={() => {
                handleAddBudgetClick();
              }}
            >
              {t('budgets.addBudget')}
            </Button>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyOpen}
                    onChange={(_, checked) => setShowOnlyOpen(checked)}
                  />
                }
                label={t('budgets.onlyOpened')}
              />
            </FormGroup>
          </Grid>
        </Grid>

        <Grid
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
          size={{
            sm: 12,
            lg: 4,
          }}
          offset="auto"
        >
          {' '}
          <TextField
            id="outlined-basic"
            label={t('common.search')}
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              debouncedSearchQuery(event.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>
        <Grid size={12}>
          <MyFinTable
            isRefetching={getBudgetsRequest.isRefetching}
            rows={rows}
            columns={columns}
            itemCount={getBudgetsRequest.data.filtered_count}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            onRowClicked={(id) => goToBudgetDetails(id)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default memo(BudgetList);
