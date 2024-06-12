import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';
import {
  generateDefsForGradients,
  generateFillArrayForGradients,
} from '../../utils/nivoUtils.ts';
import { ColorGradient } from '../../consts';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper/Paper';
import EmptyView from '../../components/EmptyView.tsx';

interface ChartDataItem {
  month: string;
  balance: number;
}

interface InternalChartDataItem extends ChartDataItem {
  color: string;
}

interface Props {
  data: ChartDataItem[];
}

export type MonthByMonthChartDataItem = {
  month: string;
  balance: number;
};

const MonthlyOverviewChart = ({ data }: Props) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState<InternalChartDataItem[]>([]);
  const [showEmptyView, setShowEmptyView] = useState(false);

  useEffect(() => {
    // Show empty view if all balances equal to zero
    const showEmptyView = !data.some((d) => d.balance != 0);
    setShowEmptyView(showEmptyView);

    if (!showEmptyView) {
      const transformedData = data.map((item) => ({
        ...item,
        color:
          item.balance < 0 ? ColorGradient.LightGray : ColorGradient.LightGreen,
      }));
      return setChartData(transformedData);
    }
  }, [data]);

  return (
    <>
      <Stack height={200} sx={{ display: showEmptyView ? 'none' : 'block' }}>
        <ResponsiveBar
          data={chartData as unknown as readonly BarDatum[]}
          keys={['balance']}
          indexBy="month"
          margin={{ top: 20, right: 0, bottom: 40, left: 0 }}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'food',
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          /*colors={getBarColor}*/
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
          defs={generateDefsForGradients()}
          fill={generateFillArrayForGradients()}
          theme={theme.nivo}
          tooltip={(item) => (
            <Paper
              sx={{
                fontSize: '12px',
                background: 'white',
                color: 'black',
                p: theme.spacing(1),
              }}
            >
              {item.formattedValue}
            </Paper>
          )}
        />
      </Stack>
      <Stack
        height={200}
        sx={{
          display: showEmptyView ? 'flex' : 'none',
        }}
      >
        <EmptyView />
      </Stack>
    </>
  );
};

export default MonthlyOverviewChart;
