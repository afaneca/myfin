import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box/Box';
import Button from '@mui/material/Button/Button';
import Container from '@mui/material/Container/Container';
import TextField from '@mui/material/TextField/TextField';
import { useNavigate } from 'react-router-dom';
import {
  useAuthStatus,
  useLogin,
  useRegister,
} from '../../services/auth/authHooks.ts';
import { ROUTE_DASHBOARD } from '../../providers/RoutesProvider.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import { AxiosError } from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const loader = useLoading();
  const authStatus = useAuthStatus(true);
  const loginRequest = useLogin();
  const registerRequest = useRegister();
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(
    username: string,
    password: string,
    email?: string,
  ) {
    if (isLogin) loginRequest.mutate({ username, password });
    else registerRequest.mutate({ username, password, email: email ?? '' });
  }

  const formValidationSchema = yup.object().shape({
    username: yup.string().min(3).required(t('login.fillAllFields')),
    password: yup.string().required(t('login.fillAllFields')),
    showEmail: yup.boolean(),
    email: yup
      .string()
      .email()
      .when('showEmail', (showEmail, schema) => {
        if (showEmail) return schema.required(t('login.fillAllFields'));
        return schema;
      }),
  });

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
    if (registerRequest.isSuccess) {
      snackbar.showSnackbar(
        t('login.userSuccessfullyAdded'),
        AlertSeverity.SUCCESS,
      );
      setIsLogin(true);
    } else if (registerRequest.isError) {
      const error = registerRequest.error as AxiosError;
      if (error?.response?.status === 401) {
        snackbar.showSnackbar(
          t('login.addUserDisabledError'), // Add this to your translations
          AlertSeverity.ERROR,
        );
      } else {
        snackbar.showSnackbar(
          t('common.somethingWentWrongTryAgain'),
          AlertSeverity.ERROR,
        );
      }
    }
  }, [registerRequest.isSuccess, registerRequest.isError]);

  useEffect(() => {
    if (authStatus.isAuthenticated) {
      navigate(ROUTE_DASHBOARD);
    }
  }, [authStatus.isAuthenticated]);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (loginRequest.isPending || registerRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [loginRequest.isPending, registerRequest.isPending]);

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
            initialValues={{
              username: '',
              password: '',
              email: '',
              showEmail: !isLogin, // Dynamically set based on isLogin
            }}
            validationSchema={formValidationSchema}
            onSubmit={(values) =>
              handleSubmit(values.username, values.password, values.email)
            }
          >
            {(props) => {
              return (
                <Form>
                  {!isLogin && ( // Show email field only when not in login mode
                    <TextField
                      id="email"
                      name="email"
                      label="Email"
                      margin="normal"
                      fullWidth
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      error={props.touched.email && Boolean(props.errors.email)}
                      helperText={props.touched.email && props.errors.email}
                    />
                  )}
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
                    {t(isLogin ? 'login.signIn' : 'login.signUp')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => setIsLogin(!isLogin)} // Toggle isLogin state
                    style={{ marginTop: '16px' }}
                  >
                    {isLogin
                      ? t('login.signUp')
                      : t('login.alreadyRegisteredQuestion')}
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
