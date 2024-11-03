import { CategoryExpensesIncomeEvolutionItem } from '../../../services/stats/statServices.ts';
import { ExpensesIncomeStatPeriod } from './ExpensesIncomeStats.tsx';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { calculateGrowthPercentage } from '../../../utils/mathUtils.ts';
import { GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';

type Props = {
  list: CategoryExpensesIncomeEvolutionItem[];
  period: ExpensesIncomeStatPeriod;
};

const ExpensesIncomeList = (props: Props) => {
  const { t } = useTranslation();
  const rows = useMemo(
    () =>
      props.list.map((item, index, array) => ({
        id: `${item.year}-${item.month}`,
        period: { month: item.month, year: item.year },
        value: item.value,
        variation: array[index + 1]?.value
          ? calculateGrowthPercentage(array[index + 1].value, item.value)
          : 0,
      })),
    [props.list],
  );

  const columns: GridColDef[] = [
    {
      field: 'period',
      headerName: t('stats.period'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box mt={2} mb={2}>
          {props.period == ExpensesIncomeStatPeriod.Month
            ? `${params.value.month}/${params.value.year}`
            : params.value.year}
        </Box>
      ),
    },
    {
      field: 'value',
      headerName: t('common.value'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => formatNumberAsCurrency(params.value),
    },
    {
      field: 'variation',
      headerName: t('stats.variationPercentage'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => <PercentageChip percentage={params.value} />,
    },
  ];

  return (
    <MyFinStaticTable
      rows={rows}
      columns={columns}
      paginationModel={{ pageSize: 10 }}
      isRefetching={false}
    />
  );
};

export default ExpensesIncomeList;
