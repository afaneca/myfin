import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Link,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import PageHeader from '../../components/PageHeader.tsx';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import React, { useContext, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import { ColorModeContext } from '../../providers/MyFinThemeProvider.tsx';
import UserStatList from './UserStatList.tsx';
import Utilities from './Utilities.tsx';
import ChangePasswordForm from './ChangePasswordForm.tsx';
import { useUserData } from '../../providers/UserProvider.tsx';
import ChangeCurrencyForm from './ChangeCurrencyForm.tsx';
import {
  MY_FIN_THEME_LABEL_KEYS,
  MY_FIN_THEME_NAMES,
  MY_FIN_THEME_PALETTE_PREVIEWS,
  type MyFinThemeName,
} from '../../theme';

const ThemePaletteIndicator = ({
  themeName,
  label,
}: {
  themeName: MyFinThemeName;
  label: string;
}) => (
  <Stack component="span" direction="row" alignItems="center" gap={1}>
    <Stack
      component="span"
      direction="row"
      aria-hidden
      sx={{
        width: 72,
        height: 18,
        borderRadius: 1,
        overflow: 'hidden',
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {MY_FIN_THEME_PALETTE_PREVIEWS[themeName].map((color, index) => (
        <Box
          component="span"
          key={`${themeName}-${index}`}
          sx={{ flex: 1, backgroundColor: color }}
        />
      ))}
    </Stack>
    <Typography component="span">{label}</Typography>
  </Stack>
);

const Profile = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const colorMode = useContext(ColorModeContext);
  const [language, setLanguage] = useState(i18next.resolvedLanguage || 'en');
  const { partiallyUpdateUserSessionData, userSessionData } = useUserData();

  useEffect(() => {
    i18next.changeLanguage(language);
    partiallyUpdateUserSessionData({ language });
  }, [language]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLanguage(event.currentTarget.value);
  }

  return (
    <>
      <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <PageHeader
            title={t('profile.profileManagement')}
            subtitle={t('profile.strapLine')}
          />
        </Box>
        <Stack spacing={2} alignItems="flex-start">
          {/* Change language */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="language-content"
              id="language-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.changeLanguage')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.changeLanguageStrapLine')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
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
                  <FormControlLabel
                    value="en"
                    control={<Radio />}
                    label="English"
                  />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          {/* Change currency */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="currency-content"
              id="currency-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.changeCurrency')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.changeCurrencyStrapline')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <ChangeCurrencyForm />
            </AccordionDetails>
          </Accordion>
          {/* Change theme */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="theme-content"
              id="theme-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.changeTheme')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.changeThemeStrapLine')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
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
                      label={
                        <ThemePaletteIndicator
                          themeName={themeName}
                          label={t(MY_FIN_THEME_LABEL_KEYS[themeName])}
                        />
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          {/* Change password */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="password-content"
              id="password-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.changePassword')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.changePasswordStrapLine')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <ChangePasswordForm />
            </AccordionDetails>
          </Accordion>
          {/* Utilities */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="tools-content"
              id="tools-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.tools')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.toolsStrapLine')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Utilities />
            </AccordionDetails>
          </Accordion>
          {/* Stats for nerds */}
          <Accordion
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'background.paper'
                  : 'background.default',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="stats-content"
              id="stats-header"
            >
              <Grid container size={12}>
                <Grid spacing={1} size={6}>
                  <Typography>{t('profile.statsForNerds')}</Typography>
                </Grid>
                <Grid>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t('profile.statsForNerdsStrapLine')}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <UserStatList />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Paper>
      <Box display="flex" justifyContent="center">
        <Stack
          direction="row"
          spacing={1}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('profile.version')}:{' '}
            <Link
              href="https://github.com/afaneca/myfin/releases"
              target="_blank"
              rel="noopener"
            >
              {import.meta.env.PACKAGE_VERSION}
            </Link>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            API:{' '}
            <Link
              href="https://github.com/afaneca/myfin-api/releases"
              target="_blank"
              rel="noopener"
            >
              {userSessionData?.apiVersion || '-'}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </>
  );
};

export default Profile;
