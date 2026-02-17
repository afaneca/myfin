import { Tag } from '../../services/trx/trxServices.ts';
import { Trans, useTranslation } from 'react-i18next';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useAddTag, useEditTag } from '../../services/tag/tagHooks.ts';
import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import { Description, Folder, Send, Undo } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  tag: Tag | null;
};

const AddEditTagDialog = (props: Props) => {
  const isEditForm = props.tag !== null;

  const { t } = useTranslation();
  const loader = useLoading();
  const snackbar = useSnackbar();

  const addTagRequest = useAddTag();
  const editTagRequest = useEditTag();

  const [nameValue, setNameValue] = useState<string>(props.tag?.name || '');
  const [descriptionValue, setDescriptionValue] = useState<string>(
    props.tag?.description || '',
  );

  // Loading
  useEffect(() => {
    if (addTagRequest.isPending || editTagRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [addTagRequest.isPending, editTagRequest.isPending]);

  // Error
  useEffect(() => {
    if (addTagRequest.isError || editTagRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [addTagRequest.isError, editTagRequest.isError]);

  // Success
  useEffect(() => {
    if (addTagRequest.isSuccess || editTagRequest.isSuccess) {
      props.onPositiveClick();
    }
  }, [addTagRequest.isSuccess, editTagRequest.isSuccess]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={props.isOpen}
      onClose={props.onClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (isEditForm && props.tag) {
              // Update
              editTagRequest.mutate({
                tag_id: props.tag.tag_id,
                new_name: nameValue,
                new_description: descriptionValue,
              });
            } else {
              // Create
              addTagRequest.mutate({
                name: nameValue,
                description: descriptionValue,
              });
            }
          },
        },
      }}
    >
      <DialogTitle>
        <Trans
          i18nKey={isEditForm ? 'tags.editTagModalTitle' : 'tags.addTagCTA'}
          values={{
            id: props.tag?.tag_id,
          }}
        />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              margin="dense"
              id="name"
              name="name"
              value={nameValue || ''}
              onChange={(e) => setNameValue(e.target.value)}
              label={t('tags.name')}
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Folder />
                    </InputAdornment>
                  ),
                }
              }}
            />
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }
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

export default AddEditTagDialog;
