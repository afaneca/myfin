import { Autocomplete, Divider, useTheme } from '@mui/material';
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
import {
  MY_FIN_THEME_LABEL_KEYS,
  MY_FIN_THEME_NAMES,
  type MyFinThemeName,
} from '../../theme';
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

  const [currency, setCurrency] = useState<Currency>(CURRENCIES.EUR);

  useEffect(() => {
    i18next.changeLanguage(language);
    partiallyUpdateUserSessionData({ language });
  }, [language]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLanguage(event.currentTarget.value);
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
            <FormControlLabel
              value="fr"
              control={<Radio />}
              label="Français"
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
            value={colorMode.themeName}
            name="theme-radio-buttons-group"
            onChange={(event) =>
              colorMode.setColorMode(
                event.currentTarget.value as MyFinThemeName,
              )
            }
          >
            {MY_FIN_THEME_NAMES.map((themeName) => (
              <FormControlLabel
                key={themeName}
                value={themeName}
                control={<Radio />}
                label={t(MY_FIN_THEME_LABEL_KEYS[themeName])}
              />
            ))}
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
              label={t('common.currency')}
              slotProps={{
                input: {
                  ...params.InputProps,
                }
              }}
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
