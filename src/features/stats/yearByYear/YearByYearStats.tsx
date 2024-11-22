import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  CategoryYearByYearDataItem,
  YearByYearStatsResponse,
} from '../../../services/stats/statServices.ts';
import { getCurrentYear } from '../../../utils/dateUtils.ts';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { useGetYearByYearData } from '../../../services/stats/statHooks.ts';
import YearByYearSearchableList, {
  YearByYearSearchableListItem,
} from './YearByYearSearchableList.tsx';
import TextField from '@mui/material/TextField/TextField';
import { Autocomplete, Divider } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import MyFinSankeyDiagram, {
  SankeyDiagramData,
  SankeyLink,
  SankeyNode,
} from '../../../components/MyFinSankeyDiagram.tsx';
import i18n from 'i18next';
import { useLoading } from '../../../providers/LoadingProvider.tsx';

type UiState = {
  isLoading: boolean;
  selectedYear: number;
  moneyFlowData?: SankeyDiagramData;
  categoryIncomeData?: YearByYearSearchableListItem[];
  categoryExpensesData?: YearByYearSearchableListItem[];
  entityIncomeData?: YearByYearSearchableListItem[];
  entityExpensesData?: YearByYearSearchableListItem[];
  tagIncomeData?: YearByYearSearchableListItem[];
  tagExpensesData?: YearByYearSearchableListItem[];
  minYear?: number;
  yearList?: number[];
};

const enum StateActionType {
  YearSelected,
  RequestStarted,
  RequestSuccess,
}

type StateAction =
  | { type: StateActionType.RequestStarted }
  | { type: StateActionType.RequestSuccess; payload: YearByYearStatsResponse }
  | { type: StateActionType.YearSelected; payload: number };

const createInitialState = (): UiState => {
  return {
    isLoading: true,
    selectedYear: getCurrentYear(),
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.RequestStarted:
      return {
        ...prevState,
        isLoading: true,
      };
    case StateActionType.RequestSuccess: {
      return {
        ...prevState,
        isLoading: false,
        categoryIncomeData: action.payload.categories.map((item) => ({
          name: item.name,
          amount: item.category_yearly_income,
        })),
        moneyFlowData: generateMoneyFlowData(action.payload.categories),
        categoryExpensesData: action.payload.categories.map((item) => ({
          name: item.name,
          amount: item.category_yearly_expense,
        })),
        entityIncomeData: action.payload.entities.map((item) => ({
          name: item.name,
          amount: item.entity_yearly_income,
        })),
        entityExpensesData: action.payload.entities.map((item) => ({
          name: item.name,
          amount: item.entity_yearly_expense,
        })),
        tagIncomeData: action.payload.tags.map((item) => ({
          name: item.name,
          amount: item.tag_yearly_income,
        })),
        tagExpensesData: action.payload.tags.map((item) => ({
          name: item.name,
          amount: item.tag_yearly_expense,
        })),
        minYear: action.payload.year_of_first_trx,
        yearList: generateYearList(action.payload.year_of_first_trx),
      };
    }
    case StateActionType.YearSelected:
      return {
        ...prevState,
        selectedYear: action.payload,
      };
  }
};

const generateMoneyFlowData = (
  categories: CategoryYearByYearDataItem[],
): SankeyDiagramData => {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const incomeNodeId = i18n.t('stats.income');

  nodes.push({ id: incomeNodeId, color: '' });

  let otherExpensesAcc = 0;
  categories
    .sort((a, b) => b.category_yearly_expense - a.category_yearly_expense)
    .forEach((category, index) => {
      if (index < 5) {
        const expenseId = `💸 ${category.name}`;
        nodes.push({ id: expenseId, color: '' });
        links.push({
          source: incomeNodeId,
          target: expenseId,
          value: category.category_yearly_expense,
        });
      } else {
        otherExpensesAcc += category.category_yearly_expense;
      }
    });
  // push others
  nodes.push({ id: i18n.t('stats.otherExpenses'), color: '' });
  links.push({
    source: incomeNodeId,
    target: i18n.t('stats.otherExpenses'),
    value: otherExpensesAcc,
  });

  let otherIncomeAcc = 0;
  categories
    .sort((a, b) => b.category_yearly_income - a.category_yearly_income)
    .forEach((category, index) => {
      if (index < 5) {
        const incomeId = `💰 ${category.name}`;
        nodes.push({ id: incomeId, color: '' });
        links.push({
          source: incomeId,
          target: incomeNodeId,
          value: category.category_yearly_income,
        });
      } else {
        otherIncomeAcc += category.category_yearly_income;
      }
    });
  // push others
  nodes.push({ id: i18n.t('stats.otherIncome'), color: '' });
  links.push({
    source: i18n.t('stats.otherIncome'),
    target: incomeNodeId,
    value: otherIncomeAcc,
  });

  return { nodes, links };
};

const generateYearList = (minYear: number) => {
  const yearList = [];
  for (let year = minYear; year <= getCurrentYear(); year++) {
    yearList.push(year);
  }
  return yearList;
};

const YearByYearStats = () => {
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const loader = useLoading();

  const [state, dispatch] = useReducer(reduceState, null, createInitialState);
  const getYearByYearStatsRequest = useGetYearByYearData(state.selectedYear);

  // Loading
  useEffect(() => {
    if (state.isLoading) loader.showLoading();
    else loader.hideLoading();
  }, [state.isLoading]);

  // Error
  useEffect(() => {
    if (getYearByYearStatsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getYearByYearStatsRequest.isError]);

  // Success
  useEffect(() => {
    if (!getYearByYearStatsRequest.data) return;
    dispatch({
      type: StateActionType.RequestSuccess,
      payload: getYearByYearStatsRequest.data,
    });
  }, [getYearByYearStatsRequest.data]);

  useEffect(() => {
    dispatch({
      type: StateActionType.RequestStarted,
    });
  }, [state.selectedYear]);

  return (
    <Grid container spacing={2}>
      {/* Year selection */}
      <Grid xs={12}>
        <Autocomplete
          fullWidth
          id="select-year"
          options={state.yearList ?? []}
          getOptionLabel={(option) => `${option}`}
          value={state.selectedYear}
          onChange={(_event, value) =>
            dispatch({
              type: StateActionType.YearSelected,
              payload: value ?? -1,
            })
          }
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label={t('stats.year')}
              required={true}
            />
          )}
        />
      </Grid>

      {/* Sankey Chart */}
      {state.moneyFlowData && (
        <Grid xs={12} height={500}>
          <MyFinSankeyDiagram chartData={state.moneyFlowData} />
        </Grid>
      )}

      {/* Category income */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.incomeByCategory')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.categoryIncomeData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>
      {/* Category expenses */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.expensesByCategory')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.categoryExpensesData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>

      {/* Entity income */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.incomeByEntity')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.entityIncomeData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>
      {/* Entity expenses */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.expensesByEntity')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.entityExpensesData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>

      {/* Tag income */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.incomeByTag')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.tagIncomeData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>
      {/* Tag expenses */}
      <Grid xs={12} md={6} mt={2}>
        <Typography variant="h5">{t('stats.expensesByTag')}</Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <YearByYearSearchableList
          list={state.tagExpensesData ?? []}
          isLoading={state.isLoading}
        />
      </Grid>
    </Grid>
  );
};

export default YearByYearStats;
