import { PatrimonyEvoChartDataItem } from './PatrimonyEvolutionList.tsx';
import MyFinLineChart from '../../../components/MyFinLineChart.tsx';

type Props = {
  list: PatrimonyEvoChartDataItem[];
};

const PatrimonyEvolutionChart = (props: Props) => {
  const chartData = [
    {
      id: 'current_value',
      data: props.list.map((item) => ({
        x: `${item.month}/${item.year}`,
        y: item.finalBalance,
      })),
    },
  ];

  return <MyFinLineChart chartData={chartData} />;
};

export default PatrimonyEvolutionChart;
