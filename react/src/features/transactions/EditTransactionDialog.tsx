import React, { SyntheticEvent, useEffect, useState } from 'react';
import {
  Transaction,
  TransactionType,
} from '../../services/trx/trxServices.ts';
import { useTranslation } from 'react-i18next';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent/DialogContent';
import TextField from '@mui/material/TextField/TextField';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import Button from '@mui/material/Button/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import {
  AccountCircle,
  Business,
  Description,
  Euro,
  FolderShared,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useUserData } from '../../providers/UserProvider.tsx';
import {
  useAddTransactionStep0,
  useEditTransaction,
} from '../../services/trx/trxHooks.ts';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { convertDateStringToUnixTimestamp } from '../../utils/dateUtils.ts';
import { inferTrxType } from '../../utils/transactionUtils.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  transaction: Transaction | null;
}

interface IdLabelPair {
  id: number;
  label: string;
}

const AddTransactionDialog = (props: Props) => {
  const getInitialIdLabelPair = (id?: number, name?: string) => {
    if (id == null || name == null) return null;
    return { id: id, label: name };
  };

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const addTransactionStep0Request = useAddTransactionStep0();
  const editTransactionRequest = useEditTransaction();
  const [transactionType, setTransactionType] = useState<TransactionType>(
    TransactionType.Expense,
  );
  const [essentialValue, setEssentialValue] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [dateValue, setDateValue] = useState<Dayjs | null>(dayjs());
  const [descriptionValue, setDescriptionValue] = useState<string>('');
  const [isAccountFromEnabled, setAccountFromEnabled] = useState<boolean>(true);
  const [isAccountToEnabled, setAccountToEnabled] = useState<boolean>(true);

  const [accountFromValue, setAccountFromValue] = useState<IdLabelPair | null>(
    null,
  );
  const [accountToValue, setAccountToValue] = useState<IdLabelPair | null>(
    null,
  );
  const [categoryValue, setCategoryValue] = useState<IdLabelPair | null>(null);
  const [entityValue, setEntityValue] = useState<IdLabelPair | null>(null);

  const { userAccounts } = useUserData();

  const [accountOptionsValue, setAccountOptionsValue] = useState<IdLabelPair[]>(
    [],
  );
  const [categoryOptionsValue, setCategoryOptionsValue] = useState<
    IdLabelPair[]
  >([]);
  const [entityOptionsValue, setEntityOptionsValue] = useState<IdLabelPair[]>(
    [],
  );
  const [tagOptionsValue, setTagOptionsValue] = useState<string[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAccountFromRequired, setAccountFromRequired] =
    useState<boolean>(true);
  const [isAccountToRequired, setAccountToRequired] = useState<boolean>(false);

  useEffect(() => {
    if (props.transaction == null) return;
    setTransactionType(
      inferTrxType(props.transaction) || TransactionType.Expense,
    );
    setEssentialValue(props.transaction.is_essential == 1);
    setAmountValue(props.transaction?.amount || 0);
    setDateValue(
      props.transaction?.date_timestamp != null
        ? dayjs.unix(props.transaction.date_timestamp)
        : dayjs(),
    );
    setDescriptionValue(props.transaction?.description || '');
    setAccountFromValue(
      getInitialIdLabelPair(
        props.transaction?.accounts_account_from_id,
        props.transaction?.account_from_name,
      ),
    );
    setAccountToValue(
      getInitialIdLabelPair(
        props.transaction?.accounts_account_to_id,
        props.transaction?.account_to_name,
      ),
    );
    setCategoryValue(
      getInitialIdLabelPair(
        props.transaction?.categories_category_id,
        props.transaction?.category_name,
      ),
    );
    setEntityValue(
      getInitialIdLabelPair(
        props.transaction?.entity_id,
        props.transaction?.entity_name,
      ),
    );
    setSelectedTags(props.transaction?.tags?.map((tag) => tag.name) || []);
  }, [props.transaction]);

  useEffect(() => {
    if (!props.isOpen) return;
    addTransactionStep0Request.refetch();
  }, [props.isOpen]);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (
      addTransactionStep0Request.isLoading ||
      editTransactionRequest.isPending
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addTransactionStep0Request.isPending, editTransactionRequest.isPending]);

  useEffect(() => {
    // Show error when isError is true
    if (addTransactionStep0Request.isError || editTransactionRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addTransactionStep0Request.isError, editTransactionRequest.isError]);

  useEffect(() => {
    if (editTransactionRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [editTransactionRequest.isSuccess]);

  useEffect(() => {
    const shouldAccountFromBeEnabled =
      transactionType !== TransactionType.Income;
    const shouldAccountToBeEnabled =
      transactionType !== TransactionType.Expense;

    setAccountFromEnabled(shouldAccountFromBeEnabled);
    setAccountToEnabled(shouldAccountToBeEnabled);
    if (!shouldAccountFromBeEnabled) {
      setAccountFromValue(null);
    }
    if (!shouldAccountToBeEnabled) {
      setAccountToValue(null);
    }

    setAccountFromRequired(shouldAccountFromBeEnabled);
    setAccountToRequired(shouldAccountToBeEnabled);
  }, [transactionType]);

  useEffect(() => {
    if (userAccounts) {
      setAccountOptionsValue(
        userAccounts.map((acc) => ({
          id: acc.account_id,
          label: acc.name,
        })),
      );
    }
  }, [userAccounts]);

  useEffect(() => {
    if (!addTransactionStep0Request.isSuccess) return;
    setCategoryOptionsValue(
      addTransactionStep0Request.data.categories.map((category) => ({
        id: category.category_id || 0,
        label: category.name || '',
      })),
    );

    setEntityOptionsValue(
      addTransactionStep0Request.data.entities.map((entity) => ({
        id: entity.entity_id || 0,
        label: entity.name || '',
      })),
    );

    setTagOptionsValue(
      addTransactionStep0Request.data.tags.map((tag) => tag.name),
    );
  }, [addTransactionStep0Request.isSuccess]);

  const onTransferTypeSelected = (
    _: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (
      newType !== null &&
      Object.values(TransactionType).includes(newType as TransactionType)
    ) {
      setTransactionType(newType as TransactionType);
    }
  };

  function handleTagsChange(
    _e: SyntheticEvent<Element, Event>,
    value: string[],
  ) {
    setSelectedTags(value);
  }

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const isEssential = formJson.essential == 'on';
          const accountFrom = accountFromValue;
          const accountTo = accountToValue;
          const category = categoryValue;
          const entity = entityValue;

          // Process the form data as needed
          editTransactionRequest.mutate({
            transaction_id: props.transaction?.transaction_id ?? -1,
            new_amount: formJson.amount as number,
            new_type: transactionType,
            new_description: formJson.description,
            new_account_from_id:
              typeof accountFrom === 'string' ? undefined : accountFrom?.id,
            new_account_to_id:
              typeof accountTo === 'string' ? undefined : accountTo?.id,
            new_category_id:
              typeof category === 'string' ? undefined : category?.id,
            new_entity_id: typeof entity === 'string' ? undefined : entity?.id,
            tags: JSON.stringify(selectedTags),
            new_date_timestamp: convertDateStringToUnixTimestamp(formJson.date),
            new_is_essential: isEssential,
          });
        },
      }}
    >
      <DialogTitle>{t('transactions.addNewTransaction')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid container spacing={2} xs={12} columns={{ xs: 1, md: 12 }}>
            <Grid md={4} xs={12}>
              {/* Essential */}
              <FormControlLabel
                control={<Checkbox />}
                checked={essentialValue}
                label={t('transactions.essential')}
                name="essential"
                onChange={(_e, checked) => setEssentialValue(checked)}
              />
            </Grid>
            <Grid xs={12} md={8} display="flex" justifyContent="flex-end">
              {/* Transaction type */}
              <ToggleButtonGroup
                value={transactionType}
                exclusive
                onChange={onTransferTypeSelected}
                aria-label={t('transactions.typeOfTrx')}
              >
                <ToggleButton
                  value={TransactionType.Expense}
                  aria-label={t('transactions.expense')}
                >
                  {t('transactions.expense')}
                </ToggleButton>
                <ToggleButton
                  value={TransactionType.Transfer}
                  aria-label={t('transactions.transfer')}
                >
                  {t('transactions.transfer')}
                </ToggleButton>
                <ToggleButton
                  value={TransactionType.Income}
                  aria-label={t('transactions.income')}
                >
                  {t('transactions.income')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          {/* Value, date & description */}
          <Grid container spacing={2} xs={12} columns={{ xs: 1, md: 12 }}>
            <Grid xs={12} md={3}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="amount"
                name="amount"
                value={amountValue}
                onChange={(e) => setAmountValue(Number(e.target.value))}
                label={t('common.value')}
                type="number"
                fullWidth
                variant="outlined"
                inputProps={{
                  step: 0.01,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Euro />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <DatePicker
                name="date"
                label={t('transactions.dateOfTransaction')}
                value={dateValue}
                onChange={(newValue) => setDateValue(newValue)}
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
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                required
                margin="dense"
                id="description"
                name="description"
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                label={t('common.description')}
                type="text"
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} xs={12} columns={{ xs: 1, md: 12 }}>
            {/* Origin & destination accounts */}
            <Grid xs={12} md={6}>
              <Autocomplete
                id="account_from"
                disabled={!isAccountFromEnabled}
                options={accountOptionsValue}
                value={accountFromValue}
                onChange={(_event, value) => {
                  setAccountFromValue(value as IdLabelPair);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required={isAccountFromRequired}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    label={t('transactions.originAccount')}
                  />
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Autocomplete
                id="account_to"
                disabled={!isAccountToEnabled}
                options={accountOptionsValue}
                value={accountToValue}
                onChange={(_event, value) => {
                  setAccountToValue(value as IdLabelPair);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required={isAccountToRequired}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    label={t('transactions.destinationAccount')}
                  />
                )}
              />
            </Grid>
            {/* Category & Entity */}
            <Grid xs={12} md={6}>
              <Autocomplete
                id="category"
                value={categoryValue}
                onChange={(_event, value) => {
                  setCategoryValue(value as IdLabelPair);
                }}
                options={categoryOptionsValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FolderShared />
                        </InputAdornment>
                      ),
                    }}
                    label={t('transactions.category')}
                  />
                )}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Autocomplete
                id="entity"
                value={entityValue}
                onChange={(_event, value) => {
                  setEntityValue(value as IdLabelPair);
                }}
                options={entityOptionsValue}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                    label={t('transactions.entity')}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <Autocomplete
              multiple
              id="tags"
              options={tagOptionsValue}
              freeSolo
              value={selectedTags}
              onChange={handleTagsChange}
              /*renderTags={(
                value: IdLabelPair[],
                getTagProps: (arg0: { index: any }) => JSX.IntrinsicAttributes,
              ) =>
                value.map((option: any, index: any) => {
                  return (
                    <Chip
                      key={option.id}
                      label={option.label}
                      {...getTagProps({ index })}
                    />
                  );
                })
              }*/
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                  {...params}
                  label={t('tags.tags')}
                  placeholder={t('transactions.addAnotherTagPlaceholder')}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onNegativeClick}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.edit')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTransactionDialog;
