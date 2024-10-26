import { MonthlySnapshot } from '../../../services/invest/investServices.ts';
import { useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import Paper from '@mui/material/Paper/Paper';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';

type Props = {
  data: MonthlySnapshot[];
};

const PortfolioEvolutionChart = (props: Props) => {
  const theme = useTheme();
  const matchesMdScreen = useMediaQuery(theme.breakpoints.down('md'));

  type ChartData = {
    [monthYear: string]: {
      monthYear: string;
      currentValue: number;
      investedAmount: number;
    };
  };
  // Step 1: Group and Accumulate monthly values
  const accumulatedData: ChartData = props.data.reduce(
    (acc: ChartData, snapshot) => {
      const monthYear = `${snapshot.year}-${String(snapshot.month).padStart(2, '0')}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthYear,
          investedAmount: 0,
          currentValue: 0,
        };
      }

      // Accumulate values
      acc[monthYear].investedAmount +=
        parseFloat(snapshot.invested_amount + '') || 0;
      acc[monthYear].currentValue +=
        parseFloat(snapshot.current_value + '') || 0;

      return acc;
    },
    {},
  );

  // Step 2: Convert accumulated data to an array for charting
  const chartData = Object.values(accumulatedData).map((entry) => ({
    x: entry.monthYear,
    invested: entry.investedAmount,
    current: entry.currentValue,
  }));

  /*                                  */
  const monthlyData = [
    {
      id: 'current_value',
      data: chartData.map((snapshot) => ({
        x: snapshot.x, // Format as YYYY-MM
        y: snapshot.current, // Convert to number
      })),
    },
  ];

  return (
    <ResponsiveLine
      data={monthlyData}
      margin={{ top: 5, right: 5, bottom: 50, left: 50 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisLeft={!matchesMdScreen ? {} : null}
      axisBottom={
        !matchesMdScreen
          ? {
              tickSize: 2,
              tickPadding: 3,
              tickRotation: -55,
              legendPosition: 'middle',
              truncateTickAt: 40,
            }
          : null
      }
      pointSize={5}
      enableArea={true}
      areaOpacity={0.1}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabel="data.yFormatted"
      pointLabelYOffset={-12}
      enableTouchCrosshair={true}
      useMesh={true}
      colors={() => theme.palette.primary.main}
      tooltip={(item) => (
        <Paper
          sx={{
            fontSize: '12px',
            background: 'white',
            color: 'black',
            p: theme.spacing(1),
          }}
        >
          {String(item.point.data.x)}:{' '}
          <strong>{formatNumberAsCurrency(Number(item.point.data.y))}</strong>
        </Paper>
      )}
      theme={theme.nivo}
    />
  );
};

export default PortfolioEvolutionChart;
