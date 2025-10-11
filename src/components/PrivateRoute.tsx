import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStatus, useLogout } from '../services/auth/authHooks.ts';
import MyFinSidebar from './MyFinSidebar.tsx';
import '../app.css';
import { Box, AppBar, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Brightness4IconOutlined from '@mui/icons-material/Brightness4Outlined';
import Brightness7IconOutlined from '@mui/icons-material/Brightness7Outlined';
import { useContext, useEffect } from 'react';
import { ColorModeContext } from '../providers/MyFinThemeProvider.tsx';
import { AccountCircleOutlined, LogoutOutlined } from '@mui/icons-material';
import TopSummary from './TopSummary.tsx';
import { ROUTE_PROFILE, ROUTE_AUTH } from '../providers/RoutesProvider.tsx';

const PrivateRoute = () => {
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const authStatus = useAuthStatus(true);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  function toggleUiMode() {
    colorMode.toggleColorMode();
  }

  function goToProfile() {
    /*navigate(ROUTE_PROFILE, { replace: false });*/
    navigate(ROUTE_PROFILE);
  }

  function doLogout() {
    logout();
  }

  useEffect(() => {
    // every time the location (route) change, check if session is still valid
    authStatus.refetch();
  }, [location.pathname]);

  useEffect(() => {
    // Navigate to the authentication route if the user is no longer authenticated
    if (!authStatus.isFetching && !authStatus.isAuthenticated) {
      navigate(ROUTE_AUTH);
    }
  }, [authStatus.isFetching, authStatus.isAuthenticated, navigate]);

  return (
    <>
      {authStatus.isSuccess && (
        <Box sx={{ display: 'flex' }}>
          <MyFinSidebar />
          <main
            style={{
              width: '100vw',
              height: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <AppBar
              position="static"
              color="transparent"
              elevation={0}
              sx={{ boxShadow: 'none' }}
            >
              <Box display="flex" justifyContent="space-between" p={2}>
                <Box justifyContent="flex-start">
                  <TopSummary />
                </Box>
                <Box display="flex">
                  <IconButton
                    size="large"
                    aria-label="toggle ui"
                    aria-controls="menu-appbar"
                    aria-haspopup="false"
                    onClick={toggleUiMode}
                    color="inherit"
                  >
                    {theme.palette.mode === 'dark' ? (
                      <Brightness7IconOutlined />
                    ) : (
                      <Brightness4IconOutlined />
                    )}
                  </IconButton>
                  <IconButton
                    size="large"
                    aria-label="profile"
                    aria-controls="menu-appbar"
                    aria-haspopup="false"
                    onClick={goToProfile}
                    color="inherit"
                  >
                    <AccountCircleOutlined />
                  </IconButton>
                  <IconButton
                    size="large"
                    aria-label="profile"
                    aria-controls="menu-appbar"
                    aria-haspopup="false"
                    onClick={doLogout}
                    color="inherit"
                  >
                    <LogoutOutlined />
                  </IconButton>
                </Box>
              </Box>
            </AppBar>
            <Outlet />
          </main>
        </Box>
      )}
    </>
  );
};

export default PrivateRoute;
