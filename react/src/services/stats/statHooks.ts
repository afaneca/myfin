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

export function useGetMonthByMonthData(limit: number = 5) {
  async function getMonthByMonthData() {
    const response = await statServices.getMonthByMonthData(limit);
    return response.data;
  }

  return useQuery({
    queryKey: ['month-by-month', limit],
    queryFn: getMonthByMonthData,
  });
}
