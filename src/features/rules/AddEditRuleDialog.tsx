import {
  Rule,
  RuleMatchingOperatorType,
} from '../../services/rule/ruleServices.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useAddRule, useEditRule } from '../../services/rule/ruleHooks.tsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Send, Undo } from '@mui/icons-material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Entity, TransactionType } from '../../services/trx/trxServices.ts';
import { Account } from '../../services/auth/authServices.ts';
import { Category } from '../../services/category/categoryServices.ts';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  rule: Rule | null;
  accounts: Account[];
  categories: Category[];
  entities: Entity[];
};

export type MatchingOperatorOption = {
  id: string;
  label: string;
};

const AddEditRuleDialog = (props: Props) => {
  const isEditForm = props.rule !== null;

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const addRuleRequest = useAddRule();
  const editRuleRequest = useEditRule();

  const [rule, setRule] = useState<Partial<Rule>>(
    props?.rule || {
      matcher_description_operator: RuleMatchingOperatorType.Ignore,
      matcher_type_operator: RuleMatchingOperatorType.Ignore,
      matcher_account_from_id_operator: RuleMatchingOperatorType.Ignore,
      matcher_account_to_id_operator: RuleMatchingOperatorType.Ignore,
      matcher_amount_operator: RuleMatchingOperatorType.Ignore,
    },
  );

  const operatorOptions = useRef<MatchingOperatorOption[]>([
    { id: RuleMatchingOperatorType.Ignore, label: t('rules.ignore') },
    {
      id: RuleMatchingOperatorType.NotContains,
      label: t('rules.doesNotContain'),
    },
    { id: RuleMatchingOperatorType.Contains, label: t('rules.contains') },
    { id: RuleMatchingOperatorType.Equals, label: t('rules.equals') },
    { id: RuleMatchingOperatorType.NotEquals, label: t('rules.notEquals') },
  ]);
  const binaryOperatorOptions = useRef<MatchingOperatorOption[]>([
    { id: RuleMatchingOperatorType.Ignore, label: t('rules.ignore') },
    { id: RuleMatchingOperatorType.Equals, label: t('rules.equals') },
    { id: RuleMatchingOperatorType.NotEquals, label: t('rules.notEquals') },
  ]);
  const typeOptions = useRef<MatchingOperatorOption[]>([
    { id: TransactionType.Expense, label: t('transactions.expense') },
    { id: TransactionType.Income, label: t('transactions.income') },
    { id: TransactionType.Transfer, label: t('transactions.transfer') },
  ]);

  const ignoreOption = { id: -1n, label: t('common.ignore') };

  // Loading
  useEffect(() => {
    if (addRuleRequest.isPending || editRuleRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addRuleRequest.isPending, editRuleRequest.isPending]);

  // Error
  useEffect(() => {
    if (addRuleRequest.isError || editRuleRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addRuleRequest.isError, editRuleRequest.isError]);

  // Success
  useEffect(() => {
    if (addRuleRequest.isSuccess || editRuleRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [addRuleRequest.isSuccess, editRuleRequest.isSuccess]);

  const updateRule = useCallback(
    (updates: Partial<Rule>) => {
      setRule((prevRule) => {
        if (prevRule === null) {
          // If the previous rule was null, create a new rule object
          return { ...updates } as Rule;
        } else {
          // If there was a previous rule, merge it with the updates
          return { ...prevRule, ...updates };
        }
      });
    },
    [setRule],
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!rule) return;
            if (isEditForm) {
              if (rule.rule_id) {
                // Update
                editRuleRequest.mutate(rule as Rule);
              } else {
                // Create
                addRuleRequest.mutate(rule);
              }
            } else {
              // Create
              addRuleRequest.mutate(rule);
            }
          },
        },
      }}
    >
      <DialogTitle>
        <Trans i18nKey={isEditForm ? 'rules.updateRule' : 'rules.addRule'} />
      </DialogTitle>
      <DialogContent>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container size={12}>
              <Grid spacing={1} size={6}>
                <Typography>{t('rules.conditions')}</Typography>
              </Grid>
              <Grid>
                <Typography sx={{ color: 'text.secondary' }}>
                  {t('rules.conditionsDescription')}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} size={12}>
              {/* Description */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  id="description-select"
                  value={
                    rule?.matcher_description_operator ||
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_description_operator: event.target.value,
                    })
                  }
                  label={t('rules.operator')}
                >
                  {operatorOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 9,
                }}
              >
                <TextField
                  margin="dense"
                  id="description-condition"
                  name="description-condition"
                  disabled={
                    rule?.matcher_description_operator ==
                    RuleMatchingOperatorType.Ignore
                  }
                  required={
                    rule?.matcher_description_operator !=
                    RuleMatchingOperatorType.Ignore
                  }
                  value={rule?.matcher_description_value || ''}
                  onChange={(e) =>
                    updateRule({ matcher_description_value: e.target.value })
                  }
                  label={t('common.description')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              {/* Amount */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  id="amount-select"
                  value={
                    rule?.matcher_amount_operator ||
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_amount_operator: event.target.value,
                    })
                  }
                  label={t('rules.operator')}
                >
                  {operatorOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 9,
                }}
              >
                <TextField
                  margin="dense"
                  id="amount-condition"
                  name="amount-condition"
                  type="number"
                  inputProps={{
                    step: 0.01,
                  }}
                  disabled={
                    rule?.matcher_amount_operator ==
                    RuleMatchingOperatorType.Ignore
                  }
                  required={
                    rule?.matcher_amount_operator !=
                    RuleMatchingOperatorType.Ignore
                  }
                  value={rule?.matcher_amount_value || ''}
                  onChange={(e) =>
                    updateRule({ matcher_amount_value: e.target.value })
                  }
                  label={t('common.amount')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              {/* Type */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  id="type-select"
                  value={
                    rule?.matcher_type_operator ||
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_type_operator: event.target.value,
                    })
                  }
                  label={t('rules.operator')}
                >
                  {binaryOperatorOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 9,
                }}
              >
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  id="type-condition"
                  name="type-condition"
                  value={rule?.matcher_type_value || ''}
                  disabled={
                    rule?.matcher_type_operator ==
                    RuleMatchingOperatorType.Ignore
                  }
                  required={
                    rule?.matcher_type_operator !=
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_type_value: event.target.value,
                    })
                  }
                  label={t('common.type')}
                >
                  {typeOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* Account from */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  id="account-from-select"
                  value={
                    rule?.matcher_account_from_id_operator ||
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_account_from_id_operator: event.target.value,
                    })
                  }
                  label={t('rules.operator')}
                >
                  {binaryOperatorOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 9,
                }}
              >
                <Autocomplete
                  fullWidth
                  id="account-from-condition"
                  options={props.accounts}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.accounts.find(
                      (account) =>
                        account.account_id ===
                        rule?.matcher_account_from_id_value,
                    ) || null
                  }
                  disabled={
                    rule?.matcher_account_from_id_operator ==
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      matcher_account_from_id_value: value?.account_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.account_id === value.account_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('transactions.originAccount')}
                      required={
                        rule?.matcher_account_from_id_operator !=
                        RuleMatchingOperatorType.Ignore
                      }
                    />
                  )}
                />
              </Grid>
              {/* Account to */}
              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  fullWidth
                  select
                  margin="dense"
                  id="account-to-select"
                  value={
                    rule?.matcher_account_to_id_operator ||
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(event) =>
                    updateRule({
                      matcher_account_to_id_operator: event.target.value,
                    })
                  }
                  label={t('rules.operator')}
                >
                  {binaryOperatorOptions.current.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 9,
                }}
              >
                <Autocomplete
                  fullWidth
                  id="account-to-condition"
                  options={props.accounts}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.accounts.find(
                      (account) =>
                        account.account_id ===
                        rule?.matcher_account_to_id_value,
                    ) || null
                  }
                  disabled={
                    rule?.matcher_account_to_id_operator ==
                    RuleMatchingOperatorType.Ignore
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      matcher_account_to_id_value: value?.account_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.account_id === value.account_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('transactions.destinationAccount')}
                      required={
                        rule?.matcher_account_to_id_operator !=
                        RuleMatchingOperatorType.Ignore
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container size={12}>
              <Grid spacing={1} size={6}>
                <Typography>{t('rules.result')}</Typography>
              </Grid>
              <Grid>
                <Typography sx={{ color: 'text.secondary' }}>
                  {t('rules.resultDescription')}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} size={12}>
              {/* Category */}
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  id="category-result"
                  options={[
                    {
                      category_id: ignoreOption.id,
                      name: ignoreOption.label,
                    },
                    ...props.categories,
                  ]}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.categories.find(
                      (category) =>
                        category.category_id === rule?.assign_category_id,
                    ) || {
                      category_id: ignoreOption.id,
                      name: ignoreOption.label,
                    }
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      assign_category_id: value?.category_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.category_id === value.category_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('rules.categoryToAssign')}
                    />
                  )}
                />
              </Grid>
              {/* Entity */}
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  id="entity-result"
                  options={[
                    {
                      entity_id: ignoreOption.id,
                      name: ignoreOption.label,
                    },
                    ...props.entities,
                  ]}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.entities.find(
                      (entity) => entity.entity_id === rule?.assign_entity_id,
                    ) || {
                      entity_id: ignoreOption.id,
                      name: ignoreOption.label,
                    }
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      assign_entity_id: value?.entity_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.entity_id === value.entity_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('rules.entityToAssign')}
                    />
                  )}
                />
              </Grid>
              {/* Account from */}
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  id="account-from-result"
                  options={[
                    {
                      account_id: ignoreOption.id,
                      name: ignoreOption.label,
                    },
                    ...props.accounts,
                  ]}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.accounts.find(
                      (account) =>
                        account.account_id === rule?.assign_account_from_id,
                    ) || {
                      account_id: ignoreOption.id,
                      name: ignoreOption.label,
                    }
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      assign_account_from_id: value?.account_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.account_id === value.account_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('rules.fromAccountToAssign')}
                    />
                  )}
                />
              </Grid>
              {/* Account to */}
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  id="account-to-result"
                  options={[
                    {
                      account_id: ignoreOption.id,
                      name: ignoreOption.label,
                    },
                    ...props.accounts,
                  ]}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    props.accounts.find(
                      (account) =>
                        account.account_id === rule?.assign_account_to_id,
                    ) || {
                      account_id: ignoreOption.id,
                      name: ignoreOption.label,
                    }
                  }
                  onChange={(_event, value) =>
                    updateRule({
                      assign_account_to_id: value?.account_id,
                    })
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.account_id === value.account_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      label={t('rules.toAccountToAssign')}
                    />
                  )}
                />
              </Grid>
              {/* Essential */}
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  id="essential-result"
                  name="essential-result"
                  value={rule?.assign_is_essential || 0}
                  required
                  onChange={(event) =>
                    updateRule({
                      assign_is_essential: parseInt(event.target.value),
                    })
                  }
                  label={t('transactions.essential')}
                >
                  <MenuItem key={0} value={0}>
                    {t('rules.no')}
                  </MenuItem>
                  <MenuItem key={1} value={1}>
                    {t('rules.yes')}
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Undo />}
          onClick={props.onNegativeClick}
        >
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditRuleDialog;
