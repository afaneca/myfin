import { ListItem, Tooltip, useTheme } from '@mui/material';
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
import {
  Tag,
  Transaction,
  TransactionType,
} from '../../services/trx/trxServices.ts';
import React, { memo, useEffect, useState } from 'react';
import {
  AddCircleOutline,
  ArrowBack,
  ArrowForward,
  Business,
  ContentCopy,
  Delete,
  Edit,
  FolderShared,
  Search,
  Stars,
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
import Button from '@mui/material/Button/Button';
import RemoveTransactionDialog from './RemoveTransactionDialog.tsx';
import AddEditTransactionDialog from './AddEditTransactionDialog.tsx';
import IconButton from '@mui/material/IconButton';
import { inferTrxType } from '../../utils/transactionUtils.ts';

const Transactions = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 50,
    page: 0,
  });
  const [actionableTransaction, setActionableTransaction] =
    useState<Transaction | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const getTransactionsRequest = useGetTransactions(
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
  );
  const removeTransactionRequest = useRemoveTransaction();

  // Show loading indicator when isLoading is true
  useEffect(() => {
    if (getTransactionsRequest.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getTransactionsRequest.isLoading]);

  // Show error when isError is true
  useEffect(() => {
    if (getTransactionsRequest.isError || removeTransactionRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getTransactionsRequest.isError, removeTransactionRequest.isError]);

  useEffect(() => {
    if (isRemoveDialogOpen == false && isAddEditDialogOpen == false) {
      setActionableTransaction(null);
    }
  }, [isAddEditDialogOpen, isRemoveDialogOpen]);

  const removeTransaction = () => {
    if (!actionableTransaction) return;
    removeTransactionRequest.mutate(actionableTransaction?.transaction_id);
    setRemoveDialogOpen(false);
  };

  const handleEditTransactionClick = (trx: Transaction) => {
    setActionableTransaction(trx);
    setEditDialogOpen(true);
  };

  const handleRemoveTransactionClick = (trx: Transaction) => {
    setActionableTransaction(trx);
    setRemoveDialogOpen(true);
  };

  const handleImportTransactionsClick = () => {
    // TODO
  };

  const handleAddTransactionClick = () => {
    /*setAddTrxDialogOpen(true);*/
    setEditDialogOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('common.date'),
      flex: 100,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="column" alignItems="center" gap={0.5}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <span style={{ textAlign: 'center' }}>
              <b>
                {getDayNumberFromUnixTimestamp(params.value.date_timestamp)}
              </b>{' '}
              {/*<br />*/}
              <span>
                {getMonthShortStringFromUnixTimestamp(
                  params.value.date_timestamp,
                )}
                {" '"}
                {getShortYearFromUnixTimestamp(params.value.date_timestamp)}
              </span>
            </span>
          </Box>
          <Tooltip title={t('transactions.essential')}>
            <IconButton
              sx={{
                display: params.value.essential === 1 ? 'flex' : 'none',
              }}
            >
              <Stars fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: 'flow',
      headerName: t('transactions.flow'),
      flex: 200,
      minWidth: 200,
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
      minWidth: 400,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="column" gap={1} p={2}>
          <Stack direction="row" alignItems="center" gap={0}>
            {params.value.description ?? t('common.externalAccount')}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <FolderShared fontSize="small" color="primary" />{' '}
            {params.value.category ?? t('common.noCategory')}
            {'     '}
            <Business fontSize="small" color="primary" />{' '}
            {params.value.entity ?? t('common.noEntity')}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.5}>
            {params.value.tags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row', // Set flexDirection to 'row' to align chips side by side
                  justifyContent: 'flex-start', // Adjust alignment as needed
                  flexWrap: 'wrap', // Allow wrapping of chips
                  listStyle: 'none',
                  p: 0.5,
                  m: 0,
                }}
                component="ul"
              >
                {params.value.tags.map((data: Tag) => {
                  return (
                    <ListItem key={data.tag_id} sx={{ width: 'auto', p: 0.5 }}>
                      <Chip
                        label={data.name}
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => {}}
                      />
                    </ListItem>
                  );
                })}
              </Box>
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'value',
      headerName: t('common.value'),
      flex: 170,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip
          color={params.value.chipColor}
          variant="outlined"
          label={
            <Typography variant="subtitle2">
              <strong>{params.value.amount}</strong>
            </Typography>
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      flex: 150,
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={0}>
          <IconButton aria-label={t('common.edit')}>
            <Edit
              fontSize="medium"
              color="action"
              onClick={() => {
                handleEditTransactionClick(params.value);
              }}
            />
          </IconButton>
          <IconButton aria-label={t('common.remove')}>
            <Delete
              fontSize="medium"
              color="action"
              onClick={() => {
                handleRemoveTransactionClick(params.value);
              }}
            />
          </IconButton>
        </Stack>
      ),
    },
  ];
  if (getTransactionsRequest.isLoading || !getTransactionsRequest.data) {
    return null;
  }

  function getChipColorForAmount(trx: Transaction): string {
    switch (inferTrxType(trx)) {
      case TransactionType.Expense:
        return 'primary';
      case TransactionType.Income:
        return 'secondary';
      case TransactionType.Transfer:
      default:
        return 'default';
    }
  }

  const rows = getTransactionsRequest.data.results.map(
    (result: Transaction) => ({
      id: result.transaction_id,
      date: {
        date_timestamp: result.date_timestamp,
        essential: result.is_essential,
      },
      flow: {
        acc_from_name: result.account_from_name,
        acc_to_name: result.account_to_name,
      },
      description: {
        description: result.description,
        entity: result.entity_name,
        category: result.category_name,
        tags: result.tags,
      },
      value: {
        amount: formatNumberAsCurrency(result.amount),
        chipColor: getChipColorForAmount(result),
      },
      actions: result,
    }),
  );

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isAddEditDialogOpen && (
        <AddEditTransactionDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onPositiveClick={() => setEditDialogOpen(false)}
          onNegativeClick={() => setEditDialogOpen(false)}
          transaction={actionableTransaction}
        />
      )}
      <RemoveTransactionDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        onPositiveClick={() => removeTransaction()}
        onNegativeClick={() => setRemoveDialogOpen(false)}
        transaction={actionableTransaction}
      />
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('transactions.transactions')}
          subtitle={t('transactions.strapLine')}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid sm={8} xs={12} container spacing={2}>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={() => {
                handleAddTransactionClick();
              }}
            >
              {t('transactions.addTransactionCTA')}
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopy />}
              onClick={() => {
                handleImportTransactionsClick();
              }}
            >
              {t('transactions.importTransactionCTA')}
            </Button>
          </Grid>
        </Grid>
        <Grid
          sm={12}
          lg={4}
          xsOffset="auto"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {' '}
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

export default memo(Transactions);
