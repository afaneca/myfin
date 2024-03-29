import { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { NavLink } from 'react-router-dom';
import {
  DashboardOutlined,
  MenuOutlined,
  PaymentsOutlined,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material';
import { ROUTE_DASHBOARD, ROUTE_TRX } from '../providers/RoutesProvider';
import { useTranslation } from 'react-i18next';

const MyFinSidebar = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  function toggleSidebarCollapse() {
    setCollapsed(!isCollapsed);
  }

  return (
    <div>
      <Sidebar
        style={{ height: '100vh', top: 0, border: 0 }}
        backgroundColor={theme.palette.background.paper}
        collapsed={isCollapsed}
      >
        <Menu
          menuItemStyles={{
            button: {
              // the active class will be added automatically by react router
              // so we can use it to style the active menu item
              [`&.active`]: {
                backgroundColor: theme.palette.background.default,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 0.3),
              },
            },
          }}
        >
          <MenuItem
            icon={<MenuOutlined />}
            onClick={() => {
              toggleSidebarCollapse();
            }}
            style={{ textAlign: 'left', marginBottom: 10, marginTop: 20 }}
          >
            {' '}
            <img
              src={
                theme.palette.mode === 'dark'
                  ? '/res/logo_white_font_transparent_bg.png'
                  : '/res/logo_transparent_bg_v2.png'
              }
              style={{ width: '70%' }}
            />
          </MenuItem>
          <MenuItem
            icon={<DashboardOutlined />}
            component={<NavLink to={ROUTE_DASHBOARD} />}
            style={{ marginTop: 35 }}
          >
            {' '}
            {t('sidebar.dashboard')}
          </MenuItem>
          <MenuItem
            icon={<PaymentsOutlined />}
            component={<NavLink to={ROUTE_TRX} />}
          >
            {' '}
            {t('sidebar.transactions')}
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default MyFinSidebar;
