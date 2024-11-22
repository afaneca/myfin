import { CategoryExpensesIncomeEvolutionItem } from '../../../services/stats/statServices.ts';
import { ExpensesIncomeStatPeriod } from './ExpensesIncomeStats.tsx';
import { useMemo } from 'react';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import MyFinLineChart from '../../../components/MyFinLineChart.tsx';

type Props = {
  list: CategoryExpensesIncomeEvolutionItem[];
  period: ExpensesIncomeStatPeriod;
};

const ExpensesIncomeChart = (props: Props) => {
  const chartData = useMemo(() => {
    return [
      {
        id: 'value',
        data: props.list.toReversed().map((item) => ({
          x:
            props.period == ExpensesIncomeStatPeriod.Month
              ? `${item.month}/${item.year}`
              : item.year,
          y: item.value,
        })),
      },
    ];
  }, [props.list]);

  return (
    <Grid xs={12} height={420}>
      <MyFinLineChart chartData={chartData} />
    </Grid>
  );
};

export default ExpensesIncomeChart;
