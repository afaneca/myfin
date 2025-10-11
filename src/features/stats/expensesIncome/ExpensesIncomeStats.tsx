import { Autocomplete, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Grid';
import {
  CategoryExpensesIncomeEvolutionItem,
  GetCategoriesEntitiesTagsResponse,
} from '../../../services/stats/statServices.ts';
import {
  useGetCategoriesEntitiesTags,
  useGetCategoryExpensesEvolution,
  useGetCategoryIncomeEvolution,
  useGetEntityExpensesEvolution,
  useGetEntityIncomeEvolution,
  useGetTagExpensesEvolution,
  useGetTagIncomeEvolution,
} from '../../../services/stats/statHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import ExpensesIncomeChart from './ExpensesIncomeChart.tsx';
import ExpensesIncomeList from './ExpensesIncomeList.tsx';

export enum ExpensesIncomeStatPeriod {
  Month = 'month',
  Year = 'year',
}

export enum TrxType {
  Income = 'income',
  Expenses = 'expenses',
}

enum Identifier {
  Category = 'category',
  Entity = 'entity',
  Tag = 'tag',
}

type IdentifierOption = {
  id: bigint;
  name: string;
  identifier: Identifier;
};

type UiState = {
  isLoading: boolean;
  type: TrxType;
  selectedIdentifier: IdentifierOption | null;
  selectedPeriod: ExpensesIncomeStatPeriod;
  identifierList: IdentifierOption[];
  statData?: CategoryExpensesIncomeEvolutionItem[];
  rawStatData?: CategoryExpensesIncomeEvolutionItem[];
};

const enum StateActionType {
  IdentifierSelected,
  PeriodSelected,
  RequestStarted,
  InitialRequestSuccess,
  RequestSuccess,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | {
      type: StateActionType.InitialRequestSuccess;
      payload: GetCategoriesEntitiesTagsResponse;
    }
  | {
      type: StateActionType.RequestSuccess;
      payload: CategoryExpensesIncomeEvolutionItem[];
    }
  | {
      type: StateActionType.IdentifierSelected;
      payload: IdentifierOption | null;
    }
  | { type: StateActionType.PeriodSelected; payload: ExpensesIncomeStatPeriod };

const createInitialState = (args: { type: TrxType }): UiState => {
  return {
    isLoading: true,
    type: args.type,
    selectedPeriod: ExpensesIncomeStatPeriod.Month,
    identifierList: [],
    selectedIdentifier: null,
  };
};

const aggregateDataByYear = (data: CategoryExpensesIncomeEvolutionItem[]) => {
  // Create a Map to store year totals
  const yearTotals = new Map<number, number>();

  // Sum up values for each year
  data.forEach(({ year, value }) => {
    const currentTotal = yearTotals.get(year) || 0;
    yearTotals.set(year, currentTotal + value);
  });

  // Convert Map to array of YearData objects
  return Array.from(yearTotals.entries()).map(([year, value]) => ({
    month: -1,
    year,
    value,
  }));
};

const processStatData = (
  rawData: CategoryExpensesIncomeEvolutionItem[],
  selectedPeriod: ExpensesIncomeStatPeriod,
) => {
  return selectedPeriod == ExpensesIncomeStatPeriod.Month
    ? rawData
    : aggregateDataByYear(rawData);
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.InitialRequestSuccess: {
      const categoryIdentifiers = action.payload.categories.map((c) => ({
        id: c.category_id,
        name: c.name,
        identifier: Identifier.Category,
      }));
      const entityIdentifiers = action.payload.entities.map((c) => ({
        id: c.entity_id,
        name: c.name,
        identifier: Identifier.Entity,
      }));
      const tagIdentifiers = action.payload.tags.map((c) => ({
        id: c.tag_id,
        name: c.name,
        identifier: Identifier.Tag,
      }));
      return {
        ...prevState,
        isLoading: false,
        identifierList: [
          ...categoryIdentifiers,
          ...entityIdentifiers,
          ...tagIdentifiers,
        ],
      };
    }

    case StateActionType.RequestSuccess:
      return {
        ...prevState,
        isLoading: false,
        rawStatData: action.payload,
        statData: processStatData(action.payload, prevState.selectedPeriod),
      };
    case StateActionType.IdentifierSelected:
      return {
        ...prevState,
        selectedIdentifier: action.payload,
      };
    case StateActionType.PeriodSelected: {
      return {
        ...prevState,
        selectedPeriod: action.payload,
        statData: processStatData(prevState.rawStatData ?? [], action.payload),
      };
    }
  }
};

type Props = {
  trxType: TrxType;
};

const ExpensesIncomeStats = (props: Props) => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(
    reduceState,
    { type: props.trxType },
    createInitialState,
  );

  const getCategoriesEntitiesTagsRequest = useGetCategoriesEntitiesTags();
  // Expenses
  const getCategoryExpensesEvolutionRequest = useGetCategoryExpensesEvolution(
    state.selectedIdentifier?.identifier == Identifier.Category &&
      props.trxType == TrxType.Expenses
      ? state.selectedIdentifier.id
      : null,
  );
  const getEntityExpensesEvolutionRequest = useGetEntityExpensesEvolution(
    state.selectedIdentifier?.identifier == Identifier.Entity &&
      props.trxType == TrxType.Expenses
      ? state.selectedIdentifier.id
      : null,
  );
  const getTagExpensesEvolutionRequest = useGetTagExpensesEvolution(
    state.selectedIdentifier?.identifier == Identifier.Tag &&
      props.trxType == TrxType.Expenses
      ? state.selectedIdentifier.id
      : null,
  );
  // Income
  const getCategoryIncomeEvolutionRequest = useGetCategoryIncomeEvolution(
    state.selectedIdentifier?.identifier == Identifier.Category &&
      props.trxType == TrxType.Income
      ? state.selectedIdentifier.id
      : null,
  );
  const getEntityIncomeEvolutionRequest = useGetEntityIncomeEvolution(
    state.selectedIdentifier?.identifier == Identifier.Entity &&
      props.trxType == TrxType.Income
      ? state.selectedIdentifier.id
      : null,
  );
  const getTagIncomeEvolutionRequest = useGetTagIncomeEvolution(
    state.selectedIdentifier?.identifier == Identifier.Tag &&
      props.trxType == TrxType.Income
      ? state.selectedIdentifier.id
      : null,
  );

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
    if (
      getCategoryExpensesEvolutionRequest.isError ||
      getEntityExpensesEvolutionRequest.isError ||
      getTagExpensesEvolutionRequest.isError ||
      getCategoriesEntitiesTagsRequest.isError ||
      getCategoryIncomeEvolutionRequest.isError ||
      getEntityIncomeEvolutionRequest.isError ||
      getTagIncomeEvolutionRequest.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    getCategoryExpensesEvolutionRequest.isError,
    getEntityExpensesEvolutionRequest.isError,
    getTagExpensesEvolutionRequest.isError,
    getCategoriesEntitiesTagsRequest.isError,
    getCategoryIncomeEvolutionRequest.isError,
    getEntityIncomeEvolutionRequest.isError,
    getTagIncomeEvolutionRequest.isError,
  ]);

  // Success
  useEffect(() => {
    if (!getCategoriesEntitiesTagsRequest.data) return;
    dispatch({
      type: StateActionType.InitialRequestSuccess,
      payload: getCategoriesEntitiesTagsRequest.data,
    });
  }, [getCategoriesEntitiesTagsRequest.data]);

  useEffect(() => {
    if (!getCategoryExpensesEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getCategoryExpensesEvolutionRequest.data,
    });
  }, [getCategoryExpensesEvolutionRequest.data]);

  useEffect(() => {
    if (!getEntityExpensesEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getEntityExpensesEvolutionRequest.data,
    });
  }, [getEntityExpensesEvolutionRequest.data]);

  useEffect(() => {
    if (!getTagExpensesEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getTagExpensesEvolutionRequest.data,
    });
  }, [getTagExpensesEvolutionRequest.data]);

  useEffect(() => {
    if (!getCategoryIncomeEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getCategoryIncomeEvolutionRequest.data,
    });
  }, [getCategoryIncomeEvolutionRequest.data]);

  useEffect(() => {
    if (!getEntityIncomeEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getEntityIncomeEvolutionRequest.data,
    });
  }, [getEntityIncomeEvolutionRequest.data]);

  useEffect(() => {
    if (!getTagIncomeEvolutionRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getTagIncomeEvolutionRequest.data,
    });
  }, [getTagIncomeEvolutionRequest.data]);

  useEffect(() => {
    if (!state.selectedIdentifier) return;
    dispatch({ type: StateActionType.RequestStarted });
  }, [state.selectedIdentifier]);

  const onPeriodSelected = (
    _: React.MouseEvent<HTMLElement>,
    newPeriod: string | null,
  ) => {
    if (
      newPeriod !== null &&
      Object.values(ExpensesIncomeStatPeriod).includes(
        newPeriod as ExpensesIncomeStatPeriod,
      )
    ) {
      dispatch({
        type: StateActionType.PeriodSelected,
        payload: newPeriod as ExpensesIncomeStatPeriod,
      });
    }
  };

  return (
    <Grid container spacing={2} size={12}>
      <Grid size={12}>
        <Stack direction="row" spacing={2}>
          {/* Period selection */}
          <ToggleButtonGroup
            value={state?.selectedPeriod}
            exclusive
            onChange={onPeriodSelected}
            size={'small'}
          >
            <ToggleButton
              value={ExpensesIncomeStatPeriod.Month}
              aria-label={t('stats.month')}
            >
              {t('stats.month')}
            </ToggleButton>
            <ToggleButton
              value={ExpensesIncomeStatPeriod.Year}
              aria-label={t('stats.year')}
            >
              {t('stats.year')}
            </ToggleButton>
          </ToggleButtonGroup>
          {/* Category/Entity/Tag selection */}
          <Autocomplete
            fullWidth
            id="select-identifier"
            options={state.identifierList}
            getOptionLabel={(option) => option.name || ''}
            value={state.selectedIdentifier}
            onChange={(_event, value) =>
              dispatch({
                type: StateActionType.IdentifierSelected,
                payload: value ?? null,
              })
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            groupBy={(option) => {
              switch (option.identifier) {
                case Identifier.Category:
                  return t('transactions.category');
                case Identifier.Entity:
                  return t('transactions.entity');
                case Identifier.Tag:
                  return t('tags.tag');
              }
            }}
            /*renderGroup={(params) => {
              <li key={params.key}>
                <GroupHeader>{params.group}</GroupHeader>
                <GroupHeader>{params.children}</GroupHeader>
              </li>
            }}*/
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label={t('stats.chooseACategory')}
                required={false}
              />
            )}
          />
        </Stack>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 2,
        }}
      ></Grid>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
      ></Grid>
      {/* Stats */}
      {state.statData && (
        <>
          <Grid size={12}>
            <ExpensesIncomeChart
              list={state.statData}
              period={state.selectedPeriod}
            />
          </Grid>
          <Grid size={12}>
            <ExpensesIncomeList
              list={state.statData}
              period={state.selectedPeriod}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ExpensesIncomeStats;
