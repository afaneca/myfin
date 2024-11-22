import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import PercentageChip from '../../../components/PercentageChip.tsx';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { ProjectionStatsItem } from '../../../services/stats/statHooks.ts';

type Props = {
  list: ProjectionStatsItem[];
};

const ProjectionsList = (props: Props) => {
  const { t } = useTranslation();
  const rows = useMemo(
    () =>
      props.list.map((item) => ({
        id: `${item.year}-${item.month}`,
        month: { month: item.month, year: item.year },
        previousBalance: item.previousBalance,
        finalBalance: item.finalBalance,
        finalBalanceAssets: item.finalBalanceAssets,
        finalBalanceOpFunds: item.finalBalanceOpFunds,
        growthRate: item.growthRatePercentage,
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
      field: 'finalBalanceAssets',
      headerName: t('stats.finalBalanceAssets'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
    },
    {
      field: 'finalBalanceOpFunds',
      headerName: t('stats.finalBalanceOperatingFunds'),
      minWidth: 100,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${formatNumberAsCurrency(params.value)}`,
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

export default ProjectionsList;
