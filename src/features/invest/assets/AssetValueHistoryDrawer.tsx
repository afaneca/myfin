import { CheckCircleOutline, Close, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GenericConfirmationDialog from '../../../components/GenericConfirmationDialog.tsx';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import {
  useGetInvestStats,
  useRemoveAssetValueSnapshot,
  useUpdateAssetValue,
} from '../../../services/invest/investHooks.ts';
import { MonthlySnapshot } from '../../../services/invest/investServices.ts';
import { useFormatNumberAsCurrency } from '../../../utils/textHooks.ts';
import UpdateAssetValueDialog from './UpdateAssetValueDialog.tsx';

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
  const snackbar = useSnackbar();

  const { data: statsData, isFetching } = useGetInvestStats();

  const [editingSnapshot, setEditingSnapshot] =
    useState<MonthlySnapshot | null>(null);
  const [deletingSnapshot, setDeletingSnapshot] =
    useState<MonthlySnapshot | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  });
  const [issuesOnly, setIssuesOnly] = useState(false);
  const updateAssetValueRequest = useUpdateAssetValue();
  const removeAssetValueSnapshotRequest = useRemoveAssetValueSnapshot();

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
      .filter((s) => !issuesOnly || s.validation_status !== 'valid')
      .map((s, index: number) => ({
        ...s,
        id: index,
        highlight: s.month === highlightMonth && s.year === highlightYear,
      }));

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
  }, [statsData, assetId, highlightMonth, highlightYear, issuesOnly]);

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

  const handleConfirmClick = (snapshot: MonthlySnapshot) => {
    updateAssetValueRequest.mutate(
      {
        assetId,
        newValue: snapshot.current_value,
        month: snapshot.month,
        year: snapshot.year,
      },
      {
        onError: () =>
          snackbar.showSnackbar(
            t('common.somethingWentWrongTryAgain'),
            AlertSeverity.ERROR,
          ),
        onSuccess: () =>
          snackbar.showSnackbar(
            t('investments.snapshotValueConfirmed'),
            AlertSeverity.SUCCESS,
          ),
      },
    );
  };

  const handleDeleteSnapshot = () => {
    if (!deletingSnapshot) return;

    removeAssetValueSnapshotRequest.mutate(
      {
        assetId,
        month: deletingSnapshot.month,
        year: deletingSnapshot.year,
      },
      {
        onError: () =>
          snackbar.showSnackbar(
            t('common.somethingWentWrongTryAgain'),
            AlertSeverity.ERROR,
          ),
        onSuccess: () => {
          setDeletingSnapshot(null);
          snackbar.showSnackbar(
            t('investments.snapshotValueDeleted'),
            AlertSeverity.SUCCESS,
          );
        },
      },
    );
  };

  const getIssueText = (snapshot: MonthlySnapshot) =>
    snapshot.validation_reasons
      .map((reason) =>
        t(`investments.snapshotIssues.${reason}`, {
          asset: snapshot.asset_name,
          date: `${snapshot.month}/${snapshot.year}`,
        }),
      )
      .join(' ');

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
      field: 'validationStatus',
      headerName: t('investments.snapshotStatusLabel'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const snapshot = params.row as MonthlySnapshot;
        const status = snapshot.validation_status;
        const color =
          status === 'invalid'
            ? 'error'
            : status === 'valid'
              ? 'success'
              : 'warning';
        return (
          <Tooltip title={getIssueText(snapshot)}>
            <Chip
              color={color}
              label={t(`investments.snapshotStatus.${status}`)}
              size="small"
              variant={status === 'valid' ? 'outlined' : 'filled'}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 180,
      renderCell: (params) => {
        const snapshot = params.row as MonthlySnapshot;
        const isInvalid = snapshot.validation_status === 'invalid';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip
              title={
                isInvalid
                  ? t('investments.invalidSnapshotCannotBeConfirmed')
                  : t('common.edit')
              }
            >
              <span>
                <IconButton
                  aria-label={t('common.edit')}
                  disabled={isInvalid}
                  edge="end"
                  onClick={() => handleEditClick(snapshot)}
                >
                  <Edit />
                </IconButton>
              </span>
            </Tooltip>
            {snapshot.validation_status !== 'valid' && !isInvalid && (
              <Button
                disabled={updateAssetValueRequest.isPending}
                onClick={() => handleConfirmClick(snapshot)}
                size="small"
                startIcon={<CheckCircleOutline />}
              >
                {t('common.confirm')}
              </Button>
            )}
            {isInvalid && (
              <Tooltip title={t('investments.deleteInvalidSnapshot')}>
                <IconButton
                  aria-label={t('common.delete')}
                  color="error"
                  disabled={removeAssetValueSnapshotRequest.isPending}
                  onClick={() => setDeletingSnapshot(snapshot)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
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

          <FormControlLabel
            control={
              <Switch
                checked={issuesOnly}
                onChange={(event) => setIssuesOnly(event.target.checked)}
              />
            }
            label={t('investments.showSnapshotIssuesOnly')}
            sx={{ mb: 1 }}
          />

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
      {deletingSnapshot && (
        <GenericConfirmationDialog
          isOpen={!!deletingSnapshot}
          onClose={() => setDeletingSnapshot(null)}
          onPositiveClick={handleDeleteSnapshot}
          onNegativeClick={() => setDeletingSnapshot(null)}
          titleText={t('investments.deleteSnapshotTitle')}
          descriptionText={t('investments.deleteSnapshotDescription', {
            date: `${deletingSnapshot.month}/${deletingSnapshot.year}`,
            name: assetName,
          })}
          positiveText={t('common.delete')}
          alert={t('investments.deleteSnapshotAlert')}
        />
      )}
    </>
  );
};

export default AssetValueHistoryDrawer;
