import { Paper, useTheme } from '@mui/material';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useTranslation } from 'react-i18next';
import {
  useGetCategories,
  useRemoveCategory,
} from '../../services/category/CategoryHooks.tsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Category,
  CategoryStatus,
} from '../../services/category/categoryServices.ts';
import { debounce } from 'lodash';
import { GridColDef } from '@mui/x-data-grid';
import { cssGradients } from '../../utils/gradientUtils.ts';
import { ColorGradient } from '../../consts';
import Chip from '@mui/material/Chip/Chip';
import Stack from '@mui/material/Stack/Stack';
import IconButton from '@mui/material/IconButton';
import { AddCircleOutline, Delete, Edit, Search } from '@mui/icons-material';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../components/PageHeader.tsx';
import Button from '@mui/material/Button/Button';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import GenericConfirmationDialog from '../../components/GenericConfirmationDialog.tsx';
import AddEditCategoryDialog from '../../services/category/AddEditCategoryDialog.tsx';
import MyFinStaticTable from '../../components/MyFinStaticTable.tsx';

const Categories = () => {
  const theme = useTheme();
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const getCategoriesRequest = useGetCategories();
  const removeCategoryRequest = useRemoveCategory();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionableCategory, setActionableCategory] = useState<Category | null>(
    null,
  );
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const filteredCategories = useMemo(() => {
    let filteredList = categories;

    if (searchQuery != null) {
      const lowerCaseQuery = searchQuery?.toLowerCase() || '';
      filteredList = categories.filter(
        (cat) =>
          !searchQuery || cat.name.toLowerCase().includes(lowerCaseQuery),
      );
    }

    return filteredList.sort((a, b) => a.status.localeCompare(b.status));
  }, [searchQuery, categories]);

  // Loading
  useEffect(() => {
    if (getCategoriesRequest.isFetching || removeCategoryRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [getCategoriesRequest.isFetching || removeCategoryRequest.isPending]);

  // Error
  useEffect(() => {
    if (getCategoriesRequest.isError || removeCategoryRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [getCategoriesRequest.isError, removeCategoryRequest.isError]);

  // Success
  useEffect(() => {
    if (!getCategoriesRequest.data) return;
    setCategories(getCategoriesRequest.data);
  }, [getCategoriesRequest.data]);

  // Reset actionableCategory
  useEffect(() => {
    if (isRemoveDialogOpen == false && isAddEditDialogOpen == false) {
      setActionableCategory(null);
    }
  }, [isRemoveDialogOpen, isAddEditDialogOpen]);

  const handleEditButtonClick = (category: Category) => {
    setActionableCategory(category);
    setAddEditDialogOpen(true);
  };

  const rows = useMemo(
    () =>
      filteredCategories.map((category: Category) => ({
        id: category.category_id,
        color: category.color_gradient,
        name: category.name,
        description: category.description,
        status: category.status,
        actions: category,
      })),
    [filteredCategories],
  );

  const columns: GridColDef[] = [
    {
      field: 'color',
      headerName: t('categories.color'),
      minWidth: 40,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <div
          style={{
            margin: 10,
            background: cssGradients[params.value as ColorGradient] ?? '',
            width: 30,
            height: 30,
            borderRadius: 20,
          }}
        ></div>
      ),
    },
    {
      field: 'name',
      headerName: t('categories.name'),
      flex: 1.5,
      minWidth: 200,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'description',
      headerName: t('common.description'),
      flex: 5,
      minWidth: 300,
      editable: false,
      sortable: false,
      renderCell: (params) => <p>{params.value}</p>,
    },
    {
      field: 'status',
      headerName: t('categories.status'),
      minWidth: 100,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value}
          variant="outlined"
          color={
            params.value.startsWith(CategoryStatus.Active)
              ? 'success'
              : 'warning'
          }
        />
      ),
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
              setActionableCategory(params.value);
              setRemoveDialogOpen(true);
            }}
          >
            <Delete fontSize="medium" color="action" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const removeCategory = () => {
    if (!actionableCategory) return;
    removeCategoryRequest.mutate(actionableCategory.category_id);
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
        <AddEditCategoryDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setAddEditDialogOpen(false)}
          onPositiveClick={() => setAddEditDialogOpen(false)}
          onNegativeClick={() => setAddEditDialogOpen(false)}
          category={actionableCategory}
        />
      )}
      {isRemoveDialogOpen && (
        <GenericConfirmationDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
          onPositiveClick={() => removeCategory()}
          onNegativeClick={() => setRemoveDialogOpen(false)}
          titleText={t('categories.deleteCategoryModalTitle', {
            name: actionableCategory?.name,
          })}
          descriptionText={t('categories.deleteCategoryModalSubtitle')}
          positiveText={t('common.delete')}
        />
      )}
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('categories.categories')}
          subtitle={t('categories.strapLine')}
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
            {t('categories.addCategoryCTA')}
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
            isRefetching={getCategoriesRequest.isRefetching}
            rows={rows}
            columns={columns}
            paginationModel={{ pageSize: 20 }}
            onRowClicked={(id) => {
              const category = categories.find((cat) => cat.category_id == id);
              if (!category) return;
              handleEditButtonClick(category);
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Categories;
