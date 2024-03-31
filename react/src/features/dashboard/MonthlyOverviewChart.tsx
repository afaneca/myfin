import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { Pie, ResponsivePie } from '@nivo/pie';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';
import AutoSizer from 'react-virtualized-auto-sizer';

interface ChartDataItem {
  id: string;
  type: string;
  value: number;
}

interface Props {
  data: ChartDataItem[];
}

const MonthlyOverviewChart = ({ data }: Props) => {
  const theme = useTheme();

  const getSliceColor = (bar: any) => {
    return bar.data.type == '0'
      ? theme.palette.success.light
      : theme.palette.warning.light;
  };

  return (
    <Stack height={200}>
      <ResponsivePie
        data={data}
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
        colors={getSliceColor}
        enableArcLinkLabels={false}
        arcLabel={'id'}
        valueFormat={(value) => formatNumberAsCurrency(value)}
        theme={theme.nivo}
      />
    </Stack>
    /*<Stack height={200}>
      <AutoSizer style={{ width: '100%' }}>
        {({ height, width }) => (
          <Pie
            data={data}
            height={height}
            width={width}
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
            colors={getSliceColor}
            enableArcLinkLabels={false}
            arcLabel={'id'}
            valueFormat={(value) => formatNumberAsCurrency(value)}
            theme={theme.nivo}
          />
        )}
      </AutoSizer>
    </Stack>*/
  );
};

export default MonthlyOverviewChart;
