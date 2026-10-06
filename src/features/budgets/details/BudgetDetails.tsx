import {
  ArrowBackIos,
  CalendarMonthOutlined,
  MoreHoriz,
  CircleOutlined,
  ArrowForwardIos,
  CloudUpload,
  FileCopy,
  Lock,
  LockOpen,
  TableView,
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  alpha,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../../../components/SearchBar.tsx';
import TransactionsTableDialog from '../../../components/TransactionsTableDialog.tsx';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  ROUTE_BUDGET_DETAILS,
  ROUTE_BUDGET_MATRIX,
} from '../../../providers/RoutesProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import {
  useCreateBudgetStep0,
  useCreateBudgetStep1,
  useGetBudget,
  useGetBudgetListSummary,
  useGetBudgetToClone,
  useUpdateBudget,
  useUpdateBudgetStatus,
} from '../../../services/budget/budgetHooks.ts';
import {
  BudgetCategory,
  type BudgetBreakdownItem,
} from '../../../services/budget/budgetServices.ts';
import { TransactionType } from '../../../services/trx/trxServices.ts';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import { addLeadingZero } from '../../../utils/textUtils.ts';
import BudgetCategoryRow from './BudgetCategoryRow.tsx';
import BudgetDescription from './BudgetDescription.tsx';
import BudgetListSummaryDialog from './BudgetListSummaryDialog.tsx';
import BudgetSummaryBoard from './BudgetSummaryBoard.tsx';

type RelatedBudget = {
  id: bigint;
  month: string;
  year: string;
};

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();
const matchesCategory = (name: string, query: string) =>
  normalizeSearch(name).includes(normalizeSearch(query));

const BudgetDetailsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loader = useLoading();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { id } = useParams();
  const [pageMenu, setPageMenu] = useState<HTMLElement | null>(null);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [incomeSearch, setIncomeSearch] = useState('');
  const deferredExpenseSearch = useDeferredValue(expenseSearch);
  const deferredIncomeSearch = useDeferredValue(incomeSearch);
  useEffect(() => {
    setExpenseSearch('');
    setIncomeSearch('');
  }, [id]);
  const [budgetToClone, setBudgetToClone] = useState<bigint | null>(null);
  const getBudgetRequest = useGetBudget(BigInt(id ?? -1));
  const createBudgetStep0Request = useCreateBudgetStep0();
  const createBudgetStep1Request = useCreateBudgetStep1();
  const updateBudgetStatusRequest = useUpdateBudgetStatus();
  const updateBudgetRequest = useUpdateBudget();
  const getBudgetToCloneRequest = useGetBudgetToClone(budgetToClone);
  const getBudgetListSummaryRequest = useGetBudgetListSummary();
  const [monthYear, setMonthYear] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const formatNumberAsCurrency = useFormatNumberAsCurrency();
  const [isOpen, setOpen] = useState(false);
  const [isNew, setNew] = useState(true);
  const [breakdownRevision, setBreakdownRevision] = useState(0);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closingBudget, setClosingBudget] = useState(false);
  const [invalidBreakdowns, setInvalidBreakdowns] = useState<
    Record<string, boolean>
  >({});
  const [breakdownPending, startBreakdownTransition] = useTransition();
  const setBreakdownValidity = useCallback((key: string, valid: boolean) => {
    setInvalidBreakdowns((current) =>
      current[key] === !valid ? current : { ...current, [key]: !valid },
    );
  }, []);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [actionableCategory, setActionableCategory] = useState<{
    category: BudgetCategory;
    isDebit: boolean;
  } | null>(null);
  const [isTrxTableDialogOpen, setTrxTableDialogOpen] = useState(false);
  const [isCloneBudgetDialogOpen, setCloneBudgetDialogOpen] = useState(false);
  const [previousBudget, setPreviousBudget] = useState<RelatedBudget | null>(
    null,
  );
  const [nextBudget, setNextBudget] = useState<RelatedBudget | null>(null);
  const orderCategoriesByDebitAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_debit != 0 ||
            cat.planned_amount_debit != 0 ||
            (cat.expense_items?.length ?? 0) > 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.initial_planned_amount_debit + '') -
            Number(a.initial_planned_amount_debit + '')
          );
        return (
          Number(b.current_amount_debit + '') -
          Number(a.current_amount_debit + '')
        );
      });
  };

  const getDescriptionValue = () => {
    return descriptionRef.current?.value ?? '';
  };

  const setDescriptionValue = (text: string) => {
    if (descriptionRef.current != null) {
      descriptionRef.current.value = text;
    }
  };

  const orderCategoriesByCreditAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_credit != 0 ||
            cat.planned_amount_credit != 0 ||
            (cat.income_items?.length ?? 0) > 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.initial_planned_amount_credit + '') -
            Number(a.initial_planned_amount_credit + '')
          );
        return (
          Number(b.current_amount_credit + '') -
          Number(a.current_amount_credit + '')
        );
      });
  };

  const debitCategories = useMemo(() => {
    return orderCategoriesByDebitAmount(categories, isOpen);
  }, [categories, isOpen]);
  const creditCategories = useMemo(() => {
    return orderCategoriesByCreditAmount(categories, isOpen);
  }, [categories, isOpen]);

  const calculateBudgetBalances = (
    categories?: BudgetCategory[],
  ): {
    plannedBalance: number;
    currentBalance: number;
    plannedIncome: number;
    plannedExpenses: number;
    currentIncome: number;
    currentExpenses: number;
  } => {
    const totals = (categories ?? []).reduce(
      (acc, cur) => {
        if (cur.exclude_from_budgets == 1) return acc;

        // API amounts have two decimal places; sum cents before converting back.
        acc.plannedIncome += Math.round(cur.planned_amount_credit * 100);
        acc.plannedExpenses += Math.round(cur.planned_amount_debit * 100);
        acc.currentIncome += Math.round(cur.current_amount_credit * 100);
        acc.currentExpenses += Math.round(cur.current_amount_debit * 100);
        return acc;
      },
      {
        plannedIncome: 0,
        plannedExpenses: 0,
        currentIncome: 0,
        currentExpenses: 0,
      },
    );

    return {
      plannedBalance: (totals.plannedIncome - totals.plannedExpenses) / 100,
      currentBalance: (totals.currentIncome - totals.currentExpenses) / 100,
      plannedIncome: totals.plannedIncome / 100,
      plannedExpenses: totals.plannedExpenses / 100,
      currentIncome: totals.currentIncome / 100,
      currentExpenses: totals.currentExpenses / 100,
    };
  };

  const calculatedBalances = useMemo(
    () => calculateBudgetBalances(categories),
    [categories],
  );

  // Fetch
  useEffect(() => {
    setNew(!id);
    setInvalidBreakdowns({});
    if (!id) {
      createBudgetStep0Request.refetch();
    } else {
      getBudgetRequest.refetch();
    }
  }, [id]);

  useEffect(() => {
    if (!getBudgetListSummaryRequest.data) return;
    const list = getBudgetListSummaryRequest.data;
    const budgetIndex = list.findIndex(
      (elem) => elem.budget_id == BigInt(id ?? -1),
    );

    const previous = list[budgetIndex + 1];
    const next = list[budgetIndex - 1];

    setPreviousBudget(
      previous
        ? {
            id: previous.budget_id,
            month: getMonthsFullName(previous.month),
            year: `${previous.year}`,
          }
        : null,
    );

    setNextBudget(
      next
        ? {
            id: next.budget_id,
            month: getMonthsFullName(next.month),
            year: `${next.year}`,
          }
        : null,
    );
  }, [getBudgetListSummaryRequest.data, id]);

  // Loading
  useEffect(() => {
    if (
      getBudgetRequest.isFetching ||
      createBudgetStep0Request.isFetching ||
      updateBudgetStatusRequest.isPending ||
      updateBudgetRequest.isPending ||
      createBudgetStep1Request.isPending ||
      getBudgetToCloneRequest.isFetching
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    getBudgetRequest.isFetching,
    createBudgetStep0Request.isFetching,
    updateBudgetStatusRequest.isPending,
    updateBudgetRequest.isPending,
    createBudgetStep1Request.isPending,
    getBudgetToCloneRequest.isFetching,
  ]);

  // Error
  useEffect(() => {
    if (
      getBudgetRequest.isError ||
      createBudgetStep0Request.isError ||
      updateBudgetStatusRequest.isError ||
      updateBudgetRequest.isError ||
      createBudgetStep1Request.isError ||
      getBudgetToCloneRequest.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    getBudgetRequest.isError,
    createBudgetStep0Request.isError,
    updateBudgetStatusRequest.isError,
    updateBudgetRequest.isError,
    createBudgetStep1Request.isError,
    getBudgetToCloneRequest.isError,
  ]);

  // Data successfully loaded
  useEffect(() => {
    if (getBudgetRequest.data) {
      setBreakdownRevision((revision) => revision + 1);
      setInvalidBreakdowns({});
      // datepicker
      setMonthYear({
        month: getBudgetRequest.data.month,
        year: getBudgetRequest.data.year,
      });
      // observations
      setDescriptionValue(getBudgetRequest.data.observations);

      // open
      setOpen(getBudgetRequest.data.is_open == 1);

      // initial balance
      setInitialBalance(getBudgetRequest.data.initial_balance);

      // categories
      setCategories(getBudgetRequest.data.categories);
    } else if (createBudgetStep0Request.data) {
      // open
      setOpen(true);

      // initial balance
      setInitialBalance(
        parseFloat(createBudgetStep0Request.data.initial_balance) || 0,
      );

      // categories
      setCategories(
        createBudgetStep0Request.data.categories.map((category) => ({
          ...category,
          current_amount_credit: 0,
          current_amount_debit: 0,
          planned_amount_credit: 0,
          planned_amount_debit: 0,
        })),
      );
    }
  }, [getBudgetRequest.data, createBudgetStep0Request.data]);

  // Create budget step 1 request success
  useEffect(() => {
    if (createBudgetStep1Request.data) {
      navigate(
        ROUTE_BUDGET_DETAILS.replace(
          ':id',
          createBudgetStep1Request.data.budget_id + '',
        ),
      );
    }
  }, [createBudgetStep1Request.data]);

  // Get budget to clone request success
  useEffect(() => {
    if (!getBudgetToCloneRequest.data) return;
    setInvalidBreakdowns({});
    setBreakdownRevision((revision) => revision + 1);
    setDescriptionValue(getBudgetToCloneRequest.data.observations);
    setCategories(getBudgetToCloneRequest.data.categories);
  }, [getBudgetToCloneRequest.data]);

  const goToRelatedBudget = (budgetId: bigint) => {
    navigate(ROUTE_BUDGET_DETAILS.replace(':id', budgetId + ''));
  };

  const handleCategoryClick = useCallback(
    (category: BudgetCategory, isDebit: boolean) => {
      setActionableCategory({ category, isDebit });
      setTrxTableDialogOpen(true);
    },
    [],
  );

  const createBudget = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + '',
        planned_value_debit: plannedDebit + '',
        planned_value_credit: plannedCredit + '',
        expense_items: category.expense_items,
        income_items: category.income_items,
      };
    });
    createBudgetStep1Request.mutate({
      month: monthYear.month,
      year: monthYear.year,
      observations: getDescriptionValue(),
      cat_values_arr: catValuesArr,
    });
  };

  const getBudgetUpdate = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + '',
        planned_value_debit: plannedDebit + '',
        planned_value_credit: plannedCredit + '',
        expense_items: category.expense_items,
        income_items: category.income_items,
      };
    });
    return {
      budget_id: parseFloat(id || '-1'),
      month: monthYear.month,
      year: monthYear.year,
      observations: getDescriptionValue(),
      cat_values_arr: catValuesArr,
    };
  };

  const updateBudget = () => updateBudgetRequest.mutate(getBudgetUpdate());

  useLayoutEffect(() => {
    const page = pageRef.current;
    const footer = footerRef.current;
    const main = page?.closest('main');
    if (!page || !footer || !main) return;

    const updateFooterLayout = () => {
      page.style.setProperty(
        '--budget-footer-left',
        `${main.getBoundingClientRect().left}px`,
      );
      page.style.setProperty('--budget-footer-width', `${main.clientWidth}px`);
      page.style.setProperty(
        '--budget-footer-height',
        `${footer.offsetHeight}px`,
      );
    };
    updateFooterLayout();
    const observer = new ResizeObserver(updateFooterLayout);
    observer.observe(main);
    observer.observe(footer);
    return () => observer.disconnect();
  }, [getBudgetRequest.data, createBudgetStep0Request.data]);

  const hasUnsavedChanges = () => {
    const saved = getBudgetRequest.data;
    if (!saved) return false;
    if (
      monthYear.month !== saved.month ||
      monthYear.year !== saved.year ||
      getDescriptionValue() !== saved.observations ||
      Object.values(invalidBreakdowns).some(Boolean)
    )
      return true;
    const savedCategories = new Map(
      saved.categories.map((category) => [
        String(category.category_id),
        category,
      ]),
    );
    return categories.some((category) => {
      const original = savedCategories.get(String(category.category_id));
      return (
        !original ||
        category.planned_amount_debit !== original.planned_amount_debit ||
        category.planned_amount_credit !== original.planned_amount_credit ||
        JSON.stringify(category.expense_items ?? []) !==
          JSON.stringify(original.expense_items ?? []) ||
        JSON.stringify(category.income_items ?? []) !==
          JSON.stringify(original.income_items ?? [])
      );
    });
  };

  const toggleBudgetStatus = () => {
    if (isOpen && hasUnsavedChanges()) {
      setCloseDialogOpen(true);
      return;
    }
    updateBudgetStatusRequest.mutate({
      budgetId: BigInt(id ?? -1),
      isOpen,
    });
  };

  const closeBudget = async (saveChanges: boolean) => {
    setClosingBudget(true);
    try {
      if (saveChanges) await updateBudgetRequest.mutateAsync(getBudgetUpdate());
      await updateBudgetStatusRequest.mutateAsync({
        budgetId: BigInt(id ?? -1),
        isOpen: true,
      });
      setCloseDialogOpen(false);
    } catch {
      // The request error effect reports failures; keep the dialog open to retry.
    } finally {
      setClosingBudget(false);
    }
  };

  const handleMonthChange = (newDate: Dayjs | null) => {
    if (newDate == null) return;
    setMonthYear({ month: newDate.month() + 1, year: newDate.year() });
  };

  const handleCloneBudgetClick = () => {
    setCloneBudgetDialogOpen(true);
  };

  const handleCloneBudgetSelected = (budgetId: bigint) => {
    if (budgetId == -1n) return;
    setCloneBudgetDialogOpen(false);
    setBudgetToClone(budgetId);
  };

  const updateBreakdown = useCallback(
    (
      categoryId: bigint,
      isDebit: boolean,
      items: BudgetBreakdownItem[],
      total: number,
    ) => {
      startBreakdownTransition(() => {
        setCategories((current) =>
          current.map((category) =>
            category.category_id === categoryId
              ? {
                  ...category,
                  ...(isDebit
                    ? { expense_items: items, planned_amount_debit: total }
                    : { income_items: items, planned_amount_credit: total }),
                }
              : category,
          ),
        );
      });
    },
    [],
  );

  const onCategoryPlannedAmountChange = useCallback(
    (categoryId: bigint, isDebit: boolean, value: number) => {
      setCategories((current) =>
        current.map((category) =>
          category.category_id === categoryId
            ? {
                ...category,
                planned_amount_debit: isDebit
                  ? value
                  : category.planned_amount_debit,
                planned_amount_credit: isDebit
                  ? category.planned_amount_credit
                  : value,
              }
            : category,
        ),
      );
    },
    [],
  );

  if (
    (getBudgetRequest.isLoading || !getBudgetRequest.data) &&
    (createBudgetStep0Request.isFetching || !createBudgetStep0Request.data)
  ) {
    return null;
  }

  return (
    <Paper
      ref={pageRef}
      elevation={0}
      sx={{
        px: { xs: 2, lg: 3 },
        pt: { xs: 2, lg: 3 },
        pb: 'calc(var(--budget-footer-height, 96px) + 24px)',
        mx: { xs: 0, sm: 2 },
        mt: { xs: 0, sm: 2 },
        borderRadius: 2,
        background: 'transparent',
        minHeight: 'calc(100vh - 100px)',
      }}
    >
      <Dialog
        open={closeDialogOpen}
        onClose={closingBudget ? undefined : () => setCloseDialogOpen(false)}
        aria-labelledby="close-budget-title"
        aria-describedby="close-budget-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="close-budget-title">
          {t('budgetDetails.unsavedCloseTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="close-budget-description">
            {t('budgetDetails.unsavedCloseHelp')}
          </DialogContentText>
          {Object.values(invalidBreakdowns).some(Boolean) && (
            <Typography role="alert" color="error" sx={{ mt: 2 }}>
              {t('budgetDetails.fixBreakdownsBeforeClosing')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
          <Button
            disabled={closingBudget}
            onClick={() => setCloseDialogOpen(false)}
          >
            {t('budgetDetails.keepEditing')}
          </Button>
          <Button
            disabled={closingBudget || breakdownPending}
            onClick={() => void closeBudget(false)}
          >
            {t('budgetDetails.discardAndClose')}
          </Button>
          <Button
            variant="contained"
            disabled={
              closingBudget ||
              breakdownPending ||
              Object.values(invalidBreakdowns).some(Boolean)
            }
            onClick={() => void closeBudget(true)}
          >
            {t('budgetDetails.saveAndClose')}
          </Button>
        </DialogActions>
      </Dialog>
      {isCloneBudgetDialogOpen && (
        <BudgetListSummaryDialog
          isOpen
          onClose={() => setCloneBudgetDialogOpen(false)}
          onBudgetSelected={handleCloneBudgetSelected}
        />
      )}
      {isTrxTableDialogOpen && (
        <TransactionsTableDialog
          title={t('budgetDetails.transactionsList')}
          categoryId={actionableCategory?.category.category_id || -1n}
          month={monthYear.month}
          year={monthYear.year}
          type={
            actionableCategory?.isDebit
              ? TransactionType.Expense
              : TransactionType.Income
          }
          onClose={() => {
            setTrxTableDialogOpen(false);
            setActionableCategory(null);
          }}
          isOpen
        />
      )}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#20b9dd', 0.12),
              color: '#20b9dd',
              flexShrink: 0,
            }}
          >
            <CalendarMonthOutlined sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              flexWrap="wrap"
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 23, sm: 28 },
                  fontWeight: 650,
                  lineHeight: 1.2,
                }}
              >
                {t('budgetDetails.monthlyBudget')}
              </Typography>
              <Chip
                label={t(
                  isOpen ? 'budgetDetails.opened' : 'budgetDetails.closed',
                )}
                icon={<CircleOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  height: 28,
                  borderRadius: 1.5,
                  px: 0.5,
                  border: '1px solid',
                  borderColor: isOpen ? '#26915b' : 'divider',
                  bgcolor: isOpen ? alpha('#34d77b', 0.08) : 'transparent',
                  color: isOpen ? theme.palette.success.main : 'text.secondary',
                  '& .MuiChip-icon': { color: 'inherit' },
                  fontSize: 11,
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              <Trans
                i18nKey="budgetDetails.monthlySubtitle"
                values={{
                  month: `${getMonthsFullName(monthYear.month)} ${monthYear.year}`,
                }}
                components={{
                  month: (
                    <Box
                      component="span"
                      sx={{ color: 'text.primary', fontWeight: 700 }}
                    />
                  ),
                }}
              />
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            rowGap: 1,
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 } },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 0.5,
              gap: 0.25,
              overflow: 'hidden',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              size="small"
              aria-label={t('common.previous')}
              disabled={!previousBudget}
              onClick={() =>
                previousBudget && goToRelatedBudget(previousBudget.id)
              }
              sx={{
                borderRadius: 2,
                width: 32,
                height: 32,
                p: 0,
                flexShrink: 0,
              }}
            >
              <ArrowBackIos sx={{ fontSize: 14 }} />
            </IconButton>
            <DatePicker
              views={['month', 'year']}
              onChange={handleMonthChange}
              value={dayjs(
                `${monthYear.year}-${addLeadingZero(monthYear.month)}`,
              )}
              slotProps={{
                openPickerButton: {
                  sx: { width: 32, height: 32, borderRadius: 2, p: 0, mr: 0 },
                },
                openPickerIcon: { sx: { fontSize: 20 } },
                textField: {
                  size: 'small',
                  inputProps: { 'aria-label': t('stats.month') },
                  sx: {
                    width: 148,
                    '& fieldset': { border: 0 },
                    '& input': { fontSize: 13, py: 0 },
                    '& .MuiPickersInputBase-root': {
                      fontSize: 13,
                      height: 32,
                      px: 0.5,
                      alignItems: 'center',
                    },
                    '& .MuiPickersSectionList-root': {
                      height: 32,
                      py: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1.2,
                      transform: 'translateY(1px)',
                    },
                    '& .MuiPickersOutlinedInput-notchedOutline': { border: 0 },
                  },
                },
              }}
            />
            <IconButton
              size="small"
              aria-label={t('common.next')}
              disabled={!nextBudget}
              onClick={() => nextBudget && goToRelatedBudget(nextBudget.id)}
              sx={{
                borderRadius: 2,
                width: 32,
                height: 32,
                p: 0,
                flexShrink: 0,
              }}
            >
              <ArrowForwardIos sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
          {!isNew && (
            <Button
              variant="outlined"
              size="small"
              startIcon={isOpen ? <Lock /> : <LockOpen />}
              disabled={
                updateBudgetStatusRequest.isPending ||
                closingBudget ||
                breakdownPending
              }
              onClick={toggleBudgetStatus}
              sx={{
                height: 38,
                borderRadius: 1.5,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t(
                isOpen
                  ? 'budgetDetails.closeBudgetCTA'
                  : 'budgetDetails.reopenBudget',
              )}
            </Button>
          )}
          <IconButton
            aria-label={t('budgetDetails.actions')}
            onClick={(event) => setPageMenu(event.currentTarget)}
            size="small"
          >
            <MoreHoriz />
          </IconButton>
        </Stack>
      </Stack>
      <Menu
        anchorEl={pageMenu}
        open={!!pageMenu}
        onClose={() => setPageMenu(null)}
      >
        <MenuItem
          disabled={!isOpen}
          onClick={() => {
            setPageMenu(null);
            handleCloneBudgetClick();
          }}
        >
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          {t('budgetDetails.cloneAnotherBudget')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPageMenu(null);
            navigate(ROUTE_BUDGET_MATRIX + '?anchor=' + (id || ''));
          }}
        >
          <ListItemIcon>
            <TableView fontSize="small" />
          </ListItemIcon>
          {t('budgets.matrixView')}
        </MenuItem>
      </Menu>
      <BudgetSummaryBoard
        calculatedBalances={calculatedBalances}
        isOpen={isOpen}
        initialBalance={initialBalance}
        monthLabel={`${getMonthsFullName(monthYear.month)} ${monthYear.year}`}
        description={
          <BudgetDescription ref={descriptionRef} compact readOnly={!isOpen} />
        }
      />
      <Grid container spacing={2.5} sx={{ mt: 3.5 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{ mb: 2, minHeight: 32, flexWrap: 'wrap' }}
          >
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={1.5}
              sx={{ flexWrap: 'wrap' }}
            >
              <Typography component="h2" sx={{ fontSize: 24, fontWeight: 650 }}>
                {t('common.debit')}
              </Typography>
              <Tooltip
                title={t('budgetDetails.essentialExpensesHelp')}
                describeChild
              >
                <Typography
                  component="span"
                  tabIndex={0}
                  sx={{ fontSize: 12, color: 'text.secondary', cursor: 'help' }}
                >
                  {t('budgetDetails.estimated')}:{' '}
                  {formatNumberAsCurrency.invoke(
                    calculatedBalances.plannedExpenses,
                  )}
                  {' | '}
                  {t('transactions.essential')}:{' '}
                  {formatNumberAsCurrency.invoke(
                    getBudgetRequest.data?.debit_essential_trx_total ?? 0,
                  )}
                </Typography>
              </Tooltip>
            </Stack>
            <SearchBar
              value={expenseSearch}
              onChange={setExpenseSearch}
              ariaLabel={t('budgetDetails.expenseSearch')}
              clearLabel={t('budgetDetails.clearExpenseSearch')}
              sx={{ width: { xs: '100%', sm: 210 }, ml: 'auto' }}
            />
          </Stack>

          {!debitCategories.some((category) =>
            matchesCategory(category.name, deferredExpenseSearch),
          ) && (
            <Typography
              role="status"
              sx={{ py: 2, color: 'text.secondary', fontSize: 13 }}
            >
              {t('budgetDetails.noMatchingCategories')}
            </Typography>
          )}
          <List
            disablePadding
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
          >
            {debitCategories.map((category) => (
              <React.Fragment
                key={`${id ?? 'new'}:${budgetToClone}:${category.category_id}`}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    p: 0,
                    display: matchesCategory(
                      category.name,
                      deferredExpenseSearch,
                    )
                      ? 'flex'
                      : 'none',
                  }}
                >
                  <BudgetCategoryRow
                    category={category}
                    isOpen={isOpen}
                    isDebit={true}
                    breakdownRevision={breakdownRevision}
                    onBreakdownValidityChange={setBreakdownValidity}
                    month={monthYear.month}
                    year={monthYear.year}
                    onBreakdownChange={updateBreakdown}
                    onCategoryClick={handleCategoryClick}
                    onInputChange={onCategoryPlannedAmountChange}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            useFlexGap
            sx={{ mb: 2, minHeight: 32, flexWrap: 'wrap' }}
          >
            <Typography component="h2" sx={{ fontSize: 24, fontWeight: 650 }}>
              {t('common.credit')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('budgetDetails.estimatedIncome')}:{' '}
              {formatNumberAsCurrency.invoke(calculatedBalances.plannedIncome)}
            </Typography>
            <SearchBar
              value={incomeSearch}
              onChange={setIncomeSearch}
              ariaLabel={t('budgetDetails.incomeSearch')}
              clearLabel={t('budgetDetails.clearIncomeSearch')}
              sx={{ width: { xs: '100%', sm: 210 }, ml: 'auto' }}
            />
          </Stack>

          {!creditCategories.some((category) =>
            matchesCategory(category.name, deferredIncomeSearch),
          ) && (
            <Typography
              role="status"
              sx={{ py: 2, color: 'text.secondary', fontSize: 13 }}
            >
              {t('budgetDetails.noMatchingCategories')}
            </Typography>
          )}
          <List
            disablePadding
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
          >
            {creditCategories.map((category) => (
              <React.Fragment
                key={`${id ?? 'new'}:${budgetToClone}:${category.category_id}`}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    p: 0,
                    display: matchesCategory(
                      category.name,
                      deferredIncomeSearch,
                    )
                      ? 'flex'
                      : 'none',
                  }}
                >
                  <BudgetCategoryRow
                    category={category}
                    isOpen={isOpen}
                    isDebit={false}
                    breakdownRevision={breakdownRevision}
                    onBreakdownValidityChange={setBreakdownValidity}
                    month={monthYear.month}
                    year={monthYear.year}
                    onBreakdownChange={updateBreakdown}
                    onCategoryClick={handleCategoryClick}
                    onInputChange={onCategoryPlannedAmountChange}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
      </Grid>
      <Box
        ref={footerRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr auto 1fr' },
          gap: 1,
          alignItems: 'center',
          position: 'fixed',
          bottom: 0,
          left: 'var(--budget-footer-left, 0px)',
          width: 'var(--budget-footer-width, 100%)',
          px: { xs: 2, sm: 4, lg: 5 },
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha('#0b121c', 0.75)
              : alpha(theme.palette.background.default, 0.75),
          backdropFilter: 'blur(10px)',
          zIndex: 8,
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowBackIos sx={{ fontSize: 14 }} />}
          disabled={!previousBudget}
          onClick={() => previousBudget && goToRelatedBudget(previousBudget.id)}
          sx={{
            justifySelf: 'start',
            textTransform: 'none',
            gridColumn: 1,
            gridRow: 1,
          }}
        >
          <Stack alignItems="flex-start">
            <Typography variant="caption">{t('common.previous')}</Typography>
            {previousBudget && (
              <Typography variant="body2">
                {previousBudget.month} {previousBudget.year}
              </Typography>
            )}
          </Stack>
        </Button>
        {isOpen && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<CloudUpload sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              borderRadius: 1.5,
              px: 2.5,
              gridColumn: { xs: '1 / 3', sm: 2 },
              gridRow: { xs: 2, sm: 1 },
            }}
            disabled={
              breakdownPending || Object.values(invalidBreakdowns).some(Boolean)
            }
            onClick={() => {
              isNew ? createBudget() : updateBudget();
            }}
          >
            {t(
              isNew
                ? 'budgetDetails.addBudgetCTA'
                : 'budgetDetails.updateBudget',
            )}
          </Button>
        )}
        <Button
          size="small"
          endIcon={<ArrowForwardIos sx={{ fontSize: 14 }} />}
          disabled={!nextBudget}
          onClick={() => nextBudget && goToRelatedBudget(nextBudget.id)}
          sx={{
            justifySelf: 'end',
            textTransform: 'none',
            gridColumn: { xs: 2, sm: 3 },
            gridRow: 1,
          }}
        >
          <Stack alignItems="flex-end">
            <Typography variant="caption">{t('common.next')}</Typography>
            {nextBudget && (
              <Typography variant="body2">
                {nextBudget.month} {nextBudget.year}
              </Typography>
            )}
          </Stack>
        </Button>
      </Box>
    </Paper>
  );
};

const BudgetDetails = () => {
  const { id } = useParams();
  return <BudgetDetailsScreen key={id ?? 'new'} />;
};

export default BudgetDetails;
