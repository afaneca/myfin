import { Category, CategoryStatus } from './categoryServices.ts';
import { Trans, useTranslation } from 'react-i18next';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useAddCategory, useEditCategory } from './CategoryHooks.tsx';
import React, { useEffect, useState } from 'react';
import { ColorGradient } from '../../consts';
import {
  CATEGORY_ICON_OPTIONS,
  CategoryIcon,
  DEFAULT_CATEGORY_ICON_KEY,
} from './categoryIcons.tsx';
import type { CategoryIconKey } from './categoryIcons.tsx';
import TextField from '@mui/material/TextField';
import {
  Checkbox,
  ListItemIcon,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { cssGradients } from '../../utils/gradientUtils.ts';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  AcUnit,
  Description,
  Folder,
  PlayArrow,
  RemoveCircle,
  RemoveCircleOutline,
  Send,
  Undo,
} from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  category: Category | null;
};

const AddEditCategoryDialog = (props: Props) => {
  const isEditForm = props.category !== null;

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const addCategoryRequest = useAddCategory();
  const editCategoryRequest = useEditCategory();

  const [excludeFromBudgetsValue, setExcludeFromBudgetsValue] = useState(
    props.category?.exclude_from_budgets == 1,
  );
  const colorOptions = Object.values(ColorGradient);
  const [colorValue, setColorValue] = useState<string>(
    props.category?.color_gradient || colorOptions[0],
  );
  const [iconValue, setIconValue] = useState<CategoryIconKey>(
    (props.category?.icon_key as CategoryIconKey) || DEFAULT_CATEGORY_ICON_KEY,
  );
  const [statusValue, setStatusValue] = useState<CategoryStatus>(
    props.category?.status || CategoryStatus.Active,
  );
  const [nameValue, setNameValue] = useState<string>(
    props.category?.name || '',
  );
  const [descriptionValue, setDescriptionValue] = useState<string>(
    props.category?.description || '',
  );

  // Loading
  useEffect(() => {
    if (addCategoryRequest.isPending || editCategoryRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addCategoryRequest.isPending, editCategoryRequest.isPending]);

  // Error
  useEffect(() => {
    if (addCategoryRequest.isError || editCategoryRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addCategoryRequest.isError, editCategoryRequest.isError]);

  // Success
  useEffect(() => {
    if (addCategoryRequest.isSuccess || editCategoryRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [addCategoryRequest.isSuccess, editCategoryRequest.isSuccess]);

  const onCategoryStatusSelected = (
    _: React.MouseEvent<HTMLElement>,
    newStatus: string | null,
  ) => {
    if (
      newStatus !== null &&
      Object.values(CategoryStatus).includes(newStatus as CategoryStatus)
    ) {
      setStatusValue(newStatus as CategoryStatus);
    }
  };

  const ColorOptionsSelect = ({ selectedColor }: { selectedColor: string }) => (
    <TextField
      fullWidth
      select
      margin="dense"
      id="color-select"
      value={selectedColor}
      onChange={(event) => setColorValue(event.target.value)}
      label={t('categories.color')}
      SelectProps={{
        renderValue: (value) => (
          <div
            style={{
              margin: '0 auto',
              background: cssGradients[value as ColorGradient] ?? '',
              width: 28,
              height: 28,
              borderRadius: '50%',
            }}
          />
        ),
        MenuProps: {
          PaperProps: {
            sx: {
              width: 264,
              maxWidth: 'calc(100vw - 32px)',
              '& .MuiList-root': {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))',
                gap: 0.5,
                p: 1,
              },
              '& .MuiMenuItem-root': {
                minHeight: 36,
                p: 0,
                borderRadius: 1,
                justifyContent: 'center',
              },
            },
          },
        },
      }}
    >
      {colorOptions.map((color) => (
        <MenuItem key={color} value={color}>
          <div
            style={{
              background: cssGradients[color] ?? '',
              width: 28,
              height: 28,
              borderRadius: '50%',
            }}
          />
        </MenuItem>
      ))}
    </TextField>
  );

  const IconOptionsSelect = () => (
    <TextField
      fullWidth
      select
      margin="dense"
      id="icon-select"
      value={iconValue}
      onChange={(event) => setIconValue(event.target.value as CategoryIconKey)}
      label={t('categories.icon')}
      SelectProps={{
        renderValue: (value) => {
          const option = CATEGORY_ICON_OPTIONS.find(
            (item) => item.key === value,
          );
          return (
            <Stack direction="row" justifyContent="center">
              <CategoryIcon iconKey={option?.key} fontSize="small" />
            </Stack>
          );
        },
        MenuProps: {
          PaperProps: {
            sx: {
              width: 264,
              maxWidth: 'calc(100vw - 32px)',
              '& .MuiList-root': {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))',
                gap: 0.5,
                p: 1,
              },
              '& .MuiMenuItem-root': {
                minHeight: 36,
                p: 0,
                borderRadius: 1,
              },
            },
          },
        },
      }}
    >
      {CATEGORY_ICON_OPTIONS.map((option) => (
        <MenuItem key={option.key} value={option.key} aria-label={option.label}>
          <ListItemIcon
            sx={{ minWidth: 0, justifyContent: 'center', width: '100%' }}
          >
            <CategoryIcon
              iconKey={option.key}
              fontSize="small"
              color="action"
            />
          </ListItemIcon>
        </MenuItem>
      ))}
    </TextField>
  );

  const CategoryStatusToggle = ({
    selectedStatus,
    onChange,
  }: {
    selectedStatus: string;
    onChange: (event: React.MouseEvent<HTMLElement>, value: string) => void;
  }) => (
    <ToggleButtonGroup
      exclusive
      value={selectedStatus}
      onChange={onChange}
      color="primary"
    >
      <ToggleButton value={CategoryStatus.Active}>
        <Stack direction="row" spacing={1}>
          <PlayArrow />
          <Typography variant="body1">{t('categories.active')}</Typography>
        </Stack>
      </ToggleButton>
      <ToggleButton value={CategoryStatus.Inactive}>
        <Stack direction="row" spacing={1}>
          <AcUnit />
          <Typography variant="body1">{t('categories.inactive')}</Typography>
        </Stack>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={props.isOpen}
      onClose={props.onClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (isEditForm && props.category) {
              // Update
              editCategoryRequest.mutate({
                category_id: props.category.category_id,
                new_name: nameValue,
                new_status: statusValue,
                new_color_gradient: colorValue,
                new_icon_key: iconValue,
                new_description: descriptionValue,
                new_exclude_from_budgets: excludeFromBudgetsValue,
              });
            } else {
              // Create
              addCategoryRequest.mutate({
                name: nameValue,
                status: statusValue,
                color_gradient: colorValue,
                icon_key: iconValue,
                description: descriptionValue,
                exclude_from_budgets: excludeFromBudgetsValue,
              });
            }
          },
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
        >
          <Stack>
            <Trans
              i18nKey={
                isEditForm
                  ? 'categories.editCategoryModalTitle'
                  : 'categories.addCategoryCTA'
              }
            />
            {/* Exclude from budgets */}
            <Tooltip
              title={t('categories.excludeFromBudgetsTooltip')}
              placement="right"
            >
              <FormControlLabel
                sx={{ width: 'fit-content' }}
                control={
                  <Checkbox
                    icon={<RemoveCircleOutline />}
                    checkedIcon={<RemoveCircle />}
                  />
                }
                checked={excludeFromBudgetsValue}
                label={t('common.excludeFromBudgets')}
                name="exclude_from_budgets"
                onChange={(_e, checked) => setExcludeFromBudgetsValue(checked)}
              />
            </Tooltip>
          </Stack>
          <CategoryStatusToggle
            selectedStatus={statusValue}
            onChange={onCategoryStatusSelected}
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              margin="dense"
              id="name"
              name="name"
              value={nameValue || ''}
              onChange={(e) => setNameValue(e.target.value)}
              label={t('categories.name')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Folder />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <ColorOptionsSelect selectedColor={colorValue} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <IconOptionsSelect />
          </Grid>
          <Grid size={12}>
            <TextField
              margin="dense"
              id="description"
              name="description"
              value={descriptionValue || ''}
              onChange={(e) => setDescriptionValue(e.target.value)}
              label={t('common.description')}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pr: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Undo />}
          onClick={props.onNegativeClick}
        >
          {t('common.cancel')}
        </Button>
        <Button variant="contained" startIcon={<Send />} type="submit">
          {t(isEditForm ? 'common.edit' : 'common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEditCategoryDialog;
