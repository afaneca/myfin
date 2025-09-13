import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { InsertInvitation, Send } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useGetBudgetListSummary } from '../../../services/budget/budgetHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { IdLabelPair } from '../../transactions/AddEditTransactionDialog.tsx';
import Grid from '@mui/material/Grid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBudgetSelected: (budgetId: bigint) => void;
};

const BudgetListSummaryDialog = (props: Props) => {
  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const getBudgetListSummaryRequest = useGetBudgetListSummary();
  const [selectedBudget, setSelectedBudget] = useState<IdLabelPair | null>(
    null,
  );
  const [budgetList, setBudgetList] = useState<IdLabelPair[]>([]);
  const [isCtaEnabled, setCtaEnabled] = useState(false);

  // Loading
  useEffect(() => {
    if (getBudgetListSummaryRequest.isFetching) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getBudgetListSummaryRequest.isFetching]);

  // Error
  useEffect(() => {
    if (getBudgetListSummaryRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getBudgetListSummaryRequest.isError]);

  // Success
  useEffect(() => {
    if (getBudgetListSummaryRequest.data) {
      setBudgetList(
        getBudgetListSummaryRequest.data.map((budget) => ({
          id: budget.budget_id,
          label: `${getMonthsFullName(budget.month)} ${budget.year}`,
        })),
      );
    }
  }, [getBudgetListSummaryRequest.data]);

  useEffect(() => {
    setCtaEnabled(selectedBudget != null);
  }, [selectedBudget]);

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth="xs"
    >
      <DialogTitle>{t('budgetDetails.cloneAPreviousMonth')}</DialogTitle>
      <DialogContent>
        <Grid spacing={2} rowSpacing={2} size={12}>
          <Autocomplete
            sx={{ paddingTop: 2 }}
            id="budget"
            options={budgetList}
            value={selectedBudget}
            onChange={(_, value) => setSelectedBudget(value)}
            isOptionEqualToValue={(option, value) => option.id == value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <InsertInvitation />
                    </InputAdornment>
                  ),
                }}
                label={t('budgetDetails.budget')}
              />
            )}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t('common.goBack')}</Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          disabled={!isCtaEnabled}
          onClick={() => props.onBudgetSelected(selectedBudget?.id || -1n)}
        >
          {t('budgetDetails.cloneBudgetCTA')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetListSummaryDialog;
