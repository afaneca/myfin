import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Button from '@mui/material/Button/Button';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import {
  Autocomplete,
  Checkbox,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { IdLabelPair } from '../AddEditTransactionDialog.tsx';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { DatePicker } from '@mui/x-date-pickers/DatePicker/DatePicker';
import {
  convertDayJsToUnixTimestamp,
  convertUnixTimestampToDayJs,
} from '../../../utils/dateUtils';
import dayjs from 'dayjs';
import { ImportTrxStep1Result } from './ImportTrxStep1.tsx';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import { formatNumberAsCurrency } from '../../../utils/textUtils';
import { useImportTransactionsStep2 } from '../../../services/trx/trxHooks.ts';
import { inferTrxTypeByAttributes } from '../../../utils/transactionUtils.ts';
import { TransactionType } from '../../../services/trx/trxServices.ts';

export type Props = {
  data: ImportTrxStep1Result;
  onNext: (result: ImportTrxStep2Result) => void;
};

type ImportedTrx = {
  tempId: number;
  selected: boolean;
  date: number;
  description: string;
  value: number;
  entity?: IdLabelPair;
  category?: IdLabelPair;
  accountFrom?: IdLabelPair;
  accountTo?: IdLabelPair;
  essential: boolean;
};

export type ImportTrxStep2Result = {
  nrOfTrxImported: number;
  accountName: string;
};

const ImportTrxStep2 = (props: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const importTrxStep2Request = useImportTransactionsStep2();

  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<ImportedTrx[]>([]);

  const filteredTransactions = useMemo(
    () => transactions.filter((trx) => trx.selected),
    [transactions],
  );

  const entities: IdLabelPair[] | undefined = useMemo(
    () =>
      props.data.entities.map((entity) => ({
        id: entity.entity_id,
        label: entity.name,
      })),
    [props.data.entities],
  );
  const categories: IdLabelPair[] | undefined = useMemo(
    () =>
      props.data.categories.map((category) => ({
        id: category.category_id,
        label: category.name,
      })),
    [props.data.categories],
  );
  const accounts: IdLabelPair[] | undefined = useMemo(
    () =>
      props.data.accounts.map((account) => ({
        id: account.account_id,
        label: account.name,
      })),
    [props.data.categories],
  );

  const newAccountBalance: number = useMemo(() => {
    const initialBalance =
      props.data.accounts.find(() => props.data.selectedAccountId)?.balance ||
      0;
    return transactions.reduce((acc, row) => {
      let amount = row.value;
      if (row.accountFrom?.id == props.data.selectedAccountId) {
        amount *= -1;
      }
      return acc + amount;
    }, initialBalance);
  }, [props.data.selectedAccountId, props.data.accounts, transactions]);

  // Loading
  useEffect(() => {
    if (importTrxStep2Request.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [importTrxStep2Request.isPending]);

  // Error
  useEffect(() => {
    if (importTrxStep2Request.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [importTrxStep2Request.isError]);

  // Success
  useEffect(() => {
    if (importTrxStep2Request.data) {
      props.onNext({
        nrOfTrxImported: filteredTransactions.length,
        accountName:
          accounts.find((acc) => acc.id == props.data.selectedAccountId)
            ?.label || '',
      });
    }
  }, [importTrxStep2Request.data]);

  useEffect(() => {
    if (!props.data.fillData) return;
    const trx = props.data.fillData.map((item, index) => ({
      tempId: index,
      selected: true,
      date: item.date || 0,
      description: item.description || '',
      value: item.amount || 0,
      entity: entities.find((entity) => entity.id == item.selectedEntityID),
      category: categories.find(
        (category) => category.id == item.selectedCategoryID,
      ),
      accountFrom: accounts.find(
        (account) => account.id == item.selectedAccountFromID,
      ),
      accountTo: accounts.find(
        (account) => account.id == item.selectedAccountToID,
      ),
      essential: item.isEssential == true,
    }));

    setTransactions(trx);
  }, [props.data.fillData]);

  const rows = transactions.map((item) => ({
    id: item.tempId,
    include: item.selected,
    date: item.date,
    value: item.value,
    description: item.description,
    category: {
      category: item.category,
      entity: item.entity,
    },
    accountFrom: item.accountFrom,
    flow: {
      from: item.accountFrom,
      to: item.accountTo,
    },
    essential: item.essential,
  }));

  const columns: GridColDef[] = [
    {
      field: 'include',
      width: 100,
      headerName: t('transactions.import'),
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={(_, checked) => {
            setTransactions(
              transactions.map((trx) =>
                trx.tempId == params.id
                  ? {
                      ...trx,
                      selected: checked,
                    }
                  : trx,
              ),
            );
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      ),
    },
    {
      field: 'date',
      headerName: t('common.date'),
      width: 170,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <DatePicker
          name="date"
          value={convertUnixTimestampToDayJs(params.value)}
          onChange={(newValue) => {
            const timestamp = convertDayJsToUnixTimestamp(newValue || dayjs());
            setTransactions(
              transactions.map((trx) =>
                trx.tempId == params.id
                  ? {
                      ...trx,
                      date: timestamp,
                    }
                  : trx,
              ),
            );
          }}
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
      ),
    },
    {
      field: 'value',
      headerName: t('common.value'),
      width: 120,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <TextField
          margin="dense"
          id="amount"
          name="amount"
          value={params.value}
          onChange={(e) => {
            setTransactions(
              transactions.map((trx) =>
                trx.tempId == params.id
                  ? {
                      ...trx,
                      value: Number(e.target.value),
                    }
                  : trx,
              ),
            );
          }}
          type="text"
          fullWidth
          variant="outlined"
        />
      ),
    },
    {
      field: 'description',
      headerName: t('common.description'),
      editable: false,
      sortable: false,
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        return (
          <TextField
            margin="dense"
            id="description"
            name="description"
            value={params.value}
            onChange={(e) => {
              setTransactions(
                transactions.map((trx) =>
                  trx.tempId == params.id
                    ? {
                        ...trx,
                        description: e.target.value,
                      }
                    : trx,
                ),
              );
            }}
            type="text"
            fullWidth
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'category',
      headerName: t('transactions.category'),
      editable: false,
      sortable: false,
      width: 180,
      renderCell: (params) => (
        <Stack spacing={2} sx={{ mt: 2, mb: 2, width: 1 }}>
          <Autocomplete
            id="category"
            fullWidth
            value={params.value.category}
            onChange={(_event, value) => {
              setTransactions(
                transactions.map((trx) =>
                  trx.tempId == params.id
                    ? {
                        ...trx,
                        category: value,
                      }
                    : trx,
                ),
              );
            }}
            options={categories}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.category')}
                fullWidth
              />
            )}
          />
          <Autocomplete
            id="entity"
            fullWidth
            value={params.value.entity}
            onChange={(_event, value) => {
              setTransactions(
                transactions.map((trx) =>
                  trx.tempId == params.id
                    ? {
                        ...trx,
                        entity: value,
                      }
                    : trx,
                ),
              );
            }}
            options={entities}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.entity')}
                fullWidth
              />
            )}
          />
        </Stack>
      ),
    },
    {
      field: 'flow',
      headerName: t('transactions.flow'),
      editable: false,
      sortable: false,
      width: 180,
      renderCell: (params) => (
        <Stack spacing={2} sx={{ mt: 2, mb: 2, width: 1 }}>
          <Autocomplete
            id="accountFrom"
            fullWidth
            value={params.value.from}
            onChange={(_event, value) => {
              setTransactions(
                transactions.map((trx) =>
                  trx.tempId == params.id
                    ? {
                        ...trx,
                        accountFrom: value,
                      }
                    : trx,
                ),
              );
            }}
            options={accounts}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.originAccount')}
                fullWidth
              />
            )}
          />
          <Autocomplete
            id="accountTo"
            fullWidth
            value={params.value.to}
            onChange={(_event, value) => {
              setTransactions(
                transactions.map((trx) =>
                  trx.tempId == params.id
                    ? {
                        ...trx,
                        accountTo: value,
                      }
                    : trx,
                ),
              );
            }}
            options={accounts}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('transactions.destinationAccount')}
                fullWidth
              />
            )}
          />
        </Stack>
      ),
    },
    {
      field: 'essential',
      headerName: t('transactions.essential'),
      editable: false,
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={params.value}
          onChange={(_, checked) => {
            setTransactions(
              transactions.map((trx) =>
                trx.tempId == params.id
                  ? {
                      ...trx,
                      essential: checked,
                    }
                  : trx,
              ),
            );
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      ),
    },
  ];

  const handleContinueButtonClick = () => {
    setConfirmationDialogOpen(true);
  };

  const importTransactions = () => {
    setConfirmationDialogOpen(false);
    importTrxStep2Request.mutate(
      filteredTransactions.map((trx) => ({
        amount: trx.value,
        date_timestamp: trx.date,
        description: trx.description,
        is_essential: trx.essential,
        type:
          inferTrxTypeByAttributes(trx.accountFrom?.id, trx.accountTo?.id) ||
          TransactionType.Transfer,
        account_from_id: trx.accountFrom?.id,
        account_to_id: trx.accountTo?.id,
      })),
    );
  };

  return (
    <>
      {isConfirmationDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setConfirmationDialogOpen(false)}
          onPositiveClick={() => importTransactions()}
          onNegativeClick={() => setConfirmationDialogOpen(false)}
          titleText={t('transactions.completeImportQuestion')}
          descriptionText={t('transactions.importedTransactionsCnt', {
            count: filteredTransactions.length,
          })}
          alert={t('transactions.newBalanceForAccountValue', {
            account: accounts.find(
              (acc) => props.data.selectedAccountId == acc.id,
            )?.label,
            value: formatNumberAsCurrency(newAccountBalance),
          })}
          positiveText={t('transactions.import')}
        />
      )}
      <Grid container direction="column" spacing={2}>
        <Grid>
          <Typography variant="body1" component="div" sx={{ mt: 2, mb: 2 }}>
            <Trans i18nKey="importTransactions.step2Text" />
          </Typography>
        </Grid>
        <Grid xs={12}>
          <MyFinStaticTable
            isRefetching={false}
            rows={rows}
            columns={columns}
            paginationModel={{
              pageSize: 100,
            }}
          />
        </Grid>
        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={<KeyboardDoubleArrowRight />}
            onClick={() => handleContinueButtonClick()}
            sx={{ width: 'fit-content', mt: theme.spacing(2) }}
          >
            {t('transactions.continueImport')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ImportTrxStep2;
