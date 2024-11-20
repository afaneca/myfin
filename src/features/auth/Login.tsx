import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box/Box';
import Button from '@mui/material/Button/Button';
import Container from '@mui/material/Container/Container';
import TextField from '@mui/material/TextField/TextField';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus, useLogin } from '../../services/auth/authHooks.ts';
import { ROUTE_DASHBOARD } from '../../providers/RoutesProvider.tsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const loader = useLoading();
  const authStatus = useAuthStatus(true);
  const loginRequest = useLogin();
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  async function handleSubmit(username: string, password: string) {
    loginRequest.mutate({ username, password });
  }

  const formValidationSchema = yup.object().shape({
    username: yup.string().min(3).required(t('login.fillAllFields')),
    password: yup.string().required(t('login.fillAllFields')),
  });

  const initialValues = {
    username: '',
    password: '',
  };

  useEffect(() => {
    if (loginRequest.isSuccess) {
      navigate(ROUTE_DASHBOARD);
    } else if (loginRequest.isError) {
      snackbar.showSnackbar(
        t('login.wrongCredentialsError'),
        AlertSeverity.ERROR,
      );
    }
  }, [loginRequest.isSuccess, loginRequest.isError]);

  useEffect(() => {
    if (authStatus.isAuthenticated) {
      navigate(ROUTE_DASHBOARD);
    }
  }, [authStatus.isAuthenticated]);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (loginRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [loginRequest.isPending]);

  return (
    <div>
      <Container maxWidth="xs">
        <Box
          p={3}
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <img
            src={
              theme.palette.mode === 'dark'
                ? '/res/logo_white_font_transparent_bg.png'
                : '/res/logo_transparent_bg_v2.png'
            }
            width="60%"
            style={{ marginBottom: 20 }}
          />
          <Formik
            initialValues={initialValues}
            validationSchema={formValidationSchema}
            onSubmit={(values) =>
              handleSubmit(values.username, values.password)
            }
          >
            {(props) => {
              return (
                <Form>
                  <TextField
                    id="username"
                    name="username"
                    label="Username"
                    margin="normal"
                    fullWidth
                    value={props.values.username}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    error={
                      props.touched.username && Boolean(props.errors.username)
                    }
                    helperText={props.touched.username && props.errors.username}
                  />
                  <TextField
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    margin="normal"
                    fullWidth
                    value={props.values.password}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    error={
                      props.touched.password && Boolean(props.errors.password)
                    }
                    helperText={props.touched.password && props.errors.password}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '16px' }}
                  >
                    {t('login.signIn')}
                  </Button>
                  <Button
                    variant="outlined"
                    type="submit"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '16px' }}
                  >
                    {t('login.signUp')}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
