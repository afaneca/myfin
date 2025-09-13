import { Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { forwardRef, MutableRefObject, Ref, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import {
  AddReaction,
  AddReactionOutlined,
  Description,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import i18next from 'i18next';

const BudgetDescription = forwardRef(({}, ref: Ref<HTMLTextAreaElement>) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const matchesSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleEmojiAdded = (emojiText: string) => {
    // add the emoji text at the current caret position
    const input = (ref as MutableRefObject<HTMLTextAreaElement>)?.current;
    if (input) {
      input.focus();
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;

      // Insert the emoji text at the caret position
      input.value =
        input.value.substring(0, start) +
        emojiText +
        input.value.substring(end);

      // Set the caret position right after the inserted emoji
      input.selectionStart = input.selectionEnd = start + emojiText.length;
      setEmojiPickerOpen(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        inputRef={ref}
        required
        fullWidth
        margin="none"
        id="description"
        name="description"
        label={t('common.description')}
        placeholder={t('common.description')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Description />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={'Emojis'}>
                <IconButton
                  aria-label={'Emojis'}
                  onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)}
                  edge="end"
                >
                  {matchesSmScreen ? null : isEmojiPickerOpen ? (
                    <AddReaction color="primary" />
                  ) : (
                    <AddReactionOutlined color="primary" />
                  )}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
      {isEmojiPickerOpen && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 0,
            transform: 'translateY(100%)',
            zIndex: 2,
            maxHeight: '300px',
          }}
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) =>
              handleEmojiAdded(emoji.native)
            }
            theme={theme.palette.mode}
            locale={i18next.resolvedLanguage == 'pt' ? 'pt' : 'en'}
          />
        </Box>
      )}
    </Box>
  );
});
BudgetDescription.displayName = 'BudgetDescription';

export default BudgetDescription;
