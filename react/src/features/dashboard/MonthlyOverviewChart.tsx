import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { ResponsivePie } from '@nivo/pie';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';
import {
  generateDefsForGradients,
  generateFillArrayForGradients,
} from '../../utils/nivoUtils.ts';
import Paper from '@mui/material/Paper/Paper';
import { useEffect, useState } from 'react';
import { ColorGradient } from '../../consts';

interface ChartDataItem {
  id: string;
  type: string;
  value: number;
}

interface InternalChartDataItem extends ChartDataItem {
  color: string;
}

interface Props {
  data: ChartDataItem[];
}

const MonthlyOverviewChart = ({ data }: Props) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState<InternalChartDataItem[]>([]);

  const getColorGradientForCurrentAmount = (
    item: ChartDataItem,
  ): ColorGradient => {
    const current = item.value;
    const remaining =
      chartData.findLast((item) => item.type == '1')?.value ?? 0;
    const percentage = (current / (current + remaining)) * 100;
    if (percentage < 75) return ColorGradient.LightGreen;
    else if (percentage < 90) return ColorGradient.Orange;

    return ColorGradient.Red;
  };

  useEffect(() => {
    const transformedData = data.map((item) => ({
      ...item,
      color:
        item.type == '1'
          ? ColorGradient.LightGray
          : getColorGradientForCurrentAmount(item),
    }));
    return setChartData(transformedData);
  }, [data]);

  return (
    <Stack height={200}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 20, right: 10, bottom: 20, left: 10 }}
        startAngle={-90}
        endAngle={90}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 4]],
        }}
        activeOuterRadiusOffset={8}
        borderWidth={0}
        enableArcLinkLabels={false}
        arcLabel={'id'}
        valueFormat={(value) => formatNumberAsCurrency(value)}
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
            {item.datum.label}: <strong>{item.datum.formattedValue}</strong>
          </Paper>
        )}
      />
    </Stack>
  );
};

export default MonthlyOverviewChart;
