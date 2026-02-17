import { Paper, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { Tag } from '../../services/trx/trxServices.ts';
import { useGetTags, useRemoveTag } from '../../services/tag/tagHooks.ts';
import { GridColDef } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import Box from '@mui/material/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { debounce } from 'lodash';
import MyFinTable from '../../components/MyFinTable.tsx';
import AddEditTagDialog from './AddEditTagDialog.tsx';

const Tags = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 50,
    page: 0,
  });
  const [actionableTag, setActionableTag] = useState<Tag | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useMemo(
    () => debounce((query) => setSearchQuery(query), 300),
    [],
  );

  const getTagsRequest = useGetTags(
    paginationModel.page,
    paginationModel.pageSize,
    searchQuery,
  );
  const removeTagRequest = useRemoveTag();

  // Loading
  useEffect(() => {
    if (getTagsRequest.isLoading || removeTagRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getTagsRequest.isLoading, removeTagRequest.isPending]);

  // Error
  useEffect(() => {
    if (getTagsRequest.isError || removeTagRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getTagsRequest.isError, removeTagRequest.isError]);

  useEffect(() => {
    if (!isRemoveDialogOpen && !isAddEditDialogOpen) {
      setActionableTag(null);
    }
  }, [isAddEditDialogOpen, isRemoveDialogOpen]);

  const removeTag = () => {
    if (!actionableTag) return;
    removeTagRequest.mutate(actionableTag?.tag_id);
    setRemoveDialogOpen(false);
  };

  const handleEditTagClick = (tag: Tag) => {
    setActionableTag(tag);
    setEditDialogOpen(true);
  };

  const handleRemoveTagClick = (tag: Tag) => {
    setActionableTag(tag);
    setRemoveDialogOpen(true);
  };

  const handleAddTagClick = () => {
    setEditDialogOpen(true);
  };

  if (getTagsRequest.isLoading || !getTagsRequest.data) {
    return null;
  }

  const rows = getTagsRequest.data.results.map((tag: Tag) => ({
    id: tag.tag_id,
    name: tag.name,
    description: tag.description,
    actions: tag,
  }));

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('tags.name'),
      minWidth: 200,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'description',
      headerName: t('tags.description'),
      minWidth: 400,
      flex: 3,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={0}>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() => handleEditTagClick(params.value)}
          >
            <Edit fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              handleRemoveTagClick(params.value);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isAddEditDialogOpen && (
        <AddEditTagDialog
          isOpen={isAddEditDialogOpen}
          onPositiveClick={() => setEditDialogOpen(false)}
          onNegativeClick={() => setEditDialogOpen(false)}
          onClose={() => setEditDialogOpen(false)}
          tag={actionableTag}
        />
      )}
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={removeTag}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('tags.deleteTagModalTitle', {
            id: actionableTag?.tag_id,
          })}
          descriptionText={t('tags.deleteTagModalSubtitle')}
          positiveText={t('common.delete')}
        />
      )}
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader title={t('tags.tags')} subtitle={t('tags.strapLine')} />
      </Box>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
            startIcon={<AddCircleOutline />}
            onClick={handleAddTagClick}
          >
            {t('tags.addTagCTA')}
          </Button>
        </Grid>
        <Grid
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
          size={{
            xs: 12,
            md: 4,
          }}
          offset="auto"
        >
          <TextField
            id="search"
            label={t('common.search')}
            variant="outlined"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              debouncedSearchQuery(event.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={12}>
          <MyFinTable
            isRefetching={getTagsRequest.isRefetching}
            rows={rows}
            columns={columns}
            itemCount={getTagsRequest.data.filtered_count}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            onRowClicked={(id) => {
              const tag = getTagsRequest.data.results.find(
                (tag) => tag.tag_id == id,
              );
              if (!tag) return;
              handleEditTagClick(tag);
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Tags;
