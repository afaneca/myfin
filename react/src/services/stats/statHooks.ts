import statServices from './statServices.ts';
import { useQuery } from '@tanstack/react-query';

export function useGetMonthExpensesIncomeDistributionData(
  month: number,
  year: number,
) {
  async function getMonthExpensesIncomeDistribution() {
    const response = await statServices.getMonthExpensesIncomeDistributionData(
      month,
      year,
    );
    return response.data;
  }

  return useQuery({
    queryKey: ['month-expenses-income-distribution', month, year],
    queryFn: getMonthExpensesIncomeDistribution,
  });
}
