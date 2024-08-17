import investServices from './investServices.ts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const QUERY_KEY_GET_INVEST_STATS = 'QUERY_KEY_GET_INVEST_STATS';

export function useGetInvestStats() {
  async function getInvestStats() {
    const data = await investServices.getInvestStats();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_INVEST_STATS],
    queryFn: getInvestStats,
    placeholderData: keepPreviousData,
  });
}
