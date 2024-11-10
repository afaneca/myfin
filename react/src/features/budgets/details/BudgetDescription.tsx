import { Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import {
  AddReaction,
  AddReactionOutlined,
  Description,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box/Box';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import i18next from 'i18next';

type Props = {
  text: string;
  onTextChange: (text: string) => void;
};

const BudgetDescription = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const matchesSmScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const handleEmojiAdded = (emojiText: string) => {
    props.onTextChange(`${props.text} ${emojiText} `);
    descriptionRef?.current?.focus();
    setEmojiPickerOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        inputRef={descriptionRef}
        required
        fullWidth
        margin="none"
        id="description"
        name="description"
        label={t('common.description')}
        placeholder={t('common.description')}
        value={props.text}
        onChange={(e) => props.onTextChange(e.target.value)}
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
};

export default BudgetDescription;
