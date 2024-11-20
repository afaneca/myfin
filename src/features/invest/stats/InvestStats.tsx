import { Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffect, useReducer } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { useGetInvestStats } from '../../../services/invest/investHooks.ts';
import {
  AssetType,
  GetInvestStatsResponse,
  InvestAsset,
  MonthlySnapshot,
} from '../../../services/invest/investServices.ts';
import Typography from '@mui/material/Typography/Typography';
import DashboardPieChart, {
  ChartDataItem,
} from '../../dashboard/DashboardPieChart.tsx';
import {
  useGetGradientColorForAssetType,
  useGetLocalizedAssetType,
} from '../InvestUtilHooks.ts';
import { ColorGradient } from '../../../consts';
import EmptyView from '../../../components/EmptyView.tsx';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import AssetRoiList from './AssetRoiList.tsx';
import CombinedRoiByYearList, {
  CombinedRoiByYearData,
} from './CombinedRoiByYearList.tsx';
import PortfolioEvolutionChart from './PortfolioEvolutionChart.tsx';

type UiState = {
  isLoading: boolean;
  distributionByAssetClassData?: ChartDataItem[];
  distributionByAssetData?: ChartDataItem[];
  assets?: InvestAsset[];
  combinedRoiByYearData?: CombinedRoiByYearData[];
  monthlySnapshots?: MonthlySnapshot[];
};

const enum StateActionType {
  DataLoaded,
}

type StateAction = {
  type: StateActionType.DataLoaded;
  payload: {
    data: GetInvestStatsResponse;
    getLocalizedAssetName: (assetType: AssetType) => string;
    getGradientColorForAssetType: (assetType: AssetType) => ColorGradient;
  };
};

const createInitialState = (): UiState => {
  return {
    isLoading: true,
  };
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded: {
      const assetClassChartData =
        action.payload.data.current_value_distribution.map((item, _index) => {
          const [key, value] = Object.entries(item)[0];

          return {
            id: action.payload.getLocalizedAssetName(key as AssetType),
            color: action.payload.getGradientColorForAssetType(
              key as AssetType,
            ),
            value: value,
          };
        });

      const assetChartData = action.payload.data.top_performing_assets.map(
        (item) => {
          return {
            id: item.name,
            value:
              (item.current_value / action.payload.data.total_current_value) *
              100,
            color: '',
            altValue: formatNumberAsCurrency(item.current_value),
          };
        },
      );

      const combinedRoiByYear = Object.entries(
        action.payload.data.combined_roi_by_year,
      ).map(([year, data]) => ({
        year: parseInt(year),
        ...data,
      }));
      return {
        ...prevState,
        isLoading: false,
        distributionByAssetClassData: assetClassChartData,
        distributionByAssetData: assetChartData,
        assets: action.payload.data.top_performing_assets,
        combinedRoiByYearData: combinedRoiByYear,
        monthlySnapshots: action.payload.data.monthly_snapshots,
      };
    }
  }
};

const InvestStats = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getLocalizedAssetTypeText = useGetLocalizedAssetType();
  const getGradientColorForAssetClass = useGetGradientColorForAssetType();

  const getInvestStatsRequest = useGetInvestStats();
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
    if (getInvestStatsRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getInvestStatsRequest.isError]);

  // Success
  useEffect(() => {
    if (!getInvestStatsRequest.data) return;
    dispatch({
      type: StateActionType.DataLoaded,
      payload: {
        data: getInvestStatsRequest.data,
        getLocalizedAssetName: getLocalizedAssetTypeText.invoke,
        getGradientColorForAssetType: getGradientColorForAssetClass.invoke,
      },
    });
  }, [getInvestStatsRequest.data]);

  return (
    <Grid container spacing={2} xs={12}>
      <SectionHeader title={t('investments.distribution')} />
      <Grid xs={12} md={6} sx={{ minHeight: 10 }}>
        {state.distributionByAssetClassData &&
        state.distributionByAssetClassData.length > 0 ? (
          <DashboardPieChart
            data={state.distributionByAssetClassData ?? []}
            customPieProps={{
              valueFormat: (value) => formatNumberAsPercentage(value),
              margin: { top: 65, right: 65, bottom: 65, left: 65 },
            }}
          />
        ) : (
          <EmptyView />
        )}
        <Typography
          variant="subtitle1"
          sx={{ textAlign: 'center', display: 'block' }}
        >
          {t('investments.assetClasses')}
        </Typography>
      </Grid>
      <Grid xs={12} md={6} sx={{ minHeight: 100 }}>
        {state.distributionByAssetData &&
        state.distributionByAssetData.length > 0 ? (
          <DashboardPieChart
            data={state.distributionByAssetData ?? []}
            customPieProps={{
              valueFormat: (value) => formatNumberAsPercentage(value),
              margin: { top: 65, right: 65, bottom: 65, left: 65 },
            }}
          />
        ) : (
          <EmptyView />
        )}
        <Typography
          variant="subtitle1"
          sx={{ textAlign: 'center', display: 'block' }}
        >
          {t('investments.asset')}
        </Typography>
      </Grid>
      <SectionHeader title={t('investments.returnsByAsset')} />
      <Grid xs={12}>
        <AssetRoiList list={state?.assets ?? []} />
      </Grid>
      <SectionHeader title={t('investments.returnsByAssetClass')} />
      <Grid xs={12}>
        <i>{t('common.soon')}...</i>
      </Grid>
      <SectionHeader title={t('investments.combinedPerformanceByYear')} />
      <Grid xs={12}>
        <CombinedRoiByYearList list={state?.combinedRoiByYearData ?? []} />
      </Grid>
      <SectionHeader title={t('investments.portfolioEvolution')} />
      <Grid xs={12} sx={{ height: 300 }}>
        <PortfolioEvolutionChart data={state?.monthlySnapshots ?? []} />
      </Grid>
    </Grid>
  );
};

const SectionHeader = ({ title }: { title: string }) => {
  return (
    <Grid xs={12} mt={2}>
      <Typography variant="h5">{title}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Grid>
  );
};

export default InvestStats;
