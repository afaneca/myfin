import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useGetRules, useRemoveRule } from '../../services/rule/ruleHooks.tsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Rule,
  RuleMatchingOperatorType,
} from '../../services/rule/ruleServices.tsx';
import { debounce } from 'lodash';
import { Account } from '../../services/auth/authServices.ts';
import { Entity, TransactionType } from '../../services/trx/trxServices.ts';
import { Category } from '../../services/category/categoryServices.ts';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { Paper, useTheme } from '@mui/material';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import Box from '@mui/material/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';
import AddEditRuleDialog from './AddEditRuleDialog.tsx';

const Rules = () => {
  const theme = useTheme();

  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getRulesRequest = useGetRules();
  const removeRuleRequest = useRemoveRule();

  const [rules, setRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionableRule, setActionableRule] = useState<Rule | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);

  const getTransactionTypeLocalizedText = (transactionType: string): string => {
    switch (transactionType) {
      case TransactionType.Expense:
        return t('transactions.expense');
      case TransactionType.Income:
        return t('transactions.income');
      default:
        return t('transactions.transfer');
    }
  };

  const filteredRules = useMemo(() => {
    let filteredList = rules;

    if (searchQuery != null) {
      const lowerCaseQuery = searchQuery?.toLowerCase() || '';
      filteredList = rules.filter(
        (rule) =>
          !searchQuery ||
          JSON.stringify(rule).toLowerCase().includes(lowerCaseQuery) ||
          accounts
            .find((acc) => acc.account_id == rule.matcher_account_from_id_value)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          accounts
            .find((acc) => acc.account_id == rule.matcher_account_to_id_value)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          accounts
            .find((acc) => acc.account_id == rule.assign_account_from_id)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          accounts
            .find((acc) => acc.account_id == rule.assign_account_to_id)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          categories
            .find((cat) => cat.category_id == rule.assign_category_id)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          entities
            .find((ent) => ent.entity_id == rule.assign_entity_id)
            ?.name.toLowerCase()
            .includes(lowerCaseQuery) ||
          (rule.matcher_type_value &&
            getTransactionTypeLocalizedText(rule.matcher_type_value)
              .toLowerCase()
              .includes(lowerCaseQuery)) ||
          (rule.assign_type &&
            getTransactionTypeLocalizedText(rule.assign_type)
              .toLowerCase()
              .includes(lowerCaseQuery)),
      );
    }

    return filteredList;
  }, [searchQuery, rules]);

  // Loading
  useEffect(() => {
    if (getRulesRequest.isFetching || removeRuleRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getRulesRequest.isFetching || removeRuleRequest.isPending]);

  // Error
  useEffect(() => {
    if (getRulesRequest.isError || removeRuleRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getRulesRequest.isError, removeRuleRequest.isError]);

  // Success
  useEffect(() => {
    if (!getRulesRequest.data) return;
    setRules(getRulesRequest.data.rules);
    setAccounts(getRulesRequest.data.accounts);
    setCategories(getRulesRequest.data.categories);
    setEntities(getRulesRequest.data.entities);
  }, [getRulesRequest.data]);

  // Reset actionableRule
  useEffect(() => {
    if (isRemoveDialogOpen == false && isAddEditDialogOpen == false) {
      setActionableRule(null);
    }
  }, [isRemoveDialogOpen, isAddEditDialogOpen]);

  const handleEditButtonClick = (rule: Rule) => {
    setActionableRule(rule);
    setAddEditDialogOpen(true);
  };

  const rows = useMemo(
    () =>
      filteredRules.map((rule: Rule) => ({
        id: rule.rule_id,
        conditions: {
          accountFromOperator: rule.matcher_account_from_id_operator,
          accountFromValue: accounts.find(
            (acc) => acc.account_id == rule.matcher_account_from_id_value,
          )?.name,
          accountToOperator: rule.matcher_account_to_id_operator,
          accountToValue: accounts.find(
            (acc) => acc.account_id == rule.matcher_account_to_id_value,
          )?.name,
          amountOperator: rule.matcher_amount_operator,
          amountValue: rule.matcher_amount_value,
          descriptionOperator: rule.matcher_description_operator,
          descriptionValue: rule.matcher_description_value,
          typeOperator: rule.matcher_type_operator,
          typeValue: rule.matcher_type_value,
        },
        result: {
          accountFrom: accounts.find(
            (acc) => acc.account_id == rule.assign_account_from_id,
          )?.name,
          accountTo: accounts.find(
            (acc) => acc.account_id == rule.assign_account_to_id,
          )?.name,
          category: categories.find(
            (cat) => cat.category_id == rule.assign_category_id,
          )?.name,
          entity: entities.find((ent) => ent.entity_id == rule.assign_entity_id)
            ?.name,
          type: rule.assign_type,
          isEssential: rule.assign_is_essential,
        },
        actions: rule,
      })),
    [filteredRules, accounts, categories, entities],
  );

  const getMatchingTypeLocalizedText = (matchingType: string): string => {
    switch (matchingType) {
      case RuleMatchingOperatorType.Equals:
        return t('rules.equals');
      case RuleMatchingOperatorType.NotEquals:
        return t('rules.notEquals');
      case RuleMatchingOperatorType.Contains:
        return t('rules.contains');
      case RuleMatchingOperatorType.NotContains:
        return t('rules.doesNotContain');
      default:
        return t('rules.ignore');
    }
  };

  const ConditionCell = (props: {
    conditionLabel: string;
    matchingTypeValue: string;
    conditionValue: string;
  }) => {
    return (
      <span>
        <span style={{ color: theme.palette.text.secondary }}>
          {props.conditionLabel}:
        </span>{' '}
        ({props.matchingTypeValue}) {props.conditionValue}
      </span>
    );
  };

  const ResultCell = (props: { resultLabel: string; resultValue: string }) => {
    return (
      <span>
        <span style={{ color: theme.palette.text.secondary }}>
          {props.resultLabel}:
        </span>{' '}
        {props.resultValue}
      </span>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'conditions',
      headerName: t('rules.conditions'),
      flex: 1,
      minWidth: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack gap={1} sx={{ mt: 1, mb: 1 }} direction="column">
          {params.value.accountFromOperator !=
            RuleMatchingOperatorType.Ignore && (
            <ConditionCell
              conditionLabel={t('rules.fromAccount')}
              matchingTypeValue={getMatchingTypeLocalizedText(
                params.value.accountFromOperator,
              )}
              conditionValue={params.value.accountFromValue}
            />
          )}
          {params.value.accountToOperator !=
            RuleMatchingOperatorType.Ignore && (
            <ConditionCell
              conditionLabel={t('rules.toAccount')}
              matchingTypeValue={getMatchingTypeLocalizedText(
                params.value.accountToOperator,
              )}
              conditionValue={params.value.accountToValue}
            />
          )}
          {params.value.amountOperator != RuleMatchingOperatorType.Ignore && (
            <ConditionCell
              conditionLabel={t('common.amount')}
              matchingTypeValue={getMatchingTypeLocalizedText(
                params.value.amountOperator,
              )}
              conditionValue={params.value.amountValue}
            />
          )}
          {params.value.descriptionOperator !=
            RuleMatchingOperatorType.Ignore && (
            <ConditionCell
              conditionLabel={t('common.description')}
              matchingTypeValue={getMatchingTypeLocalizedText(
                params.value.descriptionOperator,
              )}
              conditionValue={params.value.descriptionValue}
            />
          )}
          {params.value.typeOperator != RuleMatchingOperatorType.Ignore && (
            <ConditionCell
              conditionLabel={t('common.type')}
              matchingTypeValue={getMatchingTypeLocalizedText(
                params.value.typeOperator,
              )}
              conditionValue={getTransactionTypeLocalizedText(
                params.value.typeValue,
              )}
            />
          )}
        </Stack>
      ),
    },
    {
      field: 'result',
      headerName: t('rules.result'),
      flex: 1,
      minWidth: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack gap={1} sx={{ mt: 1, mb: 1 }} direction="column">
          {params.value.accountFrom && (
            <ResultCell
              resultLabel={t('rules.fromAccount')}
              resultValue={params.value.accountFrom}
            />
          )}
          {params.value.accountTo && (
            <ResultCell
              resultLabel={t('rules.toAccount')}
              resultValue={params.value.accountTo}
            />
          )}
          {params.value.category && (
            <ResultCell
              resultLabel={t('rules.assignCategory')}
              resultValue={params.value.category}
            />
          )}
          {params.value.entity && (
            <ResultCell
              resultLabel={t('rules.assignEntity')}
              resultValue={params.value.entity}
            />
          )}
          {params.value.type && (
            <ResultCell
              resultLabel={t('rules.assignType')}
              resultValue={params.value.type}
            />
          )}
          {params.value.isEssential != undefined && (
            <ResultCell
              resultLabel={t('rules.essential')}
              resultValue={
                params.value.isEssential ? t('rules.yes') : t('rules.no')
              }
            />
          )}
        </Stack>
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
              setActionableRule(params.value);
              setRemoveDialogOpen(true);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const removeRule = () => {
    if (!actionableRule) return;
    removeRuleRequest.mutate(actionableRule.rule_id);
    setRemoveDialogOpen(false);
  };

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchQuery(event.target.value);
    },
    [debouncedSearchQuery],
  );

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isAddEditDialogOpen && (
        <AddEditRuleDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setAddEditDialogOpen(false)}
          onPositiveClick={() => setAddEditDialogOpen(false)}
          onNegativeClick={() => setAddEditDialogOpen(false)}
          rule={actionableRule}
          accounts={accounts}
          categories={categories}
          entities={entities}
        />
      )}
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={() => removeRule()}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('rules.deleteRuleModalTitle', {
            id: actionableRule?.rule_id,
          })}
          descriptionText={t('rules.deleteRuleModalSubtitle')}
          positiveText={t('common.delete')}
          alert={t('rules.deleteRuleModalAlert')}
        />
      )}
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader title={t('rules.rules')} subtitle={t('rules.strapLine')} />
      </Box>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
            startIcon={<AddCircleOutline />}
            onClick={() => {
              setAddEditDialogOpen(true);
            }}
          >
            {t('rules.addRule')}
          </Button>
        </Grid>
        <Grid
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
          size={{
            xs: 12,
            md: 4,
          }}
          offset="auto"
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
        <Grid size={12}>
          <MyFinStaticTable
            isRefetching={getRulesRequest.isRefetching}
            rows={rows}
            columns={columns}
            paginationModel={{ pageSize: 20 }}
            onRowClicked={(id) => {
              const rule = rules.find((ent) => ent.rule_id == id);
              if (!rule) return;
              handleEditButtonClick(rule);
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Rules;
