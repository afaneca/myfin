import {
  AccountBalance,
  AcUnit,
  Add,
  Delete,
  Description,
  ExpandMore,
  Flag,
  PlayArrow,
  Send,
  Undo,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Checkbox,
  DialogContent,
  FormControlLabel,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useReducer } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import CurrencyIcon from '../../components/CurrencyIcon.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useGetAccounts } from '../../services/account/accountHooks.ts';
import { Account } from '../../services/auth/authServices.ts';
import { useCreateGoal, useUpdateGoal } from '../../services/goal/goalHooks.ts';
import { Goal } from '../../services/goal/goalServices.ts';
import { useFormatNumberAsCurrency } from '../../utils/textHooks.ts';

type AccountOption = {
  id: number;
  label: string;
  balance: number;
};

type FundingAccountInput = {
  account: AccountOption | null;
  funding_type: 'absolute' | 'relative';
  funding_amount: number | '';
};

type UiState = {
  isLoading: boolean;
  nameInput: string;
  descriptionInput: string;
  priorityInput: number | '';
  amountInput: number | '';
  isArchivedInput: boolean;
  hasDueDate: boolean;
  dueDateInput: Dayjs | null;
  fundingAccounts: FundingAccountInput[];
  accounts?: Account[];
};

const enum StateActionType {
  RequestStarted,
  RequestSuccess,
  RequestError,
  NameUpdated,
  DescriptionUpdated,
  PriorityUpdated,
  AmountUpdated,
  IsArchivedUpdated,
  HasDueDateToggled,
  DueDateUpdated,
  AccountsLoaded,
  AddFundingAccount,
  RemoveFundingAccount,
  UpdateFundingAccount,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestSuccess }
  | { type: StateActionType.RequestError }
  | { type: StateActionType.NameUpdated; payload: string }
  | { type: StateActionType.DescriptionUpdated; payload: string }
  | { type: StateActionType.PriorityUpdated; payload: number | '' }
  | { type: StateActionType.AmountUpdated; payload: number | '' }
  | { type: StateActionType.IsArchivedUpdated; payload: boolean }
  | { type: StateActionType.HasDueDateToggled; payload: boolean }
  | { type: StateActionType.DueDateUpdated; payload: Dayjs | null }
  | { type: StateActionType.AccountsLoaded; payload: Account[] }
  | { type: StateActionType.AddFundingAccount }
  | { type: StateActionType.RemoveFundingAccount; payload: number }
  | {
      type: StateActionType.UpdateFundingAccount;
      payload: {
        index: number;
        field: keyof FundingAccountInput;
        value: unknown;
      };
    };

const createInitialState = (args: { goal: Goal | undefined }): UiState => {
  const hasDueDate = args.goal?.due_date != null;

  return {
    isLoading: false,
    nameInput: args.goal?.name ?? '',
    descriptionInput: args.goal?.description ?? '',
    priorityInput: args.goal?.priority ?? 1,
    amountInput: args.goal?.amount ?? '',
    isArchivedInput: args.goal?.is_archived ?? false,
    hasDueDate: hasDueDate,
    dueDateInput: hasDueDate ? dayjs.unix(args.goal!.due_date!) : null,
    fundingAccounts:
      args.goal?.funding_accounts.map(
        (fa) =>
          ({
            account: null, // Will be populated when accounts load
            funding_type: fa.funding_type,
            funding_amount: fa.funding_amount,
            _account_id: fa.account_id, // Temporary storage for initial load
          }) as FundingAccountInput & { _account_id?: number },
      ) ?? [],
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return { ...prevState, isLoading: true };
    case StateActionType.RequestSuccess:
    case StateActionType.RequestError:
      return { ...prevState, isLoading: false };
    case StateActionType.NameUpdated:
      return { ...prevState, nameInput: action.payload };
    case StateActionType.DescriptionUpdated:
      return { ...prevState, descriptionInput: action.payload };
    case StateActionType.PriorityUpdated:
      return { ...prevState, priorityInput: action.payload };
    case StateActionType.AmountUpdated:
      return { ...prevState, amountInput: action.payload };
    case StateActionType.IsArchivedUpdated:
      return { ...prevState, isArchivedInput: action.payload };
    case StateActionType.HasDueDateToggled:
      return {
        ...prevState,
        hasDueDate: action.payload,
        dueDateInput: action.payload ? dayjs() : null,
      };
    case StateActionType.DueDateUpdated:
      return { ...prevState, dueDateInput: action.payload };
    case StateActionType.AccountsLoaded: {
      // Populate funding account options when accounts load
      const accountOptions = action.payload.map((acc) => ({
        id: Number(acc.account_id),
        label: acc.name,
        balance: acc.balance,
      }));
      // Update funding accounts with proper account objects
      const updatedFundingAccounts = prevState.fundingAccounts.map((fa) => {
        const faWithId = fa as FundingAccountInput & { _account_id?: number };
        if (faWithId._account_id != null) {
          const account = accountOptions.find(
            (a) => a.id === faWithId._account_id,
          );
          return {
            account: account || null,
            funding_type: fa.funding_type,
            funding_amount: fa.funding_amount,
          };
        }
        return fa;
      });
      return {
        ...prevState,
        accounts: action.payload,
        fundingAccounts: updatedFundingAccounts,
      };
    }
    case StateActionType.AddFundingAccount:
      return {
        ...prevState,
        fundingAccounts: [
          ...prevState.fundingAccounts,
          { account: null, funding_type: 'absolute', funding_amount: '' },
        ],
      };
    case StateActionType.RemoveFundingAccount:
      return {
        ...prevState,
        fundingAccounts: prevState.fundingAccounts.filter(
          (_, i) => i !== action.payload,
        ),
      };
    case StateActionType.UpdateFundingAccount: {
      const { index, field, value } = action.payload;
      const updated = [...prevState.fundingAccounts];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill 100% when switching to relative (percentage) type
      if (field === 'funding_type' && value === 'relative') {
        updated[index].funding_amount = 100;
      }

      return { ...prevState, fundingAccounts: updated };
    }
  }
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNegativeClick: () => void;
  onDeleteClick?: () => void;
  goal: Goal | undefined;
};

const AddEditGoalDialog = (props: Props) => {
  const isEditForm = props.goal !== undefined;

  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

  const createGoalRequest = useCreateGoal();
  const updateGoalRequest = useUpdateGoal();
  const getAccountsRequest = useGetAccounts();

  const [state, dispatch] = useReducer(
    reduceState,
    { goal: props.goal },
    createInitialState,
  );

  // Build account options for Autocomplete
  const accountOptions: AccountOption[] = useMemo(() => {
    return (
      state.accounts?.map((acc) => ({
        id: Number(acc.account_id),
        label: acc.name,
        balance: acc.balance,
      })) ?? []
    );
  }, [state.accounts]);

  // Validation helper for funding accounts
  const validateFundingAccount = (
    fa: FundingAccountInput,
    goalAmount: number,
  ): string | null => {
    if (fa.account == null || fa.funding_amount === '') return null;

    const amount = fa.funding_amount as number;

    if (fa.funding_type === 'relative') {
      if (amount < 0 || amount > 100) {
        return t('goals.percentageMustBeBetween0And100');
      }
    } else {
      if (amount < 0) {
        return t('goals.amountMustBePositive');
      }
      if (amount > goalAmount) {
        return t('goals.amountCannotExceedGoal');
      }
    }
    return null;
  };

  // Form validity check
  const isFormValid = useMemo(() => {
    // Required fields
    if (!state.nameInput.trim()) return false;
    if (!state.amountInput || state.amountInput <= 0) return false;
    if (!state.priorityInput || state.priorityInput < 1) return false;

    // Due date validity (if enabled)
    if (state.hasDueDate && !state.dueDateInput?.isValid()) return false;

    // Funding accounts validation
    const goalAmount = state.amountInput as number;
    for (const fa of state.fundingAccounts) {
      // If account is selected, amount must be valid
      if (fa.account != null) {
        if (fa.funding_amount === '' || fa.funding_amount <= 0) return false;
        const error = validateFundingAccount(fa, goalAmount);
        if (error) return false;
      }
    }

    return true;
  }, [state]);

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading]);

  // Accounts loaded
  useEffect(() => {
    if (getAccountsRequest.data) {
      dispatch({
        type: StateActionType.AccountsLoaded,
        payload: getAccountsRequest.data,
      });
    }
  }, [getAccountsRequest.data]);

  // Error
  useEffect(() => {
    if (createGoalRequest.isError || updateGoalRequest.isError) {
      dispatch({ type: StateActionType.RequestError });
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [createGoalRequest.isError, updateGoalRequest.isError]);

  // Success
  useEffect(() => {
    if (!createGoalRequest.data && !updateGoalRequest.data) return;
    dispatch({ type: StateActionType.RequestSuccess });
    setTimeout(() => {
      props.onSuccess();
    }, 0);
  }, [createGoalRequest.data, updateGoalRequest.data]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      snackbar.showSnackbar(
        t('common.fillAllFieldsTryAgain'),
        AlertSeverity.ERROR,
      );
      return;
    }

    const dueDateTimestamp =
      state.hasDueDate && state.dueDateInput ? state.dueDateInput.unix() : null;

    const fundingAccounts = state.fundingAccounts
      .filter((fa) => fa.account != null && fa.funding_amount !== '')
      .map((fa) => ({
        account_id: fa.account!.id,
        funding_type: fa.funding_type,
        funding_amount: fa.funding_amount as number,
      }));

    dispatch({ type: StateActionType.RequestStarted });

    if (isEditForm && props.goal) {
      updateGoalRequest.mutate({
        goalId: props.goal.goal_id,
        request: {
          name: state.nameInput,
          description: state.descriptionInput,
          priority: state.priorityInput as number,
          amount: state.amountInput as number,
          due_date: dueDateTimestamp,
          is_archived: state.isArchivedInput,
          funding_accounts: fundingAccounts,
        },
      });
    } else {
      createGoalRequest.mutate({
        name: state.nameInput,
        description: state.descriptionInput,
        priority: state.priorityInput as number,
        amount: state.amountInput as number,
        due_date: dueDateTimestamp,
        funding_accounts: fundingAccounts,
      });
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        },
      }}
    >
      <DialogTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Trans
              i18nKey={
                isEditForm
                  ? 'goals.editGoalModalTitle'
                  : 'goals.addGoalModalTitle'
              }
              values={{ name: props.goal?.name }}
            />
          </Grid>
          <Grid
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={2}
            size={{ xs: 12, md: 6 }}
          >
            {isEditForm && (
              <ToggleButtonGroup
                exclusive
                value={state.isArchivedInput ? 'archived' : 'active'}
                onChange={(_, newValue) => {
                  if (newValue !== null) {
                    dispatch({
                      type: StateActionType.IsArchivedUpdated,
                      payload: newValue === 'archived',
                    });
                  }
                }}
                color="primary"
              >
                <ToggleButton value="active">
                  <Stack direction="row" spacing={1}>
                    <PlayArrow />
                    <Typography variant="body2">{t('goals.active')}</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="archived">
                  <Stack direction="row" spacing={1}>
                    <AcUnit />
                    <Typography variant="body2">
                      {t('goals.archived')}
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Name */}
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              required
              fullWidth
              margin="dense"
              id="name"
              label={t('goals.name')}
              value={state.nameInput}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.NameUpdated,
                  payload: e.target.value,
                })
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Flag />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Amount */}
          <Grid size={{ xs: 12, md: 3 }}>
            <NumericFormat
              required
              fullWidth
              id="amount"
              name="amount"
              label={t('goals.targetAmount')}
              value={state.amountInput}
              variant="outlined"
              margin="dense"
              customInput={TextField}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator
              onFocus={(event) => {
                event.target.select();
              }}
              onValueChange={(values) => {
                const { floatValue } = values;
                dispatch({
                  type: StateActionType.AmountUpdated,
                  payload: floatValue ?? 0,
                });
              }}
              slotProps={{
                htmlInput: {
                  step: 0.01,
                  min: 0,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              required
              id="priority"
              type="number"
              margin="dense"
              label={t('goals.priority')}
              value={state.priorityInput}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.PriorityUpdated,
                  payload: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                },
              }}
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              margin="dense"
              id="description"
              label={t('goals.description')}
              value={state.descriptionInput}
              onChange={(e) =>
                dispatch({
                  type: StateActionType.DescriptionUpdated,
                  payload: e.target.value,
                })
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Due Date Toggle + Picker */}
          <Grid size={{ xs: 12, md: 3 }} display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.hasDueDate}
                  onChange={(e) =>
                    dispatch({
                      type: StateActionType.HasDueDateToggled,
                      payload: e.target.checked,
                    })
                  }
                />
              }
              label={t('goals.setDueDate')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            {state.hasDueDate && (
              <DatePicker
                label={t('goals.dueDate')}
                value={state.dueDateInput}
                onChange={(newValue) =>
                  dispatch({
                    type: StateActionType.DueDateUpdated,
                    payload: newValue,
                  })
                }
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    required: true,
                    fullWidth: true,
                    margin: 'dense',
                  },
                  inputAdornment: {
                    position: 'start',
                  },
                }}
              />
            )}
          </Grid>
          {/* Funding Accounts Section - Accordion */}
          <Grid size={12}>
            <Accordion defaultExpanded={state.fundingAccounts.length > 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Grid container size={12}>
                  <Grid size={6}>
                    <Typography>{t('goals.fundingAccounts')}</Typography>
                  </Grid>
                  <Grid>
                    <Typography sx={{ color: 'text.secondary' }}>
                      {t('goals.fundingAccountsDescription')}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {state.fundingAccounts.length === 0 && (
                    <Grid size={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 2 }}
                      >
                        {t('goals.noFundingAccounts')}
                      </Typography>
                    </Grid>
                  )}

                  {state.fundingAccounts.map((fa, index) => {
                    const goalAmount = (state.amountInput as number) || 0;
                    const error = validateFundingAccount(fa, goalAmount);
                    return (
                      <Grid size={12} key={index}>
                        <Grid container spacing={2} alignItems="center">
                          {/* Account Autocomplete */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Autocomplete
                              id={`account-${index}`}
                              options={accountOptions}
                              value={fa.account}
                              onChange={(_event, value) =>
                                dispatch({
                                  type: StateActionType.UpdateFundingAccount,
                                  payload: {
                                    index,
                                    field: 'account',
                                    value: value,
                                  },
                                })
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              getOptionLabel={(option) =>
                                `${option.label} (${formatNumberAsCurrency.invoke(option.balance)})`
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  margin="dense"
                                  label={t('common.account')}
                                  helperText=" "
                                  slotProps={{
                                    input: {
                                      ...params.InputProps,
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AccountBalance />
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                />
                              )}
                            />
                          </Grid>

                          {/* Funding Type */}
                          <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth margin="dense">
                              <InputLabel id={`type-label-${index}`}>
                                {t('goals.fundingType')}
                              </InputLabel>
                              <Select
                                labelId={`type-label-${index}`}
                                value={fa.funding_type}
                                label={t('goals.fundingType')}
                                margin="dense"
                                onChange={(e) =>
                                  dispatch({
                                    type: StateActionType.UpdateFundingAccount,
                                    payload: {
                                      index,
                                      field: 'funding_type',
                                      value: e.target.value,
                                    },
                                  })
                                }
                              >
                                <MenuItem value="absolute">
                                  {t('goals.fundingTypeAbsolute')}
                                </MenuItem>
                                <MenuItem value="relative">
                                  {t('goals.fundingTypeRelative')}
                                </MenuItem>
                              </Select>
                              <FormHelperText> </FormHelperText>
                            </FormControl>
                          </Grid>

                          {/* Funding Amount */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <NumericFormat
                              required
                              id="funding_amount"
                              name="funding_amount"
                              fullWidth
                              margin="dense"
                              error={!!error}
                              helperText={error || ' '}
                              label={
                                fa.funding_type === 'absolute'
                                  ? t('goals.fundingAmount')
                                  : t('goals.fundingPercentage')
                              }
                              customInput={TextField}
                              variant="outlined"
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              value={fa.funding_amount}
                              slotProps={{
                                htmlInput: {
                                  step: 0.01,
                                },
                              }}
                              onValueChange={(values) => {
                                const { floatValue } = values;
                                dispatch({
                                  type: StateActionType.UpdateFundingAccount,
                                  payload: {
                                    index,
                                    field: 'funding_amount',
                                    value: Number(floatValue ?? 0),
                                  },
                                });
                              }}
                              onFocus={(event) => {
                                event.target.select();
                              }}
                            />
                          </Grid>

                          {/* Delete Button */}
                          <Grid
                            size={{ xs: 12, md: 1 }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              pb: '22px',
                            }}
                          >
                            <IconButton
                              color="error"
                              onClick={() =>
                                dispatch({
                                  type: StateActionType.RemoveFundingAccount,
                                  payload: index,
                                })
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })}

                  {/* Add Account Button - at bottom */}
                  <Grid size={12} display="flex" justifyContent="flex-start">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() =>
                        dispatch({ type: StateActionType.AddFundingAccount })
                      }
                    >
                      {t('goals.addFundingAccount')}
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          pr: 3,
          pb: 2,
          justifyContent: isEditForm ? 'space-between' : 'flex-end',
        }}
      >
        {isEditForm && props.onDeleteClick && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Delete />}
            onClick={props.onDeleteClick}
          >
            {t('goals.deleteGoal')}
          </Button>
        )}
        <div>
          <Button
            variant="outlined"
            startIcon={<Undo />}
            onClick={props.onNegativeClick}
            sx={{ mr: 1 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            type="submit"
            startIcon={<Send />}
            disabled={!isFormValid}
          >
            {isEditForm ? t('common.update') : t('common.add')}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditGoalDialog;
