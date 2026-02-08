import { useMemo, useState, useEffect } from 'react';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetInvestStats } from '../../../services/invest/investHooks.ts';
import { Close, Edit } from '@mui/icons-material';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import UpdateAssetValueDialog from './UpdateAssetValueDialog.tsx';
import { MonthlySnapshot } from '../../../services/invest/investServices.ts';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { GridColDef } from '@mui/x-data-grid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  assetId: bigint;
  assetName: string;
  highlightMonth?: number;
  highlightYear?: number;
};

type HistoryRow = MonthlySnapshot & { id: number };

const PAGE_SIZE = 10;

const AssetValueHistoryDrawer = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  highlightMonth,
  highlightYear,
}: Props) => {
  const { t } = useTranslation();
  const formatCurrency = useFormatNumberAsCurrency();

  const { data: statsData, isFetching } = useGetInvestStats();

  const [editingSnapshot, setEditingSnapshot] = useState<MonthlySnapshot | null>(
    null,
  );
  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  });

  const { history, targetId, targetPage } = useMemo<{
    history: HistoryRow[];
    targetId: number | undefined;
    targetPage: number;
  }>(() => {
    if (!statsData?.monthly_snapshots) {
      return { history: [], targetId: undefined, targetPage: 0 };
    }

    const sortedHistory: HistoryRow[] = statsData.monthly_snapshots
      .filter((s) => s.asset_id === assetId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .map((s, index: number) => ({ ...s, id: index, highlight: s.month === highlightMonth && s.year === highlightYear }));

    if (!highlightMonth || !highlightYear || sortedHistory.length === 0) {
      return { history: sortedHistory, targetId: undefined, targetPage: 0 };
    }

    const targetIndex = sortedHistory.findIndex(
      (s: HistoryRow) => s.month === highlightMonth && s.year === highlightYear,
    );

    if (targetIndex === -1) {
      return { history: sortedHistory, targetId: undefined, targetPage: 0 };
    }

    const page = Math.floor(targetIndex / PAGE_SIZE);
    return { history: sortedHistory, targetId: targetIndex, targetPage: page };
  }, [statsData, assetId, highlightMonth, highlightYear]);

  // Adjust page if target changes
  useEffect(() => {
    if (targetId !== undefined && paginationModel.page !== targetPage) {
      setPaginationModel((prev) => ({ ...prev, page: targetPage }));
    }
  }, [targetId, targetPage]);

  const handleEditClick = (snapshot: MonthlySnapshot) => {
    setEditingSnapshot(snapshot);
  };

  const handleEditClose = () => {
    setEditingSnapshot(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('common.date'),
      flex: 1,
      renderCell: (params) => `${params.row.month}/${params.row.year}`,
    },
    {
      field: 'value',
      headerName: t('common.value'),
      flex: 1,
      renderCell: (params) => formatCurrency.invoke(params.row.current_value),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 70,
      renderCell: (params) => (
        <IconButton
          edge="end"
          aria-label="edit"
          onClick={() => handleEditClick(params.row)}
        >
          <Edit />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box sx={{ width: { xs: '100vw', sm: 540 }, p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {t('investments.valueHistory', { name: assetName })}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('investments.valueHistoryDescription')}
          </Typography>

          <MyFinStaticTable
            isRefetching={isFetching}
            rows={history}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            scrollToId={targetId}
          />
        </Box>
      </Drawer>

      {editingSnapshot && (
        <UpdateAssetValueDialog
          isOpen={!!editingSnapshot}
          onSuccess={handleEditClose}
          onCanceled={handleEditClose}
          assetId={assetId}
          assetName={assetName}
          currentValue={editingSnapshot.current_value}
          month={editingSnapshot.month}
          year={editingSnapshot.year}
        />
      )}
    </>
  );
};

export default AssetValueHistoryDrawer;
