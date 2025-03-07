import Paper from '@mui/material/Paper/Paper';
import { LineSvgProps, ResponsiveLine, Serie } from '@nivo/line';
import { useMediaQuery, useTheme } from '@mui/material';
import { useFormatNumberAsCurrency } from '../utils/textHooks.ts';

type Props = {
  chartData: Serie[];
  customLineProps?: Partial<LineSvgProps>;
};

const MyFinLineChart = (props: Props) => {
  const theme = useTheme();
  const matchesMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

  return (
    <ResponsiveLine
      data={props.chartData}
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
          <strong>
            {formatNumberAsCurrency.invoke(Number(item.point.data.y))}
          </strong>
        </Paper>
      )}
      theme={theme.nivo}
      {...props.customLineProps}
    />
  );
};

export default MyFinLineChart;
