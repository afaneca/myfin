import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import PercentageChip from '../../../components/PercentageChip.tsx';

type Props = {
  list: PatrimonyEvoChartDataItem[];
};

export type PatrimonyEvoChartDataItem = {
  month: number;
  year: number;
  previousBalance?: number;
  finalBalance: number;
  monthBalance: number;
  growthRate: number;
};

const PatrimonyEvolutionList = (props: Props) => {
  const { t } = useTranslation();
  const rows = useMemo(
    () =>
      props.list.toReversed().map((item) => ({
        id: `${item.year}-${item.month}`,
        month: { month: item.month, year: item.year },
        previousBalance: item.previousBalance,
        finalBalance: item.finalBalance,
        monthBalance: item.monthBalance,
        growthRate: item.growthRate,
      })),
    [props.list],
  );

  const columns: GridColDef[] = [
    {
      field: 'month',
      headerName: t('stats.month'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box mt={2} mb={2}>
          {params.value.month}/{params.value.year}
        </Box>
      ),
    },
    {
      field: 'previousBalance',
      headerName: t('stats.previousBalance'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) =>
        `${params.value ? formatNumberAsCurrency(params.value) : '-'}`,
    },
    {
      field: 'finalBalance',
      headerName: t('stats.finalBalance'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'monthBalance',
      headerName: t('stats.monthlyBalance'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) =>
        `${params.value ? formatNumberAsCurrency(params.value) : '-'}`,
    },
    {
      field: 'growthRate',
      headerName: t('stats.growth'),
      minWidth: 150,
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

export default PatrimonyEvolutionList;
