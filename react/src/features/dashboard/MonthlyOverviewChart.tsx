import { useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { ResponsivePie } from '@nivo/pie';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';

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
        margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
        startAngle={-90}
        endAngle={90}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        arcLabelsTextColor="black"
        activeOuterRadiusOffset={8}
        borderWidth={0}
        colors={getSliceColor}
        enableArcLinkLabels={false}
        arcLabel={'id'}
        valueFormat={(value) => formatNumberAsCurrency(value)}
        theme={theme.nivo}
      />
    </Stack>
  );
};

export default MonthlyOverviewChart;
