import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import { useTranslation } from 'react-i18next';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';
import {
  generateDefsForGradients,
  generateFillArrayForGradients,
} from '../../utils/nivoUtils.ts';
import { ColorGradient } from '../../consts';
import { useEffect, useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import EmptyView from '../../components/EmptyView.tsx';

interface ChartDataItem {
  month: string;
  balance: number;
}

interface InternalChartDataItem extends ChartDataItem {
  color: string;
  actualBalance?: number;
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
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<InternalChartDataItem[]>([]);
  const [showEmptyView, setShowEmptyView] = useState(false);
  const [minValue, setMinValue] = useState<number | 'auto'>('auto');
  const [maxValue, setMaxValue] = useState<number | 'auto'>('auto');

  // Memoize threshold calculation to avoid recalculating on every render
  const threshold = useMemo(() => {
    if (data.length === 0) return 0;
    const absValues = data.map((d) => Math.abs(d.balance)).sort((a, b) => a - b);
    const mid = Math.floor(absValues.length / 2);
    const median =
      absValues.length % 2 === 0 && absValues.length > 0
        ? (absValues[mid - 1] + absValues[mid]) / 2
        : absValues[mid] || 0;
    return median * 5; // Threshold is 5x median
  }, [data]);

  useEffect(() => {
    // Show empty view if all balances equal to zero
    const showEmptyView = !data.some((d) => d.balance != 0);
    setShowEmptyView(showEmptyView);

    if (!showEmptyView) {
      const transformedData = data.map((item) => {
        const isCapped = Math.abs(item.balance) > threshold && threshold > 0;
        const displayValue = isCapped
          ? (item.balance > 0 ? threshold : -threshold)
          : item.balance;

        return {
          month: item.month,
          balance: displayValue,
          actualBalance: isCapped ? item.balance : undefined, // Store actual value for tooltip
          color: item.balance < 0 ? ColorGradient.Dull : ColorGradient.LightGreen,
        };
      });
      setChartData(transformedData);

      // Calculate min/max values with padding for better visualization
      const displayValues = transformedData.map((d) => d.balance);
      const dataMin = Math.min(...displayValues);
      const dataMax = Math.max(...displayValues);
      const range = dataMax - dataMin;
      // Use a minimum padding when range is zero to avoid collapsed charts
      const padding =
        range === 0
          ? Math.max(Math.abs(dataMax) * 0.15, 1)
          : range * 0.15; // 15% padding

      setMinValue(dataMin < 0 ? dataMin - padding : 0);
      setMaxValue(dataMax + padding);
    }
  }, [data, threshold]);

  return (
    <>
      <Stack height={200} sx={{ display: showEmptyView ? 'none' : 'block' }}>
        <ResponsiveBar
          data={chartData as unknown as readonly BarDatum[]}
          keys={['balance']}
          indexBy="month"
          margin={{ top: 40, right: 0, bottom: 40, left: 0 }}
          valueScale={{ type: 'linear', min: minValue, max: maxValue }}
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
            legend: '',
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          /*colors={getBarColor}*/
          label={(d) => {
            if (d.value === 0) return '';
            const actualBalance = (d.data as any).actualBalance;
            const isCapped = actualBalance !== undefined;
            const valueToShow = isCapped ? actualBalance : d.value;
            return formatNumberAsCurrency(valueToShow) + (isCapped ? '*' : '');
          }}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 4]],
          }}
          labelSkipHeight={16}
          valueFormat={(value) => formatNumberAsCurrency(value)}
          markers={[
            {
              axis: 'y',
              value: 0,
              lineStyle: { stroke: theme.palette.divider, strokeWidth: 3 },
              legendOrientation: 'vertical',
            },
          ]}
          borderRadius={theme.shape.borderRadius as number}
          enableGridY={false}
          defs={generateDefsForGradients()}
          // @ts-expect-error could assume different structural identities
          fill={generateFillArrayForGradients()}
          theme={theme.nivo}
          tooltip={(item) => {
            const actualBalance = (item.data as any).actualBalance;
            const isCapped = actualBalance !== undefined;
            return (
              <Paper
                sx={{
                  fontSize: '12px',
                  background: 'white',
                  color: 'black',
                  p: theme.spacing(1),
                  whiteSpace: 'nowrap',
                }}
              >
                {isCapped ? (
                  <>
                    <strong>{formatNumberAsCurrency(actualBalance)}</strong>
                    <br />
                    <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                      {t('dashboard.chartValueAdjusted')}
                    </span>
                  </>
                ) : (
                  item.formattedValue
                )}
              </Paper>
            );
          }}
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
