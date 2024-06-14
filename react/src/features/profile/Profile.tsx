import { Link, useTheme } from '@mui/material';
import Box from '@mui/material/Box/Box';
import FormControl from '@mui/material/FormControl/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import FormLabel from '@mui/material/FormLabel/FormLabel';
import Paper from '@mui/material/Paper/Paper';
import Radio from '@mui/material/Radio/Radio';
import RadioGroup from '@mui/material/RadioGroup/RadioGroup';
import Stack from '@mui/material/Stack/Stack';
import PageHeader from '../../components/PageHeader.tsx';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography/Typography';

const Profile = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18next.resolvedLanguage || 'en');

  useEffect(() => {
    i18next.changeLanguage(language);
  }, [language]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLanguage(event.currentTarget.value);
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <PageHeader
            title={t('profile.profileManagement')}
            subtitle={t('profile.strapLine')}
          />
        </Box>
        <Stack spacing={2} alignItems="flex-start">
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">
              {t('profile.changeLanguage')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
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
                value="en"
                control={<Radio />}
                label="English"
              />
            </RadioGroup>
          </FormControl>
        </Stack>
      </Paper>
      <Box display="flex" justifyContent="center">
        <Typography variant="caption">
          {t('profile.version')}:{' '}
          <Link
            href="https://github.com/afaneca/myfin/releases"
            target="_blank"
            rel="noopener"
          >
            {import.meta.env.PACKAGE_VERSION}
          </Link>
        </Typography>
      </Box>
    </>
  );
};

export default Profile;
