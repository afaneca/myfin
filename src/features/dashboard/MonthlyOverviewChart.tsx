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
import EmptyView from '../../components/EmptyView.tsx';

export interface ChartDataItem {
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
    currentAmount: number,
    remainingAmount: number,
  ): ColorGradient => {
    const percentage =
      (currentAmount / (currentAmount + remainingAmount)) * 100;
    if (percentage < 75) return ColorGradient.LightGreen;
    else if (percentage < 90) return ColorGradient.Orange;

    return ColorGradient.Red;
  };

  useEffect(() => {
    const transformedData = data.map((item) => ({
      ...item,
      color:
        item.type == '1'
          ? ColorGradient.Dull
          : getColorGradientForCurrentAmount(
              item.value,
              data.findLast((di) => di.type == '1')?.value ?? 0,
            ),
    }));
    return setChartData(transformedData);
  }, [data]);
  return (
    <Stack height={200}>
      {data && data.length > 0 ? (
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
          // @ts-expect-error could assume different structural identities
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
      ) : (
        <EmptyView />
      )}
    </Stack>
  );
};

export default MonthlyOverviewChart;
