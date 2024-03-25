import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.tsx';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next';
import { useEffect, useState } from 'react';

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
    <Paper elevation={2} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader
          title="PROFILE"
          subtitle="Read and update your personal info"
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
            <FormControlLabel value="en" control={<Radio />} label="English" />
          </RadioGroup>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default Profile;
