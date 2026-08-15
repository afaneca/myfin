import {
  AccountBalanceWallet,
  Add,
  Archive,
  CheckCircle,
  Delete,
  Edit,
  FilterList,
  MoneyOff,
  Schedule,
  Search,
  TrackChanges,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import type { GridColDef } from '@mui/x-data-grid';
import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useGetAccounts } from '../../services/account/accountHooks.ts';
import { useDeleteGoal, useGetGoals } from '../../services/goal/goalHooks.ts';
import type { Goal } from '../../services/goal/goalServices.ts';
import { useFormatNumberAsCurrency } from '../../utils/textHooks.ts';
import AddEditGoalDialog from './AddEditGoalDialog.tsx';
import { GoalPriorityChip, UnderfundedIndicator } from './GoalIndicators.tsx';

type GoalView = 'inProgress' | 'completed' | 'archived' | 'all';
type GoalSort = 'dueDate' | 'priority' | 'progress' | 'name';

type UiState = {
  goals?: Goal[];
  searchQuery: string;
  actionableGoal?: Goal;
  isEditDialogOpen: boolean;
  isRemoveDialogOpen: boolean;
};

const enum StateActionType {
  DataLoaded,
  SearchQueryUpdated,
  AddClick,
  EditClick,
  RemoveClick,
  DialogDismissed,
}

type StateAction =
  | { type: StateActionType.DataLoaded; payload: Goal[] }
  | { type: StateActionType.SearchQueryUpdated; payload: string }
  | { type: StateActionType.DialogDismissed }
  | { type: StateActionType.AddClick }
  | { type: StateActionType.EditClick; payload: Goal }
  | { type: StateActionType.RemoveClick; payload: Goal };

const createInitialState = (): UiState => ({
  searchQuery: '',
  isEditDialogOpen: false,
  isRemoveDialogOpen: false,
});

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded:
      return { ...prevState, goals: action.payload };
    case StateActionType.SearchQueryUpdated:
      return { ...prevState, searchQuery: action.payload };
    case StateActionType.DialogDismissed:
      return {
        ...prevState,
        isRemoveDialogOpen: false,
        isEditDialogOpen: false,
        actionableGoal: undefined,
      };
    case StateActionType.RemoveClick:
      return {
        ...prevState,
        isEditDialogOpen: false,
        isRemoveDialogOpen: true,
        actionableGoal: action.payload,
      };
    case StateActionType.AddClick:
      return {
        ...prevState,
        isEditDialogOpen: true,
        isRemoveDialogOpen: false,
        actionableGoal: undefined,
      };
    case StateActionType.EditClick:
      return {
        ...prevState,
        isEditDialogOpen: true,
        isRemoveDialogOpen: false,
        actionableGoal: action.payload,
      };
  }
};

const getGoalProgress = (goal: Goal) =>
  goal.amount > 0
    ? Math.min(100, (goal.currently_funded_amount / goal.amount) * 100)
    : 0;

const isGoalComplete = (goal: Goal) => getGoalProgress(goal) >= 100;

const sortGoals = (goals: Goal[], sort: GoalSort) =>
  [...goals].sort((first, second) => {
    switch (sort) {
      case 'priority':
        return second.priority - first.priority;
      case 'progress':
        return getGoalProgress(second) - getGoalProgress(first);
      case 'name':
        return first.name.localeCompare(second.name);
      case 'dueDate':
        return (
          (first.due_date || Number.MAX_SAFE_INTEGER) -
          (second.due_date || Number.MAX_SAFE_INTEGER)
        );
    }
  });

const MetricCard = ({
  icon,
  label,
  value,
  subtitle,
  accentColor,
  tooltip,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  accentColor: string;
  tooltip?: ReactNode;
}) => {
  const content = (
    <Card
      variant="outlined"
      tabIndex={tooltip ? 0 : undefined}
      sx={{
        height: '100%',
        backgroundImage: 'none',
        transition: 'border-color 0.2s, transform 0.2s',
        '&:hover': {
          borderColor: alpha(accentColor, 0.7),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: accentColor,
            backgroundColor: alpha(accentColor, 0.16),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Stack direction="row" alignItems="baseline" gap={1} minWidth={0}>
            <Typography variant="h5" fontWeight={700} noWrap>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};

const GoalCard = ({
  goal,
  onClick,
  formatCurrency,
}: {
  goal: Goal;
  onClick: () => void;
  formatCurrency: (value: number) => string;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const percentage = getGoalProgress(goal);
  const isComplete = isGoalComplete(goal);
  const daysUntilDue = goal.due_date
    ? Math.ceil((goal.due_date - Date.now() / 1000) / (60 * 60 * 24))
    : null;
  const isOverdue = !isComplete && daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon =
    !isComplete &&
    daysUntilDue !== null &&
    daysUntilDue >= 0 &&
    daysUntilDue <= 30;
  const accentColor = isComplete
    ? theme.palette.success.main
    : isOverdue
      ? theme.palette.error.main
      : goal.is_underfunded
        ? theme.palette.warning.main
        : theme.palette.primary.main;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      variant="outlined"
      role="button"
      tabIndex={0}
      aria-label={`${t('common.edit')} ${goal.name}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      sx={{
        minHeight: 210,
        height: '100%',
        cursor: 'pointer',
        backgroundImage: 'none',
        borderTop: `3px solid ${accentColor}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover, &:focus-visible': {
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[6],
          outline: 'none',
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {goal.name}
            </Typography>
            {goal.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                {goal.description}
              </Typography>
            )}
          </Box>
          <GoalPriorityChip priority={goal.priority} />
        </Stack>

        <Stack direction="row" alignItems="center" gap={2} sx={{ flex: 1 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={72}
              thickness={4}
              sx={{
                color: alpha(theme.palette.text.secondary, 0.16),
                position: 'absolute',
              }}
            />
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={72}
              thickness={4}
              sx={{
                color: accentColor,
                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {isComplete ? (
                <CheckCircle sx={{ color: 'success.main', fontSize: 30 }} />
              ) : (
                <Typography variant="subtitle2" fontWeight={700}>
                  {percentage.toFixed(0)}%
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {formatCurrency(goal.currently_funded_amount)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {t('goals.of')} {formatCurrency(goal.amount)}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ pt: 1.25, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          {goal.due_date ? (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(goal.due_date * 1000).toLocaleDateString()}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t('goals.noDueDate')}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          {goal.is_underfunded && (
            <UnderfundedIndicator
              isUnderfundedByPriority={goal.is_underfunded_by_priority}
            />
          )}
          <Chip
            size="small"
            variant="outlined"
            color={
              isComplete
                ? 'success'
                : isOverdue
                  ? 'error'
                  : isDueSoon
                    ? 'warning'
                    : 'primary'
            }
            label={t(
              isComplete
                ? 'goals.completed'
                : isOverdue
                  ? 'goals.overdue'
                  : isDueSoon
                    ? 'goals.dueSoon'
                    : 'goals.inProgress',
            )}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const Goals = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const getActiveGoalsRequest = useGetGoals(true);
  const getAllGoalsRequest = useGetGoals(false);
  const getAccountsRequest = useGetAccounts();
  const deleteGoalRequest = useDeleteGoal();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();
  const [state, dispatch] = useReducer(reduceState, null, createInitialState);
  const [goalView, setGoalView] = useState<GoalView>('inProgress');
  const [goalSort, setGoalSort] = useState<GoalSort>('dueDate');
  const [underfundedOnly, setUnderfundedOnly] = useState(false);

  useEffect(() => {
    if (
      getActiveGoalsRequest.isFetching ||
      getAllGoalsRequest.isFetching ||
      getAccountsRequest.isFetching ||
      deleteGoalRequest.isPending
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    getActiveGoalsRequest.isFetching,
    getAllGoalsRequest.isFetching,
    getAccountsRequest.isFetching,
    deleteGoalRequest.isPending,
  ]);

  useEffect(() => {
    if (
      getActiveGoalsRequest.isError ||
      getAllGoalsRequest.isError ||
      getAccountsRequest.isError ||
      deleteGoalRequest.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    getActiveGoalsRequest.isError,
    getAllGoalsRequest.isError,
    getAccountsRequest.isError,
    deleteGoalRequest.isError,
  ]);

  useEffect(() => {
    if (!getActiveGoalsRequest.data || !getAllGoalsRequest.data) return;

    const archivedGoals = getAllGoalsRequest.data.goals.filter(
      (goal) => goal.is_archived,
    );
    dispatch({
      type: StateActionType.DataLoaded,
      payload: [...getActiveGoalsRequest.data.goals, ...archivedGoals],
    });
  }, [getActiveGoalsRequest.data, getAllGoalsRequest.data]);

  const allGoals = state.goals || [];
  const inProgressGoals = useMemo(
    () => allGoals.filter((goal) => !goal.is_archived),
    [allGoals],
  );
  const completedGoals = useMemo(
    () => allGoals.filter((goal) => !goal.is_archived && isGoalComplete(goal)),
    [allGoals],
  );
  const archivedGoals = useMemo(
    () => allGoals.filter((goal) => goal.is_archived),
    [allGoals],
  );
  const underfundedGoals = useMemo(
    () => inProgressGoals.filter((goal) => goal.is_underfunded),
    [inProgressGoals],
  );
  const goalCards = useMemo(
    () =>
      [...inProgressGoals].sort((first, second) => {
        const completionOrder =
          Number(isGoalComplete(first)) - Number(isGoalComplete(second));
        if (completionOrder !== 0) return completionOrder;

        const priorityOrder = second.priority - first.priority;
        if (priorityOrder !== 0) return priorityOrder;

        return (
          (first.due_date || Number.MAX_SAFE_INTEGER) -
          (second.due_date || Number.MAX_SAFE_INTEGER)
        );
      }),
    [inProgressGoals],
  );
  const unallocatedFunding = getActiveGoalsRequest.data?.unallocated_funding;
  const accountNameLookup = useMemo(
    () =>
      new Map(
        (getAccountsRequest.data || []).map((account) => [
          Number(account.account_id),
          account.name,
        ]),
      ),
    [getAccountsRequest.data],
  );
  const unallocatedBreakdown = useMemo(() => {
    if (!unallocatedFunding?.accounts.length) {
      return t('goals.noUnallocatedFunding');
    }
    return unallocatedFunding.accounts
      .map((account) => {
        const accountName =
          accountNameLookup.get(account.account_id) ||
          t('goals.accountFallback', { id: account.account_id });
        return `${accountName}: ${formatNumberAsCurrency.invoke(account.amount)}`;
      })
      .join('\n');
  }, [unallocatedFunding, accountNameLookup, formatNumberAsCurrency, t]);

  const visibleGoals = useMemo(() => {
    const viewGoals = (() => {
      switch (goalView) {
        case 'inProgress':
          return inProgressGoals;
        case 'completed':
          return completedGoals;
        case 'archived':
          return archivedGoals;
        case 'all':
          return allGoals;
      }
    })();
    const searchQuery = state.searchQuery.trim().toLowerCase();
    return sortGoals(
      viewGoals.filter((goal) => {
        if (underfundedOnly && !goal.is_underfunded) return false;
        if (!searchQuery) return true;
        return `${goal.name} ${goal.description || ''}`
          .toLowerCase()
          .includes(searchQuery);
      }),
      goalSort,
    );
  }, [
    goalView,
    goalSort,
    underfundedOnly,
    state.searchQuery,
    allGoals,
    inProgressGoals,
    completedGoals,
    archivedGoals,
  ]);

  const rows = useMemo(
    () =>
      visibleGoals.map((goal) => ({
        id: goal.goal_id,
        name: { name: goal.name, description: goal.description },
        priority: goal.priority,
        target: goal.amount,
        dueDate: goal.due_date,
        status: {
          isArchived: goal.is_archived,
          isComplete: isGoalComplete(goal),
          isUnderfunded: goal.is_underfunded,
        },
        progress: {
          current: goal.currently_funded_amount,
          target: goal.amount,
          isUnderfunded: goal.is_underfunded,
          isUnderfundedByPriority: goal.is_underfunded_by_priority,
        },
        actions: goal,
      })),
    [visibleGoals],
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('goals.name'),
      minWidth: 210,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.value.name}
          </Typography>
          {params.value.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.value.description}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'priority',
      headerName: t('goals.priority'),
      description: t('goals.priorityHelp'),
      minWidth: 105,
      sortable: false,
      renderCell: (params) => <GoalPriorityChip priority={params.value} />,
    },
    {
      field: 'target',
      headerName: t('goals.targetAmount'),
      minWidth: 135,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatNumberAsCurrency.invoke(params.value)}
        </Typography>
      ),
    },
    {
      field: 'dueDate',
      headerName: t('goals.dueDate'),
      minWidth: 125,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value
            ? new Date(params.value * 1000).toLocaleDateString()
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('goals.status'),
      minWidth: 125,
      sortable: false,
      renderCell: (params) => {
        const status = params.value;
        const translationKey = status.isArchived
          ? 'goals.archived'
          : status.isComplete
            ? 'goals.completed'
            : status.isUnderfunded
              ? 'goals.underfunded'
              : 'goals.inProgress';
        const color = status.isArchived
          ? 'default'
          : status.isComplete
            ? 'success'
            : status.isUnderfunded
              ? 'warning'
              : 'primary';
        return (
          <Chip
            label={t(translationKey)}
            variant="outlined"
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: 'progress',
      headerName: t('goals.progress'),
      minWidth: 235,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const percentage = params.value.target
          ? Math.min(100, (params.value.current / params.value.target) * 100)
          : 0;
        const isComplete = percentage >= 100;
        return (
          <Stack direction="row" alignItems="center" gap={1} width="100%">
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                color={
                  isComplete
                    ? 'success'
                    : params.value.isUnderfunded
                      ? 'warning'
                      : 'primary'
                }
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatNumberAsCurrency.invoke(params.value.current)} /{' '}
                {formatNumberAsCurrency.invoke(params.value.target)} ·{' '}
                {percentage.toFixed(0)}%
              </Typography>
            </Box>
            {params.value.isUnderfunded && (
              <UnderfundedIndicator
                isUnderfundedByPriority={params.value.isUnderfundedByPriority}
              />
            )}
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            aria-label={t('common.edit')}
            onClick={(event) => {
              event.stopPropagation();
              dispatch({
                type: StateActionType.EditClick,
                payload: params.value,
              });
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              dispatch({
                type: StateActionType.RemoveClick,
                payload: params.value,
              });
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {state.isEditDialogOpen && (
        <AddEditGoalDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onSuccess={() => dispatch({ type: StateActionType.DialogDismissed })}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.DialogDismissed })
          }
          onDeleteClick={
            state.actionableGoal
              ? () =>
                  dispatch({
                    type: StateActionType.RemoveClick,
                    payload: state.actionableGoal!,
                  })
              : undefined
          }
          goal={state.actionableGoal}
        />
      )}
      {state.isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={true}
          onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
          onPositiveClick={() => {
            deleteGoalRequest.mutate(state.actionableGoal?.goal_id || -1n);
            dispatch({ type: StateActionType.DialogDismissed });
          }}
          onNegativeClick={() =>
            dispatch({ type: StateActionType.DialogDismissed })
          }
          titleText={t('goals.deleteGoalModalTitle', {
            name: state.actionableGoal?.name,
          })}
          descriptionText={t('goals.deleteGoalModalSubtitle')}
          alert={t('goals.deleteGoalModalAlert')}
          positiveText={t('common.delete')}
        />
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h5" fontWeight={700}>
              {t('goals.goals')}
            </Typography>
            <Tooltip title={t('goals.betaAlertTitle')}>
              <Chip
                component="a"
                href="https://myfinbudget.com/goto/wiki-goals"
                target="_blank"
                rel="noopener"
                label="Beta"
                size="small"
                color="success"
                variant="outlined"
                clickable
              />
            </Tooltip>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {t('goals.strapLine')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => dispatch({ type: StateActionType.AddClick })}
        >
          {t('goals.newGoal')}
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
          mb: 3,
        }}
      >
        <MetricCard
          icon={<TrackChanges />}
          label={t('goals.inProgress')}
          value={inProgressGoals.length}
          subtitle={t('goals.activeGoals')}
          accentColor={theme.palette.primary.main}
        />
        <MetricCard
          icon={<CheckCircle />}
          label={t('goals.completed')}
          value={completedGoals.length}
          subtitle={t('goals.currentlyCompleted')}
          accentColor={theme.palette.success.main}
        />
        <MetricCard
          icon={<MoneyOff />}
          label={t('goals.underfunded')}
          value={underfundedGoals.length}
          subtitle={t('goals.needAttention')}
          accentColor={theme.palette.warning.main}
        />
        <MetricCard
          icon={<AccountBalanceWallet />}
          label={t('goals.unallocatedFunding')}
          value={formatNumberAsCurrency.invoke(
            unallocatedFunding?.total_amount || 0,
          )}
          subtitle={t('goals.availableToAllocate')}
          accentColor={theme.palette.info.main}
          tooltip={
            <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
              {unallocatedBreakdown}
            </Box>
          }
        />
      </Box>

      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {t('goals.inProgressGoals')}
        </Typography>
        <Chip label={inProgressGoals.length} size="small" />
      </Stack>

      {goalCards.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: { xs: 'column', md: 'row' },
            gridAutoColumns: { xs: 'minmax(280px, 86vw)', md: 'auto' },
            gridTemplateColumns: {
              md: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
            overflowX: { xs: 'auto', md: 'visible' },
            pb: { xs: 1, md: 0 },
            mb: 3,
            scrollSnapType: { xs: 'x mandatory', md: 'none' },
            '& > *': { scrollSnapAlign: 'start' },
          }}
        >
          {goalCards.map((goal) => (
            <GoalCard
              key={String(goal.goal_id)}
              goal={goal}
              onClick={() =>
                dispatch({ type: StateActionType.EditClick, payload: goal })
              }
              formatCurrency={formatNumberAsCurrency.invoke}
            />
          ))}
        </Box>
      ) : (
        <Card
          variant="outlined"
          sx={{
            py: 4,
            px: 2,
            mb: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
            backgroundImage: 'none',
          }}
        >
          <TrackChanges color="disabled" sx={{ fontSize: 40, mb: 1 }} />
          <Typography fontWeight={600}>
            {t('goals.noGoalsInProgress')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('goals.createGoalPrompt')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => dispatch({ type: StateActionType.AddClick })}
          >
            {t('goals.newGoal')}
          </Button>
        </Card>
      )}

      <Card variant="outlined" sx={{ backgroundImage: 'none' }}>
        <Box
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={goalView}
            onChange={(_, value: GoalView) => setGoalView(value)}
            variant={isSmallScreen ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            aria-label={t('goals.goalViews')}
          >
            <Tab
              value="inProgress"
              label={`${t('goals.inProgress')} (${inProgressGoals.length})`}
            />
            <Tab
              value="completed"
              label={`${t('goals.completed')} (${completedGoals.length})`}
            />
            <Tab
              value="archived"
              icon={<Archive fontSize="small" />}
              iconPosition="start"
              label={`${t('goals.archived')} (${archivedGoals.length})`}
            />
            <Tab value="all" label={`${t('goals.all')} (${allGoals.length})`} />
          </Tabs>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} sx={{ p: 2 }}>
          <Button
            variant={underfundedOnly ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setUnderfundedOnly((current) => !current)}
            aria-pressed={underfundedOnly}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('goals.underfundedOnly')}
          </Button>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="goal-sort-label">{t('goals.sortBy')}</InputLabel>
            <Select
              labelId="goal-sort-label"
              value={goalSort}
              label={t('goals.sortBy')}
              onChange={(event) => setGoalSort(event.target.value as GoalSort)}
            >
              <MenuItem value="dueDate">{t('goals.dueDate')}</MenuItem>
              <MenuItem value="priority">{t('goals.priority')}</MenuItem>
              <MenuItem value="progress">{t('goals.progress')}</MenuItem>
              <MenuItem value="name">{t('goals.name')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={state.searchQuery}
            placeholder={t('goals.searchGoals')}
            onChange={(event) =>
              dispatch({
                type: StateActionType.SearchQueryUpdated,
                payload: event.target.value,
              })
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ ml: { md: 'auto' }, minWidth: { md: 260 } }}
          />
        </Stack>

        <Box sx={{ px: { xs: 0, sm: 1 }, pb: 1 }}>
          <MyFinStaticTable
            isRefetching={
              getActiveGoalsRequest.isRefetching ||
              getAllGoalsRequest.isRefetching
            }
            rows={rows}
            columns={columns}
            paginationModel={{ pageSize: 20 }}
            onRowClicked={(id) => {
              const goal = allGoals.find((item) => item.goal_id === id);
              if (!goal) return;
              dispatch({ type: StateActionType.EditClick, payload: goal });
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Goals;
