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
import Dialog from '@mui/material/Dialog/Dialog';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Checkbox,
  Grow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import {
  AccountCircle,
  AutoAwesome,
  Business,
  Description,
  Euro,
  FolderShared,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useUserData } from '../../providers/UserProvider.tsx';
import {
  useAddTransactionStep0,
  useAddTransactionStep1,
  useAutoCategorizeTransaction,
  useEditTransaction,
} from '../../services/trx/trxHooks.ts';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { convertDateStringToUnixTimestamp } from '../../utils/dateUtils.ts';
import { inferTrxType } from '../../utils/transactionUtils.ts';
import IconButton from '@mui/material/IconButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  transaction: Transaction | null;
}

interface IdLabelPair {
  id: bigint;
  label: string;
}

const AddEditTransactionDialog = (props: Props) => {
  const isEditForm = props.transaction !== null;

  const getInitialIdLabelPair = (id?: bigint, name?: string) => {
    if (id == null || name == null) return null;
    return { id: id, label: name };
  };

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const addTransactionStep0Request = useAddTransactionStep0();
  const addTransactionStep1Request = useAddTransactionStep1();
  const autoCategorizeTransactionRequest = useAutoCategorizeTransaction();
  const editTransactionRequest = useEditTransaction();
  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);
  const [essentialValue, setEssentialValue] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<number | null>(null);
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
  const [isEssentialVisible, setEssentialVisible] = useState(false);
  const [isAutoCatVisible, setAutoCatVisible] = useState(false);

  useEffect(() => {
    setTransactionType(
      inferTrxType(props.transaction) || TransactionType.Expense,
    );
    setEssentialValue(props.transaction?.is_essential == 1);
    setAmountValue(props.transaction?.amount || null);
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
      editTransactionRequest.isPending ||
      addTransactionStep1Request.isPending ||
      autoCategorizeTransactionRequest.isPending
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    addTransactionStep0Request.isPending,
    editTransactionRequest.isPending,
    addTransactionStep1Request.isPending,
    autoCategorizeTransactionRequest.isPending,
  ]);

  useEffect(() => {
    // Show error when isError is true
    if (
      addTransactionStep0Request.isError ||
      editTransactionRequest.isError ||
      addTransactionStep1Request.isError ||
      autoCategorizeTransactionRequest.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    addTransactionStep0Request.isError,
    editTransactionRequest.isError,
    addTransactionStep1Request.isError,
    autoCategorizeTransactionRequest.isError,
  ]);

  useEffect(() => {
    if (
      editTransactionRequest.isSuccess ||
      addTransactionStep1Request.isSuccess
    ) {
      props.onPositiveClick();
    }
  }, [editTransactionRequest.isSuccess, addTransactionStep1Request.isSuccess]);

  useEffect(() => {
    if (!transactionType) return;
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
    setEssentialVisible(transactionType == TransactionType.Expense);
    if (transactionType != TransactionType.Expense) {
      setEssentialValue(false);
    }
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
        id: category.category_id || 0n,
        label: category.name || '',
      })),
    );

    setEntityOptionsValue(
      addTransactionStep0Request.data.entities.map((entity) => ({
        id: entity.entity_id || 0n,
        label: entity.name || '',
      })),
    );

    setTagOptionsValue(
      addTransactionStep0Request.data.tags.map((tag) => tag.name),
    );
  }, [addTransactionStep0Request.isSuccess]);

  useEffect(() => {
    if (
      !autoCategorizeTransactionRequest.isSuccess ||
      !autoCategorizeTransactionRequest.data.matching_rule
    )
      return;

    const newData = autoCategorizeTransactionRequest.data;
    // Type
    setTransactionType(newData.type || TransactionType.Expense);
    // Date
    // Description
    setDescriptionValue(newData.description || '');
    // Amount
    setAmountValue(newData.amount || null);
    // Category
    setCategoryValue(
      categoryOptionsValue.find(
        (cat) => cat.id == newData.selectedCategoryID,
      ) || null,
    );
    // Entity
    setEntityValue(
      entityOptionsValue.find((ent) => ent.id == newData.selectedEntityID) ||
        null,
    );
    // Account From
    setAccountFromValue(
      accountOptionsValue.find(
        (acc) => acc.id == newData.selectedAccountFromID,
      ) || null,
    );
    // Account To
    setAccountToValue(
      accountOptionsValue.find(
        (acc) => acc.id == newData.selectedAccountToID,
      ) || null,
    );
    // Essential
    setEssentialValue(newData.isEssential == true);
  }, [autoCategorizeTransactionRequest.isSuccess]);

  useEffect(() => {
    setAutoCatVisible(!!descriptionValue);
  }, [descriptionValue]);

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

  const handleTagsChange = (
    _e: SyntheticEvent<Element, Event>,
    value: string[],
  ) => {
    setSelectedTags(value);
  };

  const handleAutoCategorizeClick = () => {
    autoCategorizeTransactionRequest.mutate({
      description: descriptionValue,
      amount: Number(amountValue),
      account_from_id: BigInt(accountFromValue?.id || -1n),
      account_to_id: BigInt(accountToValue?.id || -1n),
      type: transactionType ?? TransactionType.Expense,
    });
  };

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
          if (isEditForm) {
            editTransactionRequest.mutate({
              transaction_id: props.transaction?.transaction_id ?? -1n,
              new_amount: formJson.amount as number,
              new_type: transactionType ?? TransactionType.Expense,
              new_description: formJson.description,
              new_account_from_id:
                typeof accountFrom === 'string' ? undefined : accountFrom?.id,
              new_account_to_id:
                typeof accountTo === 'string' ? undefined : accountTo?.id,
              new_category_id:
                typeof category === 'string' ? undefined : category?.id,
              new_entity_id:
                typeof entity === 'string' ? undefined : entity?.id,
              tags: JSON.stringify(selectedTags),
              new_date_timestamp: convertDateStringToUnixTimestamp(
                formJson.date,
              ),
              new_is_essential: isEssential,
            });
          } else {
            addTransactionStep1Request.mutate({
              amount: formJson.amount as number,
              type: transactionType ?? TransactionType.Expense,
              description: formJson.description,
              account_from_id: accountFrom?.id,
              account_to_id: accountTo?.id,
              category_id: category?.id,
              entity_id: entity?.id,
              tags: JSON.stringify(selectedTags),
              date_timestamp: convertDateStringToUnixTimestamp(formJson.date),
              is_essential: isEssential,
            });
          }
        },
      }}
    >
      <DialogTitle>
        {t(
          isEditForm
            ? 'transactions.editTransactionModalTitle'
            : 'transactions.addNewTransaction',
          {
            id: props.transaction?.transaction_id,
          },
        )}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid container spacing={2} xs={12} columns={{ xs: 1, md: 12 }}>
            <Grid md={4} xs={12}>
              {/* Essential */}
              <Grow in={isEssentialVisible}>
                <FormControlLabel
                  control={
                    <Checkbox icon={<StarBorder />} checkedIcon={<Star />} />
                  }
                  checked={essentialValue}
                  label={t('transactions.essential')}
                  name="essential"
                  onChange={(_e, checked) => setEssentialValue(checked)}
                />
              </Grow>
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
                value={amountValue || ''}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('transactions.autoCategorize')}>
                        <Grow in={isAutoCatVisible}>
                          <IconButton
                            aria-label={t('transactions.autoCategorize')}
                            onClick={handleAutoCategorizeClick}
                            edge="end"
                            /*sx={{
                              display: isAutoCatVisible ? 'block' : 'none',
                            }}*/
                          >
                            <AutoAwesome color="primary" />
                          </IconButton>
                        </Grow>
                      </Tooltip>
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
        <Button type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditTransactionDialog;
