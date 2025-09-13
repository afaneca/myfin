import { Entity } from '../../services/trx/trxServices.ts';
import { Trans, useTranslation } from 'react-i18next';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import {
  useAddEntity,
  useEditEntity,
} from '../../services/entity/entityHooks.ts';
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import { Folder, Send, Undo } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  entity: Entity | null;
};

const AddEditEntityDialog = (props: Props) => {
  const isEditForm = props.entity !== null;

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const addEntityRequest = useAddEntity();
  const editEntityRequest = useEditEntity();

  const [nameValue, setNameValue] = useState<string>(props.entity?.name || '');

  // Loading
  useEffect(() => {
    if (addEntityRequest.isPending || editEntityRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addEntityRequest.isPending, editEntityRequest.isPending]);

  // Error
  useEffect(() => {
    if (addEntityRequest.isError || editEntityRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addEntityRequest.isError, editEntityRequest.isError]);

  // Success
  useEffect(() => {
    if (addEntityRequest.isSuccess || editEntityRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [addEntityRequest.isSuccess, editEntityRequest.isSuccess]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={props.isOpen}
      onClose={props.onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (isEditForm && props.entity) {
            // Update
            editEntityRequest.mutate({
              entity_id: props.entity.entity_id,
              new_name: nameValue,
            });
          } else {
            // Create
            addEntityRequest.mutate({
              name: nameValue,
            });
          }
        },
      }}
    >
      <DialogTitle>
        <Trans
          i18nKey={
            isEditForm
              ? 'entities.editEntityModalTitle'
              : 'entities.addEntityCTA'
          }
          values={{
            name: props.entity?.name,
          }}
        />
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="name"
          name="name"
          value={nameValue || ''}
          onChange={(e) => setNameValue(e.target.value)}
          label={t('entities.name')}
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

export default AddEditEntityDialog;
