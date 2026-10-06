import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { SxProps, Theme } from '@mui/material/styles';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  clearLabel: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
};

export default function SearchBar({
  value,
  onChange,
  ariaLabel,
  clearLabel,
  placeholder,
  sx = [],
}: SearchBarProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? t('common.search')}
      slotProps={{
        htmlInput: { 'aria-label': ariaLabel },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 19 }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label={clearLabel}
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
                edge="end"
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={[
        { '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
