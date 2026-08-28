import {
  AddCircleOutline,
  ArrowOutward,
  Delete,
  Lock,
  LockOpen,
  Search,
  TableView,
  Visibility,
} from '@mui/icons-material';
import { Checkbox, FormGroup, Tooltip, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { debounce } from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import MyFinTable from '../../../components/MyFinTable.tsx';
import PageHeader from '../../../components/PageHeader.tsx';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  ROUTE_BUDGET_DETAILS,
  ROUTE_BUDGET_MATRIX,
  ROUTE_BUDGET_NEW,
} from '../../../providers/RoutesProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import {
  useGetBudgets,
  useRemoveBudget,
} from '../../../services/budget/budgetHooks.ts';
import { Budget } from '../../../services/budget/budgetServices.ts';
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthsFullName,
} from '../../../utils/dateUtils.ts';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import { formatNumberAsPercentage } from '../../../utils/textUtils.ts';

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
  const handleBudgetMatrixClick = () => {
    navigate(ROUTE_BUDGET_MATRIX);
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              flexWrap="wrap"
            >
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
              <Tooltip title={t('budgets.matrixView')} placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  aria-label={t('budgets.matrixView')}
                  onClick={handleBudgetMatrixClick}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <TableView fontSize="small" />
                </IconButton>
              </Tooltip>
              <FormGroup sx={{ m: 0 }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={showOnlyOpen}
                      onChange={(_, checked) => setShowOnlyOpen(checked)}
                    />
                  }
                  label={t('budgets.onlyOpened')}
                />
              </FormGroup>
            </Stack>
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
              },
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
