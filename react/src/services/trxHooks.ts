import { keepPreviousData, useQuery } from "@tanstack/react-query";
import trxServices, { TransactionsPage } from "./trxServices";


export function useGetTransactions(page: number, pageSize: number, query?: string) {

    async function getTransactions() {
        const data = await trxServices.getTransactions(page, pageSize, query);
        return data.data;
    }

    return useQuery({
        queryKey: ['transactions', page, pageSize, query],
        queryFn: getTransactions,
        placeholderData: keepPreviousData,
    })
};