import {
  AddCircleOutline,
  CheckCircle,
  Delete,
  Edit,
  ExpandMore,
  Flag,
  Schedule,
  Search,
  Warning,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Link,
  Tooltip,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';
import PageHeader from '../../components/PageHeader.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useDeleteGoal, useGetGoals } from '../../services/goal/goalHooks.ts';
import { Goal } from '../../services/goal/goalServices.ts';
import { useFormatNumberAsCurrency } from '../../utils/textHooks.ts';
import AddEditGoalDialog from './AddEditGoalDialog.tsx';

type UiState = {
  goals?: Goal[];
  filteredGoals?: Goal[];
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
  | {
      type: StateActionType.DataLoaded;
      payload: Goal[];
    }
  | { type: StateActionType.SearchQueryUpdated; payload: string }
  | { type: StateActionType.DialogDismissed }
  | { type: StateActionType.AddClick }
  | { type: StateActionType.EditClick; payload: Goal }
  | { type: StateActionType.RemoveClick; payload: Goal };

const createInitialState = (): UiState => {
  return {
    searchQuery: '',
    isEditDialogOpen: false,
    isRemoveDialogOpen: false,
  };
};

const filterItems = (list: Goal[], searchQuery: string) => {
  return list.filter((goal) =>
    JSON.stringify(goal).toLowerCase().includes(searchQuery.toLowerCase()),
  );
};

// Helper to calculate goal sort priority for due date ordering
// Overdue first, then by nearest due date, no due date after, completed at the end
const getGoalSortPriority = (goal: Goal): number => {
  const percentage =
    goal.amount > 0
      ? Math.min(100, (goal.currently_funded_amount / goal.amount) * 100)
      : 0;
  const isComplete = percentage >= 100;

  // Completed goals go to the end
  if (isComplete) return Number.MAX_SAFE_INTEGER;

  // No due date goes after goals with due dates
  if (!goal.due_date) return Number.MAX_SAFE_INTEGER - 1;

  const now = Date.now() / 1000; // Current timestamp in seconds
  const dueDate = goal.due_date;

  // Overdue goals (negative diff) will have lower values, so they come first
  return dueDate - now;
};

// Sort goals: overdue first, then by nearest due date, no due date after, completed at end
const sortGoalsByDueDate = (goals: Goal[]): Goal[] => {
  return [...goals].sort(
    (a, b) => getGoalSortPriority(a) - getGoalSortPriority(b),
  );
};

// Sort goals for table: active first (sorted by due date), then archived
const sortGoalsForTable = (goals: Goal[]): Goal[] => {
  const activeGoals = goals.filter((g) => !g.is_archived);
  const archivedGoals = goals.filter((g) => g.is_archived);

  return [...sortGoalsByDueDate(activeGoals), ...archivedGoals];
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded:
      return {
        ...prevState,
        goals: action.payload,
        filteredGoals: filterItems(action.payload, prevState?.searchQuery),
      };
    case StateActionType.SearchQueryUpdated:
      return {
        ...prevState,
        searchQuery: action.payload,
        filteredGoals: filterItems(prevState.goals || [], action.payload),
      };
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

// Visual Goal Card Component
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

  const percentage =
    goal.amount > 0
      ? Math.min(100, (goal.currently_funded_amount / goal.amount) * 100)
      : 0;
  const isComplete = percentage >= 100;

  const formatDueDate = (timestamp: number | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const getDaysUntilDue = (timestamp: number | null) => {
    if (!timestamp) return null;
    const now = new Date();
    const dueDate = new Date(timestamp * 1000);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(goal.due_date);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon =
    daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 30;

  // Determine card accent color based on status
  const getAccentColor = () => {
    if (isComplete) return theme.palette.success.main;
    if (isOverdue) return theme.palette.error.main;
    if (isDueSoon) return theme.palette.warning.main;
    if (goal.is_underfunded) return theme.palette.warning.light;
    return theme.palette.primary.main;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        borderTop: `4px solid ${getAccentColor()}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ pb: 2 }}>
          {/* Header with Priority Badge */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mr: 1,
              }}
            >
              {goal.name}
            </Typography>
            <Chip
              icon={<Flag fontSize="small" />}
              label={goal.priority}
              size="small"
              variant="outlined"
              sx={{ minWidth: 50 }}
            />
          </Box>

          {/* Description */}
          {goal.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: 40,
              }}
            >
              {goal.description}
            </Typography>
          )}

          {/* Circular Progress with Amount */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 2,
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={100}
                thickness={4}
                sx={{
                  color: alpha(theme.palette.grey[300], 0.5),
                  position: 'absolute',
                }}
              />
              <CircularProgress
                variant="determinate"
                value={percentage}
                size={100}
                thickness={4}
                sx={{
                  color: getAccentColor(),
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                {isComplete ? (
                  <CheckCircle
                    sx={{ color: theme.palette.success.main, fontSize: 32 }}
                  />
                ) : (
                  <>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {percentage.toFixed(0)}%
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Amount Details */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 'bold' }}
            >
              {formatCurrency(goal.currently_funded_amount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('goals.of')} {formatCurrency(goal.amount)}
            </Typography>
          </Box>

          {/* Footer with Due Date and Status */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {goal.due_date ? (
              <Chip
                icon={<Schedule fontSize="small" />}
                label={formatDueDate(goal.due_date)}
                size="small"
                color={isOverdue ? 'error' : isDueSoon ? 'warning' : 'default'}
                variant={isOverdue || isDueSoon ? 'filled' : 'outlined'}
              />
            ) : (
              <Box />
            )}
            {goal.is_underfunded && !isComplete && (
              <Tooltip title={t('goals.underfundedTooltip')}>
                <Warning color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Goals = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [showArchived, setShowArchived] = useState(false);
  const getGoalsRequest = useGetGoals(!showArchived);
  const deleteGoalRequest = useDeleteGoal();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();
  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  // Loading
  useEffect(() => {
    if (getGoalsRequest.isFetching || deleteGoalRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getGoalsRequest.isFetching, deleteGoalRequest.isPending]);

  // Error
  useEffect(() => {
    if (getGoalsRequest.isError || deleteGoalRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getGoalsRequest.isError, deleteGoalRequest.isError]);

  // Success
  useEffect(() => {
    if (!getGoalsRequest.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: getGoalsRequest.data,
    });
  }, [getGoalsRequest.data]);

  const formatDueDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Goals for cards: only active (non-archived), sorted by due date
  const sortedGoalsForCards = useMemo(() => {
    if (!state?.goals) return [];
    const activeGoals = state.goals.filter((g) => !g.is_archived);
    return sortGoalsByDueDate(activeGoals);
  }, [state?.goals]);

  // Goals for table: sorted (active first by due date, then archived)
  const sortedGoalsForTable = useMemo(() => {
    if (!state?.filteredGoals) return [];
    return sortGoalsForTable(state.filteredGoals);
  }, [state?.filteredGoals]);

  const rows = useMemo(
    () =>
      sortedGoalsForTable.map((goal: Goal) => ({
        id: goal.goal_id,
        name: { name: goal.name, description: goal.description },
        priority: goal.priority,
        target: goal.amount,
        dueDate: goal.due_date,
        status: goal.is_archived,
        progress: {
          current: goal.currently_funded_amount,
          target: goal.amount,
          isUnderfunded: goal.is_underfunded,
        },
        actions: goal,
      })),
    [sortedGoalsForTable],
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('goals.name'),
      minWidth: 200,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack>
          <Typography variant="body1" color={theme.palette.text.primary}>
            {params.value.name}
          </Typography>
          {params.value.description && (
            <Typography variant="caption" color={theme.palette.text.secondary}>
              {params.value.description}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'priority',
      headerName: t('goals.priority'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'target',
      headerName: t('goals.targetAmount'),
      minWidth: 130,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body1">
          {formatNumberAsCurrency.invoke(params.value)}
        </Typography>
      ),
    },
    {
      field: 'dueDate',
      headerName: t('goals.dueDate'),
      minWidth: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">{formatDueDate(params.value)}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('goals.status'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const isArchived = params.value;
        return (
          <Chip
            label={t(isArchived ? 'goals.archived' : 'goals.active')}
            variant="outlined"
            color={isArchived ? 'warning' : 'success'}
          />
        );
      },
    },
    {
      field: 'progress',
      headerName: t('goals.progress'),
      minWidth: 200,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => {
        const percentage =
          params.value.target > 0
            ? Math.min(100, (params.value.current / params.value.target) * 100)
            : 0;
        const isComplete = percentage >= 100;
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[300],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isComplete
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}
              >
                {formatNumberAsCurrency.invoke(params.value.current)} /{' '}
                {formatNumberAsCurrency.invoke(params.value.target)} (
                {percentage.toFixed(0)}%)
              </Typography>
            </Box>
            {params.value.isUnderfunded && (
              <Tooltip title={t('goals.underfundedTooltip')}>
                <Warning color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        );
      },
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
            onClick={() =>
              dispatch({
                type: StateActionType.EditClick,
                payload: params.value,
              })
            }
          >
            <Edit fontSize="medium" color="action" />
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
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (!state) return null;
  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
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
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('goals.goals')}
          subtitle={t('goals.strapLine')}
          titleChipText={'Beta'}
        />
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          <AlertTitle>{t('goals.betaAlertTitle')}</AlertTitle>
          {t('goals.betaAlertIntro')}{' '}
          <Link
            href="https://myfinbudget.com/goto/wiki-goals"
            target="_blank"
            rel="noopener"
          >
            {t('goals.betaAlertDocText')}
          </Link>{' '}
          {t('goals.betaAlertPostDoc')}{' '}
          <Link
            href="https://myfinbudget.com/goto/gh-discussions"
            target="_blank"
            rel="noopener"
          >
            {t('goals.betaAlertContactText')}
          </Link>
          .
        </Alert>
      </Box>
      {/* Visual Goal Cards Section - Only active goals, sorted by due date */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {sortedGoalsForCards.map((goal) => (
            <Grid
              key={String(goal.goal_id)}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            >
              <GoalCard
                goal={goal}
                onClick={() =>
                  dispatch({ type: StateActionType.EditClick, payload: goal })
                }
                formatCurrency={formatNumberAsCurrency.invoke}
              />
            </Grid>
          ))}
          {/* Add New Goal Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: '100%',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${theme.palette.divider}`,
                backgroundColor: 'transparent',
                transition: 'border-color 0.2s, background-color 0.2s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <CardActionArea
                onClick={() => dispatch({ type: StateActionType.AddClick })}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AddCircleOutline
                  sx={{
                    fontSize: 48,
                    color: theme.palette.text.secondary,
                    mb: 1,
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  {t('goals.addGoalCTA')}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{t('goals.fullList')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid
              size={{ xs: 12, md: 8 }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                }
                label={t('goals.showArchived')}
              />
            </Grid>
            <Grid
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
              size={{ xs: 12, md: 4 }}
            >
              <TextField
                id="search"
                label={t('common.search')}
                variant="outlined"
                margin="dense"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  dispatch({
                    type: StateActionType.SearchQueryUpdated,
                    payload: event.target.value,
                  });
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
          </Grid>
          <Grid size={12}>
            <MyFinStaticTable
              isRefetching={getGoalsRequest.isRefetching}
              rows={rows || []}
              columns={columns}
              paginationModel={{ pageSize: 20 }}
              onRowClicked={(id) => {
                const goal = state.goals?.find((goal) => goal.goal_id == id);
                if (!goal) return;
                dispatch({ type: StateActionType.EditClick, payload: goal });
              }}
            />
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>

    /*<Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}>
      <PageHeader title={t('goals.goals')} subtitle={t('goals.strapLine')} />

      {/!* Visual Goal Cards Section *!/}
      {state.goals && state.goals.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {state.goals.map((goal) => (
              <Grid key={String(goal.goal_id)} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <GoalCard
                  goal={goal}
                  onClick={() =>
                    dispatch({ type: StateActionType.EditClick, payload: goal })
                  }
                  formatCurrency={formatNumberAsCurrency.invoke}
                />
              </Grid>
            ))}
            {/!* Add New Goal Card *!/}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${theme.palette.divider}`,
                  backgroundColor: 'transparent',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <CardActionArea
                  onClick={() => dispatch({ type: StateActionType.AddClick })}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddCircleOutline
                    sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {t('goals.addGoalCTA')}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/!* Table Section *!/}
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Grid container spacing={2}>
          {state.isEditDialogOpen && (
            <AddEditGoalDialog
              isOpen={true}
              onClose={() => dispatch({ type: StateActionType.DialogDismissed })}
              onSuccess={() => dispatch({ type: StateActionType.DialogDismissed })}
              onNegativeClick={() =>
                dispatch({ type: StateActionType.DialogDismissed })
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2 }}
              startIcon={<AddCircleOutline />}
              onClick={() => {
                dispatch({ type: StateActionType.AddClick });
              }}
            >
              {t('goals.addGoalCTA')}
            </Button>
          </Grid>
          <Grid
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
            size={{ xs: 12, md: 4 }}
          >
            <TextField
              id="search"
              label={t('common.search')}
              variant="outlined"
              margin="dense"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                dispatch({
                  type: StateActionType.SearchQueryUpdated,
                  payload: event.target.value,
                });
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
            <MyFinStaticTable
              isRefetching={getGoalsRequest.isRefetching}
              rows={rows || []}
              columns={columns}
              paginationModel={{ pageSize: 20 }}
              onRowClicked={(id) => {
                const goal = state.goals?.find((goal) => goal.goal_id == id);
                if (!goal) return;
                dispatch({ type: StateActionType.EditClick, payload: goal });
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>*/
  );
};

export default Goals;
