import { useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Box from '@mui/material/Box/Box';
import Chip from '@mui/material/Chip/Chip';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Paper from '@mui/material/Paper/Paper';
import Stack from '@mui/material/Stack/Stack';
import TextField from '@mui/material/TextField/TextField';
import Typography from '@mui/material/Typography/Typography';
import { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../components/PageHeader';
import { useLoading } from '../../providers/LoadingProvider';
import {
  useGetTransactions,
  useRemoveTransaction,
} from '../../services/trx/trxHooks.ts';
import { Transaction } from '../../services/trx/trxServices.ts';
import React, { useEffect, useState } from 'react';
import {
  ArrowBack,
  ArrowForward,
  Business,
  Delete,
  Edit,
  FolderShared,
  Search,
} from '@mui/icons-material';
import { formatNumberAsCurrency } from '../../utils/textUtils';
import { useTranslation } from 'react-i18next';
import {
  getDayNumberFromUnixTimestamp,
  getMonthShortStringFromUnixTimestamp,
  getShortYearFromUnixTimestamp,
} from '../../utils/dateUtils';
import MyFinTable from '../../components/MyFinTable.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import ConfirmationDialog from '../../components/ConfirmationDialog.tsx';

const Transactions = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0,
  });
  const [actionableTransaction, setActionableTransaction] =
    useState<Transaction | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const getTransactionsRequest = useGetTransactions(
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
  );
  const removeTransactionRequest = useRemoveTransaction();

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (getTransactionsRequest.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getTransactionsRequest.isLoading]);

  useEffect(() => {
    // Show error when isError is true
    if (getTransactionsRequest.isError || removeTransactionRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getTransactionsRequest.isError, removeTransactionRequest.isError]);

  const removeTransaction = () => {
    if (!actionableTransaction) return;
    removeTransactionRequest.mutate(actionableTransaction?.transaction_id);
    setRemoveDialogOpen(false);
  };

  const handleEditTransactionClick = (trx: Transaction) => {
    //TODO
  };

  const handleRemoveTransactionClick = (trx: Transaction) => {
    setActionableTransaction(trx);
    setRemoveDialogOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('common.date'),
      flex: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent="center"
          alignContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span>
            <b>{getDayNumberFromUnixTimestamp(params.value)}</b>/
            {getMonthShortStringFromUnixTimestamp(params.value)}/
            {getShortYearFromUnixTimestamp(params.value)}
          </span>
        </Box>
      ),
    },
    {
      field: 'flow',
      headerName: t('transactions.flow'),
      flex: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <ArrowBack
              fontSize="small"
              color={params.value.acc_from_name ? 'primary' : 'secondary'}
            />{' '}
            {params.value.acc_from_name ?? t('common.externalAccount')}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <ArrowForward
              fontSize="small"
              color={params.value.acc_to_name ? 'secondary' : 'primary'}
            />{' '}
            {params.value.acc_to_name ?? t('common.externalAccount')}
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'description',
      headerName: t('common.description'),
      flex: 700,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="column" gap={1} p={2}>
          <Stack direction="row" alignItems="center" gap={0}>
            {params.value.description ?? t('common.externalAccount')}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <FolderShared fontSize="small" color="primary" />{' '}
            {params.value.category ?? t('common.externalAccount')}
            {'     '}
            <Business fontSize="small" color="primary" />{' '}
            {params.value.entity ?? t('common.externalAccount')}
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'value',
      headerName: t('common.value'),
      flex: 150,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip
          color="primary"
          variant="outlined"
          label={
            <Typography variant="subtitle2">
              <strong>{params.value}</strong>
            </Typography>
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      flex: 150,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={3}>
          <Edit
            fontSize="medium"
            color="action"
            onClick={() => {
              handleEditTransactionClick(params.value);
            }}
            sx={{ cursor: 'pointer' }}
          />
          <Delete
            fontSize="medium"
            color="action"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              handleRemoveTransactionClick(params.value);
            }}
          />
        </Stack>
      ),
    },
  ];

  if (getTransactionsRequest.isLoading || !getTransactionsRequest.data) {
    return null;
  }

  const rows = getTransactionsRequest.data.results.map(
    (result: Transaction) => ({
      id: result.transaction_id,
      date: result.date_timestamp,
      flow: {
        acc_from_name: result.account_from_name,
        acc_to_name: result.account_to_name,
      },
      description: {
        description: result.description,
        entity: result.entity_name,
        category: result.category_name,
      },
      value: formatNumberAsCurrency(result.amount),
      actions: result,
    }),
  );

  const removeTransactionConfirmationDialog = (
    <ConfirmationDialog
      isOpen={isRemoveDialogOpen}
      onClose={() => setRemoveDialogOpen(false)}
      onPositiveClick={() => removeTransaction()}
      onNegativeClick={() => setRemoveDialogOpen(false)}
      title={t('transactions.deleteTransactionModalTitle', {
        id: actionableTransaction?.transaction_id,
      })}
      description={t('transactions.deleteTransactionModalSubtitle')}
      positiveText={t('common.delete')}
      negativeText={t('common.cancel')}
    />
  );

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {removeTransactionConfirmationDialog}
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title="TRANSACTIONS"
          subtitle="Read and update your personal info"
        />
      </Box>
      <Grid container spacing={2}>
        <Grid
          sm={12}
          lg={4}
          xsOffset="auto"
          lgOffset={8}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <TextField
            id="outlined-basic"
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
              setSearchQuery(event.target.value);
            }}
          />
        </Grid>
        <Grid xs={12}>
          <MyFinTable
            isRefetching={getTransactionsRequest.isRefetching}
            rows={rows}
            columns={columns}
            itemCount={getTransactionsRequest.data.filtered_count}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Transactions;
