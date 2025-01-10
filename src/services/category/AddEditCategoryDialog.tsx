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
import TextField from '@mui/material/TextField/TextField';
import {
  Checkbox,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { cssGradients } from '../../utils/gradientUtils.ts';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Stack from '@mui/material/Stack/Stack';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
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
import DialogContent from '@mui/material/DialogContent/DialogContent';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Button from '@mui/material/Button/Button';
import DialogActions from '@mui/material/DialogActions/DialogActions';

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
    >
      {colorOptions.map((color) => (
        <MenuItem key={color} value={color}>
          <div
            style={{
              margin: '0 auto',
              background: cssGradients[color] ?? '',
              width: 60,
              height: 20,
              borderRadius: 20,
            }}
          ></div>
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
      PaperProps={{
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
              new_description: descriptionValue,
              new_exclude_from_budgets: excludeFromBudgetsValue,
            });
          } else {
            // Create
            addCategoryRequest.mutate({
              name: nameValue,
              status: statusValue,
              color_gradient: colorValue,
              description: descriptionValue,
              exclude_from_budgets: excludeFromBudgetsValue,
            });
          }
        },
      }}
    >
      <DialogTitle>
        <Grid container>
          <Grid xs={12} md={10}>
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
                  onChange={(_e, checked) =>
                    setExcludeFromBudgetsValue(checked)
                  }
                />
              </Tooltip>
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={2}
            display="flex"
            justifyContent="flex-end"
            sx={{ height: 'fit-content' }}
          >
            <CategoryStatusToggle
              selectedStatus={statusValue}
              onChange={onCategoryStatusSelected}
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container xs={12} spacing={0}>
          <Grid xs={12} md={10} pr={2} pb={1}>
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
          <Grid xs={12} md={2} display="flex" justifyContent="flex-end">
            <ColorOptionsSelect selectedColor={colorValue} />
          </Grid>
          <Grid xs={12}>
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
