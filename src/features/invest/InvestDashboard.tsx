import { useEffect, useReducer } from 'react';
import { Box, Card, CardContent, useMediaQuery, useTheme, Tooltip, IconButton } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import { useGetInvestStats } from '../../services/invest/investHooks.ts';
import {
  AssetType,
  GetInvestStatsResponse,
  InvestAsset,
} from '../../services/invest/investServices.ts';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../utils/textUtils.ts';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { getCurrentYear } from '../../utils/dateUtils.ts';
import DashboardPieChart, {
  ChartDataItem,
} from '../dashboard/DashboardPieChart.tsx';
import EmptyView from '../../components/EmptyView.tsx';
import { TFunction } from 'i18next';
import { ColorGradient } from '../../consts';
import Stack from '@mui/material/Stack';
import { useGetGradientColorForAssetType } from './InvestUtilHooks.ts';
import PercentageChip from '../../components/PercentageChip.tsx';
import { useFormatNumberAsCurrency } from '../../utils/textHooks.ts';
import { HelpOutline } from '@mui/icons-material';

type UiState = {
  currentValue: number;
  totalInvestedFormatted: string;
  currentValueFormatted: string;
  currentYearRoiValueFormatted: string;
  currentYearRoiPercentageFormatted: string;
  currentYearRoiPercentageValue: number;
  globalRoiValueFormatted: string;
  globalRoiPercentageFormatted: string;
  globalRoiPercentageValue: number;
  assetDistributionPieChartData?: ChartDataItem[];
  topPerformingAssets?: InvestAsset[];
} | null;

const enum StateActionType {
  DataLoaded,
}

type StateAction = {
  type: StateActionType.DataLoaded;
  payload: GetInvestStatsResponse & {
    t: TFunction<'translation', undefined>;
  } & { getGradientColorForAssetType: (assetType: AssetType) => ColorGradient };
};

const createInitialState = (): UiState => {
  return null;
};

const TopPerformerCard = (props: {
  isExpanded: boolean;
  index: number;
  assetType: string;
  assetName: string;
  percentage: number;
  value: number;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();
  const borderRadius = theme.shape.borderRadius;
  const cardStyle = {
    borderRadius:
      props.index === 1
        ? `${borderRadius}px ${borderRadius}px 0 0`
        : props.index === 3
          ? `0 0 ${borderRadius}px ${borderRadius}px`
          : '0',
  };

  return (
    <Card
      style={cardStyle}
      variant={props.isExpanded ? 'elevation' : 'outlined'}
      sx={{
        ':hover': {
          boxShadow: 20, // theme.shadows[20]
        },
        backgroundColor:
          theme.palette.mode === 'dark' || !props.isExpanded
            ? 'background.paper'
            : 'background.default',
      }}
    >
      <CardContent>
        <Box
          borderRadius={0}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Stack>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              {`#${props.index} | ${props.assetType} ${
                props.isExpanded
                  ? ''
                  : `| ${t('investments.percentageOfPortfolio', {
                      percentage: formatNumberAsPercentage(props.percentage),
                    })}`
              }`}
            </Typography>
            <Typography
              variant={props.isExpanded ? 'h5' : 'h6'}
              component="div"
            >
              {props.assetName}
            </Typography>
            {props.isExpanded && (
              <Typography variant="body2">
                {t('investments.percentageOfPortfolio', {
                  percentage: formatNumberAsPercentage(props.percentage),
                })}
              </Typography>
            )}
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              variant="outlined"
              label={formatNumberAsCurrency.invoke(props.value)}
              color={props.value < 0 ? 'warning' : 'success'}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const SummaryCard = (props: {
  title: string;
  absoluteValue: string;
  percentageValue?: number;
  helpKey?: string;
  helpAriaLabel?: string;
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: 120,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'background.paper'
            : 'background.default',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: 14 }} color="text.secondary">
            {props.title}
          </Typography>
          {props.helpKey && (
            <Tooltip title={props.helpKey} placement="top">
              <IconButton
                aria-label={props.helpAriaLabel}
                size="small"
                sx={{ ml: 0.5, color: 'text.secondary', opacity: 0.7 }}
              >
                <HelpOutline sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" component="div">
            {props.absoluteValue}
          </Typography>
          {props.percentageValue && (
            <PercentageChip
              percentage={Number(props.percentageValue)}
              sx={{ mt: 1, alignSelf: 'center' }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const getLocalizedTextForAssetType = (
  t: TFunction<'translation', undefined>,
  key: AssetType,
): string => {
  switch (key) {
    case AssetType.Etf:
      return t('investments.etf');
    case AssetType.Crypto:
      return t('investments.crypto');
    case AssetType.InvestmentFunds:
      return t('investments.investmentFunds');
    case AssetType.Ppr:
      return t('investments.ppr');
    case AssetType.FixedIncome:
      return t('investments.fixedIncome');
    case AssetType.Stocks:
      return t('investments.stocks');
    case AssetType.IndexFunds:
      return t('investments.indexFunds');
    case AssetType.P2pLoans:
      return t('investments.p2pLoans');
    default:
      return '';
  }
};

const reduceState = (prevState: UiState, action: StateAction): UiState => {
  switch (action.type) {
    case StateActionType.DataLoaded: {
      const chartData = action.payload.current_value_distribution
        .filter((item) => item.percentage > 0)
        .map((item) => {
          return {
            id: getLocalizedTextForAssetType(
              action.payload.t,
              item.type as AssetType,
            ),
            color: action.payload.getGradientColorForAssetType(
              item.type as AssetType,
            ),
            value: item.percentage,
          };
        });

      return {
        ...prevState,
        currentValue: action.payload.total_current_value,
        totalInvestedFormatted: formatNumberAsCurrency(
          action.payload.total_currently_invested_value,
        ),
        currentValueFormatted: formatNumberAsCurrency(
          action.payload.total_current_value,
        ),
        currentYearRoiValueFormatted: formatNumberAsCurrency(
          action.payload.current_year_roi_value,
        ),
        currentYearRoiPercentageFormatted: formatNumberAsPercentage(
          action.payload.current_year_roi_percentage,
          true,
        ),
        currentYearRoiPercentageValue:
          action.payload.current_year_roi_percentage,
        globalRoiValueFormatted: formatNumberAsCurrency(
          action.payload.global_roi_value,
        ),
        globalRoiPercentageFormatted: formatNumberAsPercentage(
          action.payload.global_roi_percentage,
          true,
        ),
        globalRoiPercentageValue: action.payload.global_roi_percentage,
        assetDistributionPieChartData: chartData,
        topPerformingAssets: action.payload.top_performing_assets,
      };
    }
  }
};

const InvestDashboard = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const theme = useTheme();
  const matchesLgScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const getInvestStatsRequest = useGetInvestStats();
  const getGradientColorForAssetClass = useGetGradientColorForAssetType();

  const [state, dispatch] = useReducer(reduceState, t, createInitialState);

  // Loading
  useEffect(() => {
    if (getInvestStatsRequest.isFetching) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getInvestStatsRequest.isFetching]);

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
        ...getInvestStatsRequest.data,
        t,
        ...{
          getGradientColorForAssetType: getGradientColorForAssetClass.invoke,
        },
      },
    });
  }, [getInvestStatsRequest.data]);

  if (!state) return null;

  return (
    <Grid container spacing={2}>
      <Grid container size={12}>
        <Grid
          size={{
            xs: 12,
            sm: 5,
          }}
        >
          {state.assetDistributionPieChartData &&
          state.assetDistributionPieChartData.length > 0 ? (
            <DashboardPieChart
              data={state.assetDistributionPieChartData}
              linkLabelTruncateLimit={10}
              customPieProps={{
                /*arcLabel: 'id',*/
                enableArcLabels: false,
                enableArcLinkLabels: !matchesLgScreen,
                margin: matchesLgScreen
                  ? { top: 10, right: 10, bottom: 10, left: 10 }
                  : { top: 50, right: 120, bottom: 50, left: 120 },
                valueFormat: (value) => formatNumberAsPercentage(value),
              }}
            />
          ) : (
            <EmptyView />
          )}
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 7,
          }}
        >
          <Typography variant="overline" color="text.secondary" gutterBottom>
            {t('investments.topPerformers')}
          </Typography>
          {[0, 1, 2].map(
            (index) =>
              state.topPerformingAssets?.[index] && (
                <TopPerformerCard
                  key={index}
                  isExpanded={index == 0}
                  index={index + 1}
                  assetType={getLocalizedTextForAssetType(
                    t,
                    state.topPerformingAssets[index].type,
                  )}
                  assetName={state.topPerformingAssets[index].name}
                  percentage={
                    (state.topPerformingAssets[index].current_value /
                      state.currentValue) *
                    100
                  }
                  value={state.topPerformingAssets[index].absolute_roi_value}
                />
              ),
          )}
        </Grid>
      </Grid>
      <Grid container alignContent="center" textAlign="center" size={12}>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <SummaryCard
            title={t('investments.totalInvested')}
            absoluteValue={state.totalInvestedFormatted}
            helpKey={t('investments.summaryHelp.totalInvested')}
            helpAriaLabel={t('investments.summaryHelp.totalInvestedAriaLabel')}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <SummaryCard
            title={t('investments.currentValue')}
            absoluteValue={state.currentValueFormatted}
            helpKey={t('investments.summaryHelp.currentValue')}
            helpAriaLabel={t('investments.summaryHelp.currentValueAriaLabel')}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <SummaryCard
            title={`ROI ${getCurrentYear()}`}
            absoluteValue={state.currentYearRoiValueFormatted}
            percentageValue={state.currentYearRoiPercentageValue}
            helpKey={t('investments.summaryHelp.currentYearROI')}
            helpAriaLabel={t('investments.summaryHelp.currentYearROIAriaLabel')}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <SummaryCard
            title={t('investments.globalROI')}
            absoluteValue={state.globalRoiValueFormatted}
            percentageValue={state.globalRoiPercentageValue}
            helpKey={t('investments.summaryHelp.globalROI')}
            helpAriaLabel={t('investments.summaryHelp.globalROIAriaLabel')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InvestDashboard;
