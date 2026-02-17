import { Autocomplete, Stack } from '@mui/material';
import { IdLabelPair } from '../AddEditTransactionDialog.tsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';

type Props = {
  id: number;
  accounts: IdLabelPair[];
  selectedAccountFrom: IdLabelPair | null;
  selectedAccountTo: IdLabelPair | null;
  onAccountFromChange: (id: number, input: IdLabelPair | null) => void;
  onAccountToChange: (id: number, input: IdLabelPair | null) => void;
};

function ImportTrxStep2AccountsCell(props: Props) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} sx={{ mt: 2, mb: 2, width: 1 }}>
      <Autocomplete
        id="accountFrom"
        fullWidth
        value={props.selectedAccountFrom}
        onChange={(_event, value) => props.onAccountFromChange(props.id, value)}
        options={props.accounts}
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
        value={props.selectedAccountTo}
        onChange={(_event, value) => props.onAccountToChange(props.id, value)}
        options={props.accounts}
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
  );
}

export default memo(ImportTrxStep2AccountsCell);
