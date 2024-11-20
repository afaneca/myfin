import { MonthlySnapshot } from '../../../services/invest/investServices.ts';
import MyFinLineChart from '../../../components/MyFinLineChart.tsx';

type Props = {
  data: MonthlySnapshot[];
};

const PortfolioEvolutionChart = (props: Props) => {
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

  const monthlyData = [
    {
      id: 'current_value',
      data: chartData.map((snapshot) => ({
        x: snapshot.x, // Format as YYYY-MM
        y: snapshot.current, // Convert to number
      })),
    },
  ];

  return <MyFinLineChart chartData={monthlyData} />;
};

export default PortfolioEvolutionChart;
