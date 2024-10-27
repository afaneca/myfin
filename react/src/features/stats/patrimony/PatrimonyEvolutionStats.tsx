import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useReducer } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  NamedBalanceSnapshot,
  useGetBalanceSnapshots,
} from '../../../services/stats/statHooks.ts';
import PatrimonyEvolutionList, {
  PatrimonyEvoChartDataItem,
} from './PatrimonyEvolutionList.tsx';
import { NamedAccountSnapshot } from '../../../services/stats/statServices.ts';
import PatrimonyEvolutionChart from './PatrimonyEvolutionChart.tsx';
import TextField from '@mui/material/TextField/TextField';
import { Autocomplete } from '@mui/material';

type UiState = {
  isLoading: boolean;
  filteredAccountId?: bigint;
  snapshotData?: NamedBalanceSnapshot;
};

const enum StateActionType {
  DataLoaded,
  AccountSelected,
}

type StateAction =
  | {
      type: StateActionType.DataLoaded;
      payload: NamedBalanceSnapshot;
    }
  | { type: StateActionType.AccountSelected; payload?: bigint };

const createInitialState = (): UiState => {
  return {
    isLoading: true,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded:
      return {
        ...prevState,
        isLoading: false,
        snapshotData: action.payload,
      };
    case StateActionType.AccountSelected:
      return {
        ...prevState,
        filteredAccountId: action.payload,
      };
  }
};

/**
 * Returns an aggregated balance amount for the given snapshot
 * @param snapshot the snapshot
 * @param filteredAccountId the id of the account to filter by. If not set, all account balances will be aggregated
 */
const getAggregatedSnapshotBalance = (
  snapshot: NamedAccountSnapshot[],
  filteredAccountId?: bigint,
) => {
  return snapshot.reduce((acc, cur) => {
    if (!filteredAccountId) {
      return acc + Number(cur.balance);
    }
    return cur.account_id === filteredAccountId
      ? acc + Number(cur.balance)
      : acc;
  }, 0);
};

const PatrimonyEvolutionStats = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getBalanceSnapshotsRequest = useGetBalanceSnapshots();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  // Loading
  useEffect(() => {
    if (state.isLoading) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [state.isLoading]);

  // Error
  useEffect(() => {
    if (getBalanceSnapshotsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getBalanceSnapshotsRequest.isError]);

  // Success
  useEffect(() => {
    if (!getBalanceSnapshotsRequest.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: getBalanceSnapshotsRequest.data,
    });
  }, [getBalanceSnapshotsRequest.data]);

  const patrimonyEvoData: PatrimonyEvoChartDataItem[] = useMemo(() => {
    if (!state.snapshotData || state.snapshotData.snapshots.length < 1)
      return [];
    let prevBalance: number;

    return state.snapshotData.snapshots.map((snapshot) => {
      const finalBalance = getAggregatedSnapshotBalance(
        snapshot.account_snapshots,
        state.filteredAccountId,
      );
      const data = {
        month: snapshot.month,
        year: snapshot.year,
        previousBalance: prevBalance,
        finalBalance: finalBalance,
        monthBalance: finalBalance - prevBalance,
        growthRate: ((finalBalance - prevBalance) / prevBalance) * -100,
      };
      prevBalance = finalBalance;
      return data;
    });
  }, [state.snapshotData, state.filteredAccountId]);

  return (
    <Grid container spacing={2} xs={12}>
      <Grid xs={4}>
        <Autocomplete
          fullWidth
          id="account-from-condition"
          options={state.snapshotData?.accounts ?? []}
          getOptionLabel={(option) => option.name || ''}
          value={
            state.snapshotData?.accounts.find(
              (account) => account.account_id === state.filteredAccountId,
            ) || null
          }
          onChange={(_event, value) =>
            dispatch({
              type: StateActionType.AccountSelected,
              payload: value?.account_id,
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
              label={t('stats.allAccounts')}
              required={false}
            />
          )}
        />
      </Grid>
      <Grid xs={12} height={400}>
        <PatrimonyEvolutionChart list={patrimonyEvoData} />
      </Grid>
      <Grid xs={12} mt={4}>
        <PatrimonyEvolutionList list={patrimonyEvoData} />
      </Grid>
    </Grid>
  );
};

export default PatrimonyEvolutionStats;
