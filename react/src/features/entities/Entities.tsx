import { Paper, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import {
  useGetEntities,
  useRemoveEntity,
} from '../../services/entity/entityHooks.ts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { Entity } from '../../services/trx/trxServices.ts';
import { GridColDef } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack/Stack';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Button from '@mui/material/Button/Button';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import AddEditEntityDialog from './AddEditEntityDialog.tsx';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';

const Entities = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getEntitiesRequest = useGetEntities();
  const removeEntityRequest = useRemoveEntity();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionableEntity, setActionableEntity] = useState<Entity | null>(null);
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const filteredEntities = useMemo(() => {
    let filteredList = entities;

    if (searchQuery != null) {
      const lowerCaseQuery = searchQuery?.toLowerCase() || '';
      filteredList = entities.filter(
        (cat) =>
          !searchQuery || cat.name.toLowerCase().includes(lowerCaseQuery),
      );
    }

    return filteredList;
  }, [searchQuery, entities]);

  // Loading
  useEffect(() => {
    if (getEntitiesRequest.isFetching || removeEntityRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getEntitiesRequest.isFetching || removeEntityRequest.isPending]);

  // Error
  useEffect(() => {
    if (getEntitiesRequest.isError || removeEntityRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getEntitiesRequest.isError, removeEntityRequest.isError]);

  // Success
  useEffect(() => {
    if (!getEntitiesRequest.data) return;
    setEntities(getEntitiesRequest.data);
  }, [getEntitiesRequest.data]);

  // Reset actionableEntity
  useEffect(() => {
    if (isRemoveDialogOpen == false && isAddEditDialogOpen == false) {
      setActionableEntity(null);
    }
  }, [isRemoveDialogOpen, isAddEditDialogOpen]);

  const handleEditButtonClick = (entity: Entity) => {
    setActionableEntity(entity);
    setAddEditDialogOpen(true);
  };

  const rows = useMemo(
    () =>
      filteredEntities.map((entity: Entity) => ({
        id: entity.entity_id,
        name: entity.name,
        actions: entity,
      })),
    [filteredEntities],
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('entities.name'),
      minWidth: 200,
      flex: 1,
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
            onClick={() => {
              handleEditButtonClick(params.value);
            }}
          >
            <Edit fontSize="medium" color="action" />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={(event) => {
              event.stopPropagation();
              setActionableEntity(params.value);
              setRemoveDialogOpen(true);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const removeEntity = () => {
    if (!actionableEntity) return;
    removeEntityRequest.mutate(actionableEntity.entity_id);
    setRemoveDialogOpen(false);
  };

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchQuery(event.target.value);
    },
    [debouncedSearchQuery],
  );

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      {isAddEditDialogOpen && (
        <AddEditEntityDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setAddEditDialogOpen(false)}
          onPositiveClick={() => setAddEditDialogOpen(false)}
          onNegativeClick={() => setAddEditDialogOpen(false)}
          entity={actionableEntity}
        />
      )}
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={() => removeEntity()}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('entities.deleteEntityModalTitle', {
            name: actionableEntity?.name,
          })}
          descriptionText={t('entities.deleteEntityModalSubtitle')}
          positiveText={t('common.delete')}
        />
      )}
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('entities.entities')}
          subtitle={t('entities.strapLine')}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid xs={12} md={8}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
            startIcon={<AddCircleOutline />}
            onClick={() => {
              setAddEditDialogOpen(true);
            }}
          >
            {t('entities.addEntityCTA')}
          </Button>
        </Grid>
        <Grid
          xs={12}
          md={4}
          xsOffset="auto"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <TextField
            id="search"
            label={t('common.search')}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSearchChange(event);
            }}
          />
        </Grid>
        <Grid xs={12}>
          <MyFinStaticTable
            isRefetching={getEntitiesRequest.isRefetching}
            rows={rows}
            columns={columns}
            paginationModel={{ pageSize: 20 }}
            onRowClicked={(id) => {
              const entity = entities.find((ent) => ent.entity_id == id);
              if (!entity) return;
              handleEditButtonClick(entity);
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Entities;
