import { Autocomplete, Divider, PaletteMode, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useContext, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import i18next from 'i18next';
import { ColorModeContext } from '../../providers/MyFinThemeProvider.tsx';
import { useUserData } from '../../providers/UserProvider.tsx';
import Stack from '@mui/material/Stack';
import { CURRENCIES, Currency } from '../../consts/Currency.ts';
import TextField from '@mui/material/TextField';

export type Props = {
  onNext: (currency: Currency) => void;
};

const currencyOptions = Object.values(CURRENCIES);

const SetupStep0 = (props: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const colorMode = useContext(ColorModeContext);
  const { partiallyUpdateUserSessionData } = useUserData();

  const [language, setLanguage] = useState(i18next.resolvedLanguage || 'en');
  const [currentTheme, setTheme] = useState<PaletteMode>(
    theme.palette.mode || 'dark',
  );

  const [currency, setCurrency] = useState<Currency>(CURRENCIES.EUR);

  useEffect(() => {
    colorMode.setColorMode(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    i18next.changeLanguage(language);
    partiallyUpdateUserSessionData({ language });
  }, [language]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLanguage(event.currentTarget.value);
  }

  function handleThemeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTheme(event.currentTarget.value as PaletteMode);
  }

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(1), m: theme.spacing(0) }}>
      <Stack spacing={2}>
        <Typography variant="body1">{t('setup.step0Description')}</Typography>
        <Typography variant="h5" pt={theme.spacing(4)}>
          🌐 {t('common.language')}
        </Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <FormControl>
          <RadioGroup
            value={language}
            name="radio-buttons-group"
            onChange={handleLanguageChange}
          >
            <FormControlLabel
              value="pt"
              control={<Radio />}
              label="Português (pt-PT)"
            />
            <FormControlLabel value="en" control={<Radio />} label="English" />
          </RadioGroup>
        </FormControl>
        <Typography variant="h5" pt={theme.spacing(4)}>
          🎨 {t('common.theme')}
        </Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <FormControl>
          <RadioGroup
            value={currentTheme}
            name="theme-radio-buttons-group"
            onChange={handleThemeChange}
          >
            <FormControlLabel
              value="light"
              control={<Radio />}
              label={t('profile.lightTheme')}
            />
            <FormControlLabel
              value="dark"
              control={<Radio />}
              label={t('profile.darkTheme')}
            />
          </RadioGroup>
        </FormControl>
        <Typography variant="h5" pt={theme.spacing(4)}>
          🪙 {t('common.currency')}
        </Typography>
        <Divider sx={{ mb: 2, mt: 1 }} />
        <Autocomplete
          id="currency"
          value={currency}
          options={currencyOptions}
          onChange={(_event, value) => {
            setCurrency(value as Currency);
          }}
          getOptionLabel={(option: Currency) =>
            `${option.name} (${option.symbol}/${option.code})`
          }
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => (
            <TextField
              sx={{ mb: 4, mt: 2 }}
              {...params}
              fullWidth
              InputProps={{
                ...params.InputProps,
              }}
              label={t('common.currency')}
            />
          )}
        />
        <Stack direction="row" justifyContent="center" mt={theme.spacing(2)}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<KeyboardDoubleArrowRight />}
            onClick={() => props.onNext(currency)}
          >
            {t('common.next')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SetupStep0;
