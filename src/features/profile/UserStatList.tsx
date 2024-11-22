import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import { UserStatsResponse } from '../../services/stats/statServices.ts';
import { useGetUserStats } from '../../services/stats/statHooks.ts';

type UiState = {
  isLoading: boolean;
  data?: UserStatsResponse;
};

const enum StateActionType {
  DataLoaded,
}

type StateAction = {
  type: StateActionType.DataLoaded;
  payload: UserStatsResponse;
};

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
        data: action.payload,
      };
  }
};

const UserStatList = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);

  const getUserStatsRequest = useGetUserStats();

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
    if (getUserStatsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getUserStatsRequest.isError]);

  // Success
  useEffect(() => {
    if (!getUserStatsRequest.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: getUserStatsRequest.data,
    });
  }, [getUserStatsRequest.data]);

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>{t('profile.nrTrxCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_trx ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrEntitiesCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_entities ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrCategoriesCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_categories ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrAccountsCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_accounts ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrBudgetsCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_budgets ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrRulesCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_rules ?? '-'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('profile.nrTagsCreated')}</TableCell>
          <TableCell>{state.data?.nr_of_tags ?? '-'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default UserStatList;
