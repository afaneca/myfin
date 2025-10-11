import { Transaction, TransactionType } from '../services/trx/trxServices.ts';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import {
  getDayNumberFromUnixTimestamp,
  getFullYearFromUnixTimestamp,
  getMonthShortStringFromUnixTimestamp,
} from '../utils/dateUtils.ts';
import { useGetTransactionsForCategoryInMonth } from '../services/trx/trxHooks.ts';
import { useEffect, useState } from 'react';
import { useLoading } from '../providers/LoadingProvider.tsx';
import { AlertSeverity, useSnackbar } from '../providers/SnackbarProvider.tsx';
import { useFormatNumberAsCurrency } from '../utils/textHooks.ts';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryId: bigint;
  type: TransactionType;
  month: number;
  year: number;
};

function TransactionsTableDialog(props: Props) {
  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const [trxList, setTrxList] = useState<Transaction[]>([]);
  const formatNumberAsCurrency = useFormatNumberAsCurrency();
  const getTransactionsForCategoryInMonthRequest =
    useGetTransactionsForCategoryInMonth({
      month: props.month,
      year: props.year,
      cat_id: props.categoryId,
      type: props.type,
    });

  const headers = [
    t('common.date'),
    t('common.description'),
    t('common.account'),
    t('common.amount'),
  ];

  // Loading
  useEffect(() => {
    if (getTransactionsForCategoryInMonthRequest.isFetching) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getTransactionsForCategoryInMonthRequest.isFetching]);

  // Error
  useEffect(() => {
    if (getTransactionsForCategoryInMonthRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getTransactionsForCategoryInMonthRequest.isError]);

  // Success
  useEffect(() => {
    if (getTransactionsForCategoryInMonthRequest.data) {
      setTrxList(getTransactionsForCategoryInMonthRequest.data);
    }
  }, [getTransactionsForCategoryInMonthRequest.data]);

  if (!getTransactionsForCategoryInMonthRequest.data) {
    return null;
  }

  const handleOnClose = () => {
    setTrxList([]);
    props.onClose();
  };

  return (
    <Dialog
      open={props.isOpen}
      onClose={handleOnClose}
      fullWidth={true}
      maxWidth="lg"
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minHeight: 300 }}>
            <TableHead>
              <TableRow>
                {headers.map((item: string) => (
                  <TableCell key={encodeURI(item)}>{item}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {trxList.map((item: Transaction) => (
                <TableRow key={encodeURI(item.transaction_id + '')}>
                  <TableCell>{`${getDayNumberFromUnixTimestamp(item.date_timestamp || 0)}/${getMonthShortStringFromUnixTimestamp(item.date_timestamp || 0)}/${getFullYearFromUnixTimestamp(item.date_timestamp || 0)}`}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {item.account_from_name
                      ? item.account_from_name
                      : item.account_to_name}
                  </TableCell>
                  <TableCell>
                    {formatNumberAsCurrency.invoke(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnClose} autoFocus>
          {t('common.goBack')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TransactionsTableDialog;
