import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { ResponsiveBar } from '@nivo/bar';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';

interface ChartDataItem {
  month: string;
  balance: number;
}

interface Props {
  data: ChartDataItem[];
}

const MonthlyOverviewChart = ({ data }: Props) => {
  const theme = useTheme();

  const getBarColor = (bar: any) => {
    return bar.value > 0
      ? theme.palette.success.light
      : theme.palette.warning.light;
  };

  return (
    <Stack height={200}>
      <ResponsiveBar
        data={data}
        keys={['balance']}
        indexBy="month"
        margin={{ top: 20, right: 0, bottom: 40, left: 0 }}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={getBarColor}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 4]],
        }}
        valueFormat={(value) => formatNumberAsCurrency(value)}
        markers={[
          {
            axis: 'y',
            value: 0,
            lineStyle: { stroke: theme.palette.divider, strokeWidth: 3 },
            legendOrientation: 'vertical',
          },
        ]}
        borderRadius={theme.shape.borderRadius}
        enableGridY={false}
        theme={theme.nivo}
      />
    </Stack>
  );
};

export default MonthlyOverviewChart;
