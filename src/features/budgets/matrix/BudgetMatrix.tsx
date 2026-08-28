import {
  Add,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Lock,
  LockOpen,
  Refresh,
  RestartAlt,
  Save,
  Search,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.tsx';
import TransactionsTableDialog from '../../../components/TransactionsTableDialog.tsx';
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
  useGetBudgetListSummary,
  useGetBudgetMatrix,
  useGetBudgetToClone,
  useUpdateBudgetDescription,
  useUpdateBudgetMatrixCell,
  useUpdateBudgetStatus,
} from '../../../services/budget/budgetHooks.ts';
import type {
  BudgetCategoryTooltipData,
  BudgetMatrixCategory,
  BudgetMatrixItem,
  BudgetMatrixResponse,
  BudgetMatrixValue,
} from '../../../services/budget/budgetServices.ts';
import CategoryIconBadge from '../../../services/category/CategoryIconBadge.tsx';
import { TransactionType } from '../../../services/trx/trxServices.ts';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import { BudgetCategoryTooltipContent } from '../details/BudgetCategoryRow.tsx';

type SummaryBudget = {
  budget_id: bigint;
  month: number;
  year: number;
};

type CellStatus = 'idle' | 'saving' | 'saved' | 'error';
type CellState = {
  status: CellStatus;
  previous: number;
  retryValue: number;
};

type TransactionCell = {
  category: BudgetMatrixCategory;
  month: number;
  year: number;
  type: TransactionType;
};

const monthKey = (month: number, year: number) =>
  year + '-' + String(month).padStart(2, '0');

const idsMatch = (
  first: bigint | number | string,
  second: bigint | number | string,
) => first.toString() === second.toString();

const getCellKey = (
  budgetId: bigint | number | string,
  categoryId: bigint | number | string,
  isExpense: boolean,
) =>
  `${budgetId.toString()}-${categoryId.toString()}-${isExpense ? 'expense' : 'income'}`;

const sortBudgets = <T extends SummaryBudget>(budgets: T[]) =>
  [...budgets].sort((a, b) => a.year - b.year || a.month - b.month);

const getDefaultBudgetIds = (budgets: SummaryBudget[]) => {
  if (budgets.length === 0) return [];
  const current = budgets.find(
    (budget) =>
      budget.month === new Date().getMonth() + 1 &&
      budget.year === new Date().getFullYear(),
  );
  const anchorBudget = current || budgets[budgets.length - 1];
  const anchorIndex = budgets.findIndex(
    (budget) => budget.budget_id === anchorBudget.budget_id,
  );
  const windowStart = Math.min(
    Math.max(0, anchorIndex - 2),
    Math.max(0, budgets.length - 5),
  );
  return budgets
    .slice(windowStart, windowStart + 5)
    .map((budget) => budget.budget_id);
};

const parseBudgetIds = (value: string | null) =>
  (value || '')
    .split(',')
    .map((item) => {
      try {
        return BigInt(item.trim());
      } catch {
        return null;
      }
    })
    .filter((item): item is bigint => item != null && item > 0n);

function CategorySearchField(props: {
  label: string;
  onQueryChange: (query: string) => void;
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => props.onQueryChange(value), 250);
    return () => window.clearTimeout(timeout);
  }, [value, props.onQueryChange]);

  return (
    <TextField
      type="search"
      size="small"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      label={props.label}
      sx={{ minWidth: 220 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}

function BudgetMatrixLoading(props: {
  title: string;
  subtitle: string;
  monthCount: number;
}) {
  const { t } = useTranslation();
  const monthCount = Math.max(1, Math.min(5, props.monthCount));
  const valueColumnCount = monthCount * 3;

  return (
    <Paper
      elevation={0}
      sx={{ p: 1.5, m: 1.5 }}
      aria-busy="true"
      aria-label={props.title}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        gap={1.5}
        mb={1.5}
      >
        <PageHeader
          compact
          title={props.title}
          subtitle={props.subtitle}
          titleChipText={t('sidebar.betaBadge')}
          titleChipTooltip={t('goals.betaAlertTitle')}
        />
        <Stack direction="row" gap={1}>
          <Skeleton variant="rounded" width={220} height={40} />
          <Skeleton variant="rounded" width={220} height={40} />
          <Skeleton variant="rounded" width={150} height={40} />
        </Stack>
      </Stack>

      <Box
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.75,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${valueColumnCount}, minmax(84px, 1fr))`,
            minWidth: 200 + valueColumnCount * 84,
            bgcolor: 'background.paper',
          }}
        >
          <Box />
          {Array.from({ length: monthCount }, (_, monthIndex) => (
            <Box
              key={`loading-month-${monthIndex}`}
              sx={{
                gridColumn: 'span 3',
                p: 1,
                borderLeft: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              <Skeleton width="42%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton width="100%" height={18} />
              <Skeleton width="88%" height={18} />
              <Skeleton width="94%" height={22} />
            </Box>
          ))}

          <Box sx={{ p: 1, bgcolor: 'action.hover' }}>
            <Skeleton width={72} height={18} />
          </Box>
          {Array.from({ length: valueColumnCount }, (_, columnIndex) => (
            <Box
              key={`loading-heading-${columnIndex}`}
              sx={{
                px: 0.75,
                py: 0.5,
                borderLeft: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <Skeleton height={18} />
            </Box>
          ))}

          {Array.from({ length: 9 }, (_, rowIndex) => (
            <Box key={`loading-row-${rowIndex}`} sx={{ display: 'contents' }}>
              <Box
                sx={{
                  px: 1,
                  height: rowIndex === 0 ? 34 : 32,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor:
                    rowIndex === 0 ? 'action.selected' : 'background.paper',
                }}
              >
                <Skeleton
                  width={rowIndex === 0 ? '48%' : `${52 + (rowIndex % 4) * 9}%`}
                />
              </Box>
              {Array.from({ length: valueColumnCount }, (_, columnIndex) => (
                <Box
                  key={`loading-cell-${rowIndex}-${columnIndex}`}
                  sx={{
                    px: 1,
                    height: rowIndex === 0 ? 34 : 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderLeft:
                      columnIndex % 3 === 0 ? '2px solid' : '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      rowIndex === 0 ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Skeleton width="62%" />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function BudgetMatrixError(props: {
  title: string;
  subtitle: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper elevation={0} sx={{ p: 3, m: 1.5 }}>
      <PageHeader
        compact
        title={props.title}
        subtitle={props.subtitle}
        titleChipText={t('sidebar.betaBadge')}
        titleChipTooltip={t('goals.betaAlertTitle')}
      />
      <Stack alignItems="flex-start" gap={1.5}>
        <Typography color="error.main">
          {t('budgetMatrix.loadFailed')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={props.onRetry}
        >
          {t('budgetMatrix.retry')}
        </Button>
      </Stack>
    </Paper>
  );
}

function MatrixCategoryTitle(props: {
  category: BudgetMatrixCategory;
  isExpense: boolean;
  referenceBudget: BudgetMatrixItem | undefined;
  referenceValues: Map<string, BudgetMatrixValue>;
  muted?: boolean;
}) {
  const { t } = useTranslation();
  const matrixValue = props.referenceValues.get(
    props.category.category_id.toString(),
  );
  const tooltipCategory = getTooltipCategory(props.category, matrixValue);

  return (
    <Tooltip
      placement="right"
      enterDelay={350}
      title={
        tooltipCategory && props.referenceBudget ? (
          <BudgetCategoryTooltipContent
            category={tooltipCategory}
            isDebit={props.isExpense}
            month={props.referenceBudget.month}
            year={props.referenceBudget.year}
            t={t}
          />
        ) : undefined
      }
    >
      <Typography
        variant="body2"
        fontSize="0.8125rem"
        noWrap
        sx={{ cursor: 'help', opacity: props.muted ? 0.48 : 1 }}
      >
        {props.category.name}
      </Typography>
    </Tooltip>
  );
}

const getTooltipCategory = (
  category: BudgetMatrixCategory,
  value: BudgetMatrixValue | undefined,
): BudgetCategoryTooltipData | undefined =>
  value
    ? {
        ...category,
        ...value.tooltip,
        planned_amount_credit: value.planned_amount_credit,
        planned_amount_debit: value.planned_amount_debit,
        current_amount_credit: value.current_amount_credit,
        current_amount_debit: value.current_amount_debit,
      }
    : undefined;

function AddMonthDialog(props: {
  open: boolean;
  initialMonth: string;
  existingMonthKeys: Set<string>;
  budgets: SummaryBudget[];
  onClose: () => void;
  onCreated: (budgetId: bigint) => void;
}) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [month, setMonth] = useState(props.initialMonth);
  const [description, setDescription] = useState('');
  const [cloneId, setCloneId] = useState('');
  const step0 = useCreateBudgetStep0();
  const clone = useGetBudgetToClone(cloneId ? BigInt(cloneId) : null);
  const create = useCreateBudgetStep1();

  useEffect(() => {
    if (props.open) {
      setMonth(props.initialMonth);
      setDescription('');
      setCloneId('');
      void step0.refetch();
    }
  }, [props.open, props.initialMonth]);

  const submit = async () => {
    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      snackbar.showSnackbar(
        t('budgetMatrix.invalidMonth'),
        AlertSeverity.ERROR,
      );
      return;
    }
    if (props.existingMonthKeys.has(monthKey(monthNumber, year))) {
      snackbar.showSnackbar(
        t('budgetMatrix.monthAlreadyExists'),
        AlertSeverity.ERROR,
      );
      return;
    }

    const source = cloneId ? clone.data : step0.data;
    if (!source) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
      return;
    }

    try {
      const response = await create.mutateAsync({
        month: monthNumber,
        year,
        observations: description,
        cat_values_arr: source.categories.map((category) => ({
          category_id: category.category_id.toString(),
          planned_value_debit: String(category.planned_amount_debit || 0),
          planned_value_credit: String(category.planned_amount_credit || 0),
        })),
      });
      props.onCreated(BigInt(response.budget_id));
      props.onClose();
    } catch {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('budgetMatrix.addMonthTitle')}</DialogTitle>
      <DialogContent>
        <Stack gap={2} pt={1}>
          <TextField
            label={t('budgetMatrix.month')}
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t('budgetMatrix.description')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('budgetMatrix.descriptionPlaceholder')}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>{t('budgetMatrix.cloneFrom')}</InputLabel>
            <Select
              value={cloneId}
              label={t('budgetMatrix.cloneFrom')}
              onChange={(event) => setCloneId(event.target.value)}
            >
              <MenuItem value="">{t('budgetMatrix.blankMonth')}</MenuItem>
              {sortBudgets(props.budgets).map((budget) => (
                <MenuItem
                  key={budget.budget_id.toString()}
                  value={budget.budget_id.toString()}
                >
                  {getMonthsFullName(budget.month)} {budget.year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {cloneId && !clone.data && <CircularProgress size={20} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t('budgetMatrix.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => void submit()}
          disabled={
            create.isPending || (cloneId ? clone.isFetching : step0.isFetching)
          }
          startIcon={
            create.isPending ? <CircularProgress size={16} /> : <Add />
          }
        >
          {t('budgetMatrix.createMonth')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BudgetMatrix() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const formatCurrency = useFormatNumberAsCurrency();
  const summaryRequest = useGetBudgetListSummary();
  const updateCell = useUpdateBudgetMatrixCell();
  const updateDescription = useUpdateBudgetDescription();
  const updateStatus = useUpdateBudgetStatus();
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<bigint[]>([]);
  const [matrix, setMatrix] = useState<BudgetMatrixResponse | null>(null);
  const [cellDrafts, setCellDrafts] = useState<Record<string, string>>({});
  const [cellStates, setCellStates] = useState<Record<string, CellState>>({});
  const [activeTransaction, setActiveTransaction] =
    useState<TransactionCell | null>(null);
  const [descriptionAnchor, setDescriptionAnchor] =
    useState<HTMLElement | null>(null);
  const [descriptionBudgetId, setDescriptionBudgetId] = useState<bigint | null>(
    null,
  );
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [addMonth, setAddMonth] = useState('');
  const [addMonthOpen, setAddMonthOpen] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(true);
  const [incomeExpanded, setIncomeExpanded] = useState(true);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [, startSectionTransition] = useTransition();
  const matrixRef = useRef<HTMLDivElement>(null);
  const ignoreBlur = useRef(new Set<string>());
  const cellRequestVersions = useRef(new Map<string, number>());
  const cellRequestChains = useRef(new Map<string, Promise<void>>());

  const chronologicalSummary = useMemo(
    () => sortBudgets((summaryRequest.data || []) as SummaryBudget[]),
    [summaryRequest.data],
  );
  const summaryById = useMemo(
    () =>
      new Map(
        chronologicalSummary.map((budget) => [
          budget.budget_id.toString(),
          budget,
        ]),
      ),
    [chronologicalSummary],
  );
  const orderedSelectedBudgetIds = useMemo(
    () =>
      selectedBudgetIds
        .filter((id) => summaryById.has(id.toString()))
        .sort((a, b) => {
          const first = summaryById.get(a.toString());
          const second = summaryById.get(b.toString());
          return first && second
            ? first.year - second.year || first.month - second.month
            : 0;
        }),
    [selectedBudgetIds, summaryById],
  );
  const matrixRequest = useGetBudgetMatrix(orderedSelectedBudgetIds);
  const selectionKey = orderedSelectedBudgetIds
    .map((id) => id.toString())
    .join(',');

  useEffect(() => {
    if (!summaryRequest.data || selectedBudgetIds.length > 0) return;
    const params = new URLSearchParams(location.search);
    const requested = parseBudgetIds(params.get('budgets')).filter((id) =>
      summaryById.has(id.toString()),
    );
    if (requested.length > 0) {
      setSelectedBudgetIds(requested.slice(0, 5));
      return;
    }
    const anchor = parseBudgetIds(params.get('anchor'))[0];
    const defaultBudgetIds = anchor
      ? (() => {
          const anchorBudget = summaryById.get(anchor.toString());
          if (!anchorBudget) return getDefaultBudgetIds(chronologicalSummary);
          const anchorIndex = chronologicalSummary.findIndex(
            (budget) => budget.budget_id === anchorBudget.budget_id,
          );
          const windowStart = Math.min(
            Math.max(0, anchorIndex - 2),
            Math.max(0, chronologicalSummary.length - 5),
          );
          return chronologicalSummary
            .slice(windowStart, windowStart + 5)
            .map((budget) => budget.budget_id);
        })()
      : getDefaultBudgetIds(chronologicalSummary);
    setSelectedBudgetIds(defaultBudgetIds);
  }, [
    summaryRequest.data,
    selectedBudgetIds.length,
    location.search,
    summaryById,
    chronologicalSummary,
  ]);

  useEffect(() => {
    setMatrix(null);
    setCellDrafts({});
    setCellStates({});
    cellRequestVersions.current.clear();
    cellRequestChains.current.clear();
  }, [selectionKey]);

  useEffect(() => {
    if (matrixRequest.data && !matrixRequest.isPlaceholderData) {
      setMatrix(matrixRequest.data);
    }
  }, [matrixRequest.data, matrixRequest.isPlaceholderData]);

  const existingMonthKeys = useMemo(
    () =>
      new Set(
        chronologicalSummary.map((budget) =>
          monthKey(budget.month, budget.year),
        ),
      ),
    [chronologicalSummary],
  );
  const allCategories = useMemo(
    () => matrix?.categories || [],
    [matrix?.categories],
  );
  const categoriesByDirection = useMemo(() => {
    const query = categoryQuery.trim().toLocaleLowerCase();
    const filteredCategories = allCategories.filter((category) => {
      if (!query) return true;
      return `${category.name} ${category.description || ''}`
        .toLocaleLowerCase()
        .includes(query);
    });

    const plannedAmounts = {
      debit: new Map<string, number>(),
      credit: new Map<string, number>(),
    };
    for (const budget of matrix?.budgets || []) {
      for (const value of budget.categories) {
        const categoryId = value.category_id.toString();
        plannedAmounts.debit.set(
          categoryId,
          (plannedAmounts.debit.get(categoryId) || 0) +
            value.planned_amount_debit,
        );
        plannedAmounts.credit.set(
          categoryId,
          (plannedAmounts.credit.get(categoryId) || 0) +
            value.planned_amount_credit,
        );
      }
    }

    const sortByPlannedAmount = (
      categories: BudgetMatrixCategory[],
      isExpense: boolean,
    ) => {
      const amounts = isExpense ? plannedAmounts.debit : plannedAmounts.credit;
      return [...categories].sort(
        (first, second) =>
          (amounts.get(second.category_id.toString()) || 0) -
            (amounts.get(first.category_id.toString()) || 0) ||
          first.name.localeCompare(second.name),
      );
    };

    return {
      expense: sortByPlannedAmount(filteredCategories, true),
      income: sortByPlannedAmount(filteredCategories, false),
    };
  }, [allCategories, categoryQuery, matrix?.budgets]);
  const visibleCategoryIds = useMemo(
    () =>
      new Set(
        categoriesByDirection.expense.map((category) =>
          category.category_id.toString(),
        ),
      ),
    [categoriesByDirection.expense],
  );
  const flatCategories = useMemo(
    () => [
      ...(expensesExpanded ? categoriesByDirection.expense : []),
      ...(incomeExpanded ? categoriesByDirection.income : []),
    ],
    [categoriesByDirection, expensesExpanded, incomeExpanded],
  );
  const categoryValuesByBudget = useMemo(() => {
    const valuesByBudget = new Map<string, Map<string, BudgetMatrixValue>>();
    for (const budget of matrix?.budgets || []) {
      valuesByBudget.set(
        budget.budget_id.toString(),
        new Map(
          budget.categories.map((value) => [
            value.category_id.toString(),
            value,
          ]),
        ),
      );
    }
    return valuesByBudget;
  }, [matrix?.budgets]);
  const referenceBudget = matrix?.budgets.at(-1);
  const referenceValues = useMemo(
    () =>
      new Map(
        (referenceBudget?.categories || []).map((value) => [
          value.category_id.toString(),
          value,
        ]),
      ),
    [referenceBudget?.categories],
  );

  const updateLocalCategory = (
    budgetId: bigint,
    categoryId: bigint,
    amount: number,
    isExpense: boolean,
  ) => {
    setMatrix((current) => {
      if (!current) return current;
      const excludedCategoryIds = new Set(
        current.categories
          .filter((category) => category.exclude_from_budgets === 1)
          .map((category) => category.category_id.toString()),
      );
      const budgets = current.budgets.map((budget) => {
        if (!idsMatch(budget.budget_id, budgetId)) return budget;
        const categories = budget.categories.map((value) =>
          idsMatch(value.category_id, categoryId)
            ? {
                ...value,
                ...(isExpense
                  ? { planned_amount_debit: amount }
                  : { planned_amount_credit: amount }),
              }
            : value,
        );
        const totals = categories.reduce(
          (total, value) => {
            if (excludedCategoryIds.has(value.category_id.toString())) {
              return total;
            }
            return {
              planned_amount_credit:
                total.planned_amount_credit + value.planned_amount_credit,
              planned_amount_debit:
                total.planned_amount_debit + value.planned_amount_debit,
              current_amount_credit:
                total.current_amount_credit + value.current_amount_credit,
              current_amount_debit:
                total.current_amount_debit + value.current_amount_debit,
            };
          },
          {
            planned_amount_credit: 0,
            planned_amount_debit: 0,
            current_amount_credit: 0,
            current_amount_debit: 0,
          },
        );
        return { ...budget, categories, totals };
      });
      return { ...current, budgets };
    });
  };

  const commitCell = async (
    budget: BudgetMatrixItem,
    category: BudgetMatrixCategory,
    isExpense: boolean,
    rawValue: string,
  ) => {
    if (!budget.is_open) return;
    const parsed = Number(rawValue.replace(',', '.'));
    if (!Number.isFinite(parsed)) {
      snackbar.showSnackbar(
        t('budgetMatrix.invalidAmount'),
        AlertSeverity.ERROR,
      );
      return;
    }
    const value = Math.round(parsed * 100) / 100;
    const key = getCellKey(budget.budget_id, category.category_id, isExpense);
    const categoryValue = categoryValuesByBudget
      .get(budget.budget_id.toString())
      ?.get(category.category_id.toString());
    const previous = categoryValue
      ? isExpense
        ? categoryValue.planned_amount_debit
        : categoryValue.planned_amount_credit
      : 0;
    const requestVersion = (cellRequestVersions.current.get(key) || 0) + 1;
    cellRequestVersions.current.set(key, requestVersion);
    setCellStates((current) => ({
      ...current,
      [key]: { status: 'saving', previous, retryValue: value },
    }));
    updateLocalCategory(
      budget.budget_id,
      category.category_id,
      value,
      isExpense,
    );
    const persist = async () => {
      try {
        await updateCell.mutateAsync({
          budget_id: budget.budget_id,
          category_id: category.category_id,
          ...(isExpense
            ? { planned_expense: value }
            : { planned_income: value }),
        });
        if (cellRequestVersions.current.get(key) !== requestVersion) return;
        setCellStates((current) => ({
          ...current,
          [key]: { status: 'saved', previous: value, retryValue: value },
        }));
        setCellDrafts((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      } catch {
        if (cellRequestVersions.current.get(key) !== requestVersion) return;
        updateLocalCategory(
          budget.budget_id,
          category.category_id,
          previous,
          isExpense,
        );
        setCellStates((current) => ({
          ...current,
          [key]: { status: 'error', previous, retryValue: value },
        }));
        snackbar.showSnackbar(
          t('budgetMatrix.saveFailed'),
          AlertSeverity.ERROR,
        );
      }
    };
    const previousRequest = cellRequestChains.current.get(key);
    const request = (previousRequest || Promise.resolve())
      .catch(() => undefined)
      .then(persist);
    cellRequestChains.current.set(key, request);
    try {
      await request;
    } finally {
      if (cellRequestChains.current.get(key) === request) {
        cellRequestChains.current.delete(key);
      }
    }
  };

  const focusCell = (row: number, column: number) => {
    const input = matrixRef.current?.querySelector(
      '[data-matrix-row=' + row + '][data-matrix-col=' + column + ']',
    ) as HTMLInputElement | null;
    input?.focus();
    input?.select();
  };

  const handleCellKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    row: number,
    column: number,
    budget: BudgetMatrixItem,
    category: BudgetMatrixCategory,
    isExpense: boolean,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.currentTarget as HTMLInputElement;
      const key = getCellKey(budget.budget_id, category.category_id, isExpense);
      ignoreBlur.current.add(key);
      void commitCell(budget, category, isExpense, input.value);
      input.blur();
      focusCell(Math.min(flatCategories.length - 1, row + 1), column);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusCell(
        Math.max(
          0,
          Math.min(
            flatCategories.length - 1,
            row + (event.key === 'ArrowDown' ? 1 : -1),
          ),
        ),
        column,
      );
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusCell(
        row,
        Math.max(
          0,
          Math.min(
            orderedSelectedBudgetIds.length - 1,
            column + (event.key === 'ArrowRight' ? 1 : -1),
          ),
        ),
      );
    }
  };

  const openDescription = (
    event: React.MouseEvent<HTMLElement>,
    budget: BudgetMatrixItem,
  ) => {
    setDescriptionAnchor(event.currentTarget);
    setDescriptionBudgetId(budget.budget_id);
    setDescriptionDraft(budget.observations);
  };

  const saveDescription = async () => {
    if (!descriptionBudgetId) return;
    try {
      await updateDescription.mutateAsync({
        budget_id: descriptionBudgetId,
        observations: descriptionDraft,
      });
      setMatrix((current) =>
        current
          ? {
              ...current,
              budgets: current.budgets.map((budget) =>
                idsMatch(budget.budget_id, descriptionBudgetId)
                  ? { ...budget, observations: descriptionDraft }
                  : budget,
              ),
            }
          : current,
      );
      setDescriptionAnchor(null);
    } catch {
      snackbar.showSnackbar(t('budgetMatrix.saveFailed'), AlertSeverity.ERROR);
    }
  };

  const toggleBudgetStatus = async (budget: BudgetMatrixItem) => {
    try {
      await updateStatus.mutateAsync({
        budgetId: budget.budget_id,
        isOpen: budget.is_open,
      });
      setMatrix((current) =>
        current
          ? {
              ...current,
              budgets: current.budgets.map((item) =>
                idsMatch(item.budget_id, budget.budget_id)
                  ? { ...item, is_open: !budget.is_open }
                  : item,
              ),
            }
          : current,
      );
    } catch {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  };

  const openAddMonth = (month: number, year: number) => {
    setAddMonth(String(year) + '-' + String(month).padStart(2, '0'));
    setAddMonthOpen(true);
  };

  const renderMonthHeader = (budget: BudgetMatrixItem) => (
    <Box
      key={budget.budget_id.toString()}
      sx={{
        gridColumn: 'span 3',
        minWidth: 0,
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        zIndex: 4,
        height: 'var(--matrix-month-header-height)',
        borderLeft: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        px={1}
        py={0.5}
        minHeight={38}
        bgcolor="action.hover"
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Stack direction="row" alignItems="center" gap={0.75} minWidth={0}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {getMonthsFullName(budget.month)} {budget.year}
          </Typography>
          <Chip
            size="small"
            color={budget.is_open ? 'success' : 'default'}
            label={
              budget.is_open ? t('budgetMatrix.open') : t('budgetMatrix.closed')
            }
            sx={{
              height: 20,
              fontSize: '0.65rem',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.25}>
          <Tooltip title={t('budgetMatrix.openDetails')} placement="top">
            <IconButton
              size="small"
              aria-label={t('budgetMatrix.openDetails')}
              onClick={() =>
                navigate(
                  ROUTE_BUDGET_DETAILS.replace(':id', budget.budget_id + ''),
                )
              }
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              budget.observations.trim() || t('budgetDetails.noDescription')
            }
            placement="top"
          >
            <IconButton
              size="small"
              aria-label={t('budgetMatrix.editDescription')}
              onClick={(event) => openDescription(event, budget)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack px={1} py={0.625} gap={0.25}>
        {[
          {
            label: t('budgetMatrix.budgetedValue'),
            value: formatCurrency.invoke(budget.totals.planned_amount_debit),
          },
          {
            label: t('budgetMatrix.actualIncome'),
            value: formatCurrency.invoke(budget.totals.current_amount_credit),
          },
          {
            label: t('budgetMatrix.balance'),
            value: formatCurrency.invoke(
              budget.totals.current_amount_credit -
                budget.totals.current_amount_debit,
            ),
            color:
              budget.totals.current_amount_credit -
                budget.totals.current_amount_debit <
              0
                ? 'error.main'
                : 'success.main',
          },
        ].map((summary, index) => (
          <Stack
            key={summary.label}
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            gap={1}
            sx={index === 2 ? { pt: 0.25, mt: 0.125 } : undefined}
          >
            <Typography variant="caption" color="text.secondary" noWrap>
              {summary.label}
            </Typography>
            <Typography
              variant={index === 2 ? 'body1' : 'caption'}
              fontWeight={700}
              color={summary.color}
              noWrap
              sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.25 }}
            >
              {summary.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );

  const renderCategoryCells = (
    category: BudgetMatrixCategory,
    row: number,
    budgetIndex: number,
    isExpense: boolean,
  ) => {
    const budget = matrix?.budgets[budgetIndex];
    if (!budget) return null;
    const value = categoryValuesByBudget
      .get(budget.budget_id.toString())
      ?.get(category.category_id.toString());
    if (!value) return null;
    const planned = isExpense
      ? value.planned_amount_debit
      : value.planned_amount_credit;
    const actual = isExpense
      ? value.current_amount_debit
      : value.current_amount_credit;
    const balance = isExpense ? planned - actual : actual - planned;
    const key = getCellKey(budget.budget_id, category.category_id, isExpense);
    const state = cellStates[key];
    const muted = category.exclude_from_budgets === 1;
    const tooltipCategory = getTooltipCategory(category, value);
    return (
      <Box
        key={key}
        sx={{
          display: 'contents',
          '& > *': { opacity: muted ? 0.48 : 1 },
        }}
      >
        <Tooltip
          placement="right"
          enterDelay={350}
          disableHoverListener
          disableTouchListener
          title={
            tooltipCategory ? (
              <BudgetCategoryTooltipContent
                category={tooltipCategory}
                isDebit={isExpense}
                month={budget.month}
                year={budget.year}
                t={t}
              />
            ) : undefined
          }
        >
          <InputBase
            value={cellDrafts[key] ?? String(planned)}
            disabled={!budget.is_open}
            onChange={(event) =>
              setCellDrafts((current) => ({
                ...current,
                [key]: event.target.value,
              }))
            }
            onBlur={(event) => {
              if (cellDrafts[key] !== undefined) {
                const keyWasCommitted = ignoreBlur.current.delete(key);
                if (keyWasCommitted) return;
                void commitCell(
                  budget,
                  category,
                  isExpense,
                  event.target.value,
                );
              }
            }}
            onKeyDown={(event) =>
              handleCellKeyDown(
                event,
                row,
                budgetIndex,
                budget,
                category,
                isExpense,
              )
            }
            inputProps={{
              'aria-label':
                category.name + ' ' + t('budgetMatrix.budgetedValue'),
              'data-matrix-row': row,
              'data-matrix-col': budgetIndex,
              inputMode: 'decimal',
            }}
            startAdornment={
              state?.status === 'saved' ? (
                <Save
                  sx={{
                    mr: 0.25,
                    fontSize: 12,
                    color: 'success.main',
                    opacity: 0.5,
                  }}
                />
              ) : null
            }
            endAdornment={
              state?.status === 'saving' ? (
                <CircularProgress size={13} />
              ) : state?.status === 'error' ? (
                <Tooltip title={t('budgetMatrix.retry')}>
                  <IconButton
                    size="small"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      void commitCell(
                        budget,
                        category,
                        isExpense,
                        String(state.retryValue),
                      )
                    }
                  >
                    <Refresh fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              ) : null
            }
            sx={{
              px: 0.5,
              minWidth: 0,
              height: 32,
              borderLeft: '2px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              fontSize: '0.8125rem',
              fontVariantNumeric: 'tabular-nums',
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focused': {
                bgcolor: 'action.selected',
                outline: '1px solid',
                outlineColor: 'primary.main',
              },
              '& input': { p: 0, textAlign: 'right' },
            }}
          />
        </Tooltip>
        <Tooltip
          title={
            <Box sx={{ textAlign: 'center' }}>
              {t('budgetMatrix.viewTransactions', {
                month: `${getMonthsFullName(budget.month)} ${budget.year}`,
              })}
            </Box>
          }
          placement="top"
          enterDelay={350}
        >
          <Button
            size="small"
            color="inherit"
            onClick={() =>
              setActiveTransaction({
                category,
                month: budget.month,
                year: budget.year,
                type: isExpense
                  ? TransactionType.Expense
                  : TransactionType.Income,
              })
            }
            sx={{
              justifyContent: 'flex-end',
              minWidth: 0,
              minHeight: 32,
              fontSize: '0.8125rem',
              fontVariantNumeric: 'tabular-nums',
              borderRadius: 0,
              borderLeft: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            {formatCurrency.invoke(actual)}
          </Button>
        </Tooltip>
        <Typography
          variant="body2"
          textAlign="right"
          pr={1}
          color={balance < 0 ? 'error.main' : 'success.main'}
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          minHeight={32}
          sx={{
            borderLeft: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontSize: '0.8125rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCurrency.invoke(balance)}
        </Typography>
      </Box>
    );
  };

  const renderSection = (
    title: string,
    categories: BudgetMatrixCategory[],
    startRow: number,
    isExpense: boolean,
    expanded: boolean,
    onToggle: () => void,
    visibleIds: Set<string>,
  ) => (
    <>
      <Box sx={{ display: 'contents' }}>
        <Button
          color="inherit"
          onClick={onToggle}
          aria-expanded={expanded}
          startIcon={expanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          sx={{
            position: 'sticky',
            left: 0,
            top: 'calc(var(--matrix-month-header-height) + var(--matrix-column-header-height))',
            zIndex: 4,
            justifyContent: 'flex-start',
            minHeight: 34,
            px: 1,
            borderRadius: 0,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            backgroundImage: (theme) =>
              `linear-gradient(${theme.palette.action.selected}, ${theme.palette.action.selected})`,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              bgcolor: 'background.paper',
              backgroundImage: (theme) =>
                `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
            },
          }}
        >
          {title}
        </Button>
        {(matrix?.budgets || []).map((budget) => {
          const planned = isExpense
            ? budget.totals.planned_amount_debit
            : budget.totals.planned_amount_credit;
          const actual = isExpense
            ? budget.totals.current_amount_debit
            : budget.totals.current_amount_credit;
          const balance = isExpense ? planned - actual : actual - planned;
          return (
            <Box
              key={`${isExpense ? 'expense' : 'income'}-${budget.budget_id.toString()}-totals`}
              sx={{ display: 'contents' }}
            >
              {[planned, actual, balance].map((amount, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  component="div"
                  fontWeight={700}
                  textAlign="right"
                  color={
                    index === 2
                      ? balance < 0
                        ? 'error.main'
                        : 'success.main'
                      : 'text.primary'
                  }
                  sx={{
                    position: 'sticky',
                    top: 'calc(var(--matrix-month-header-height) + var(--matrix-column-header-height))',
                    zIndex: 4,
                    minHeight: 34,
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid',
                    borderLeft: index === 0 ? '2px solid' : '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    borderLeftColor: 'divider',
                    bgcolor: 'background.paper',
                    backgroundImage: (theme) =>
                      `linear-gradient(${theme.palette.action.selected}, ${theme.palette.action.selected})`,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency.invoke(amount)}
                </Typography>
              ))}
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{ display: expanded ? 'contents' : 'none' }}
        aria-hidden={!expanded}
      >
        {categories.map((category, categoryIndex) => {
          const visible = visibleIds.has(category.category_id.toString());
          const row = startRow + categoryIndex;
          return (
            <Box
              key={`${isExpense ? 'expense' : 'income'}-${category.category_id.toString()}`}
              sx={{
                display: visible ? 'contents' : 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  px: 1,
                  minHeight: 32,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  minWidth={0}
                >
                  <Box
                    sx={{
                      opacity: category.exclude_from_budgets === 1 ? 0.48 : 1,
                    }}
                  >
                    <CategoryIconBadge
                      iconKey={category.icon_key}
                      colorGradient={category.color_gradient}
                      size="small"
                    />
                  </Box>
                  <MatrixCategoryTitle
                    category={category}
                    isExpense={isExpense}
                    muted={category.exclude_from_budgets === 1}
                    referenceBudget={referenceBudget}
                    referenceValues={referenceValues}
                  />
                </Stack>
              </Box>
              {orderedSelectedBudgetIds.map((_, budgetIndex) =>
                renderCategoryCells(category, row, budgetIndex, isExpense),
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );

  if (summaryRequest.isError || matrixRequest.isError) {
    return (
      <BudgetMatrixError
        title={t('budgetMatrix.title')}
        subtitle={t('budgetMatrix.strapLine')}
        onRetry={() => {
          if (summaryRequest.isError) void summaryRequest.refetch();
          if (matrixRequest.isError) void matrixRequest.refetch();
        }}
      />
    );
  }

  if (
    summaryRequest.isLoading ||
    (chronologicalSummary.length > 0 &&
      orderedSelectedBudgetIds.length === 0) ||
    (orderedSelectedBudgetIds.length > 0 && !matrix)
  ) {
    return (
      <BudgetMatrixLoading
        title={t('budgetMatrix.title')}
        subtitle={t('budgetMatrix.strapLine')}
        monthCount={orderedSelectedBudgetIds.length || 5}
      />
    );
  }

  if (chronologicalSummary.length === 0) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <PageHeader
          title={t('budgetMatrix.title')}
          subtitle={t('budgetMatrix.strapLine')}
          titleChipText={t('sidebar.betaBadge')}
          titleChipTooltip={t('goals.betaAlertTitle')}
        />
        <Typography>{t('budgetMatrix.noBudgets')}</Typography>
      </Paper>
    );
  }

  const budgets = matrix?.budgets || [];
  const lastSelectedBudget = budgets[budgets.length - 1];
  const descriptionBudget = descriptionBudgetId
    ? budgets.find((budget) => idsMatch(budget.budget_id, descriptionBudgetId))
    : undefined;
  const nextMonthToAdd = lastSelectedBudget
    ? {
        month:
          lastSelectedBudget.month === 12 ? 1 : lastSelectedBudget.month + 1,
        year:
          lastSelectedBudget.month === 12
            ? lastSelectedBudget.year + 1
            : lastSelectedBudget.year,
      }
    : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        m: 1.5,
        minWidth: 0,
        maxWidth: 'calc(100% - 24px)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        gap={1.5}
        mb={1.5}
      >
        <PageHeader
          compact
          title={t('budgetMatrix.title')}
          subtitle={t('budgetMatrix.strapLine')}
          titleChipText={t('sidebar.betaBadge')}
          titleChipTooltip={t('goals.betaAlertTitle')}
        />
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <CategorySearchField
            label={t('budgetMatrix.searchCategories')}
            onQueryChange={setCategoryQuery}
          />
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>{t('budgetMatrix.selectBudgets')}</InputLabel>
            <Select
              multiple
              value={orderedSelectedBudgetIds.map((id) => id.toString())}
              label={t('budgetMatrix.selectBudgets')}
              onChange={(event) => {
                const values =
                  typeof event.target.value === 'string'
                    ? event.target.value.split(',')
                    : event.target.value;
                if (values.length > 0 && values.length <= 5) {
                  setSelectedBudgetIds(values.map((value) => BigInt(value)));
                }
              }}
              renderValue={(values) => values.length + '/5'}
            >
              {chronologicalSummary.map((budget) => (
                <MenuItem
                  key={budget.budget_id.toString()}
                  value={budget.budget_id.toString()}
                >
                  {getMonthsFullName(budget.month)} {budget.year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title={t('budgetMatrix.resetSelection')} placement="top">
            <IconButton
              size="small"
              color="primary"
              aria-label={t('budgetMatrix.resetSelection')}
              onClick={() => {
                setSelectedBudgetIds(getDefaultBudgetIds(chronologicalSummary));
                navigate(ROUTE_BUDGET_MATRIX, { replace: true });
              }}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={!nextMonthToAdd}
            onClick={() => {
              if (nextMonthToAdd) {
                openAddMonth(nextMonthToAdd.month, nextMonthToAdd.year);
              }
            }}
          >
            {t('budgetMatrix.addMonth')}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          maxHeight: {
            xs: 'calc(100dvh - 300px)',
            md: 'calc(100dvh - 180px)',
          },
          overflow: 'auto',
          overscrollBehavior: 'contain',
          scrollbarGutter: 'stable',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.75,
        }}
      >
        <Box
          ref={matrixRef}
          sx={{
            '--matrix-month-header-height': '120px',
            '--matrix-column-header-height': '34px',
            display: 'grid',
            gridTemplateColumns: `200px repeat(${orderedSelectedBudgetIds.length * 3}, minmax(84px, 1fr))`,
            minWidth: 200 + orderedSelectedBudgetIds.length * 3 * 84,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            aria-hidden
            sx={{
              bgcolor: 'background.paper',
              position: 'sticky',
              left: 0,
              top: 0,
              zIndex: 5,
            }}
          />
          {budgets.map(renderMonthHeader)}

          <Box
            sx={{
              position: 'sticky',
              left: 0,
              top: 'var(--matrix-month-header-height)',
              zIndex: 5,
              px: 1,
              py: 0.5,
              bgcolor: 'background.paper',
              backgroundImage: (theme) =>
                `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {t('budgetMatrix.category')}
            </Typography>
          </Box>
          {budgets.map((budget) => (
            <Box
              key={budget.budget_id.toString() + '-header'}
              sx={{ display: 'contents' }}
            >
              <Box
                sx={{
                  px: 0.75,
                  py: 0.5,
                  position: 'sticky',
                  top: 'var(--matrix-month-header-height)',
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
                  borderLeft: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'right',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {t('budgetMatrix.budgetedValue')}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.5,
                  position: 'sticky',
                  top: 'var(--matrix-month-header-height)',
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
                  borderLeft: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'right',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {t('budgetMatrix.real')}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.5,
                  position: 'sticky',
                  top: 'var(--matrix-month-header-height)',
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  backgroundImage: (theme) =>
                    `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
                  borderLeft: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'right',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {t('budgetMatrix.balance')}
                </Typography>
              </Box>
            </Box>
          ))}

          {renderSection(
            t('budgetMatrix.expenses'),
            categoriesByDirection.expense,
            0,
            true,
            expensesExpanded,
            () =>
              startSectionTransition(() =>
                setExpensesExpanded((current) => !current),
              ),
            visibleCategoryIds,
          )}
          {renderSection(
            t('budgetMatrix.income'),
            categoriesByDirection.income,
            expensesExpanded ? categoriesByDirection.expense.length : 0,
            false,
            incomeExpanded,
            () =>
              startSectionTransition(() =>
                setIncomeExpanded((current) => !current),
              ),
            visibleCategoryIds,
          )}
        </Box>
      </Box>

      {activeTransaction && (
        <TransactionsTableDialog
          isOpen
          onClose={() => setActiveTransaction(null)}
          title={activeTransaction.category.name}
          categoryId={activeTransaction.category.category_id}
          type={activeTransaction.type}
          month={activeTransaction.month}
          year={activeTransaction.year}
        />
      )}
      <Popover
        open={Boolean(descriptionAnchor)}
        anchorEl={descriptionAnchor}
        onClose={() => setDescriptionAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Stack gap={1} p={2} width={320}>
          <TextField
            autoFocus
            multiline
            minRows={2}
            label={t('budgetMatrix.description')}
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
          />
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexWrap="wrap"
            gap={1}
          >
            <Button
              variant="outlined"
              color={descriptionBudget?.is_open ? 'warning' : 'success'}
              startIcon={descriptionBudget?.is_open ? <Lock /> : <LockOpen />}
              onClick={() => {
                if (descriptionBudget)
                  void toggleBudgetStatus(descriptionBudget);
              }}
              disabled={updateStatus.isPending}
            >
              {descriptionBudget?.is_open
                ? t('budgetDetails.closeBudgetCTA')
                : t('budgetDetails.reopenBudget')}
            </Button>
            <Button
              variant="contained"
              onClick={() => void saveDescription()}
              disabled={updateDescription.isPending}
            >
              {t('budgetMatrix.saveDescription')}
            </Button>
          </Stack>
        </Stack>
      </Popover>
      <AddMonthDialog
        open={addMonthOpen}
        initialMonth={addMonth}
        existingMonthKeys={existingMonthKeys}
        budgets={chronologicalSummary}
        onClose={() => setAddMonthOpen(false)}
        onCreated={(budgetId) => {
          setSelectedBudgetIds((current) => [...current, budgetId].slice(-5));
        }}
      />
    </Paper>
  );
}

export default BudgetMatrix;
