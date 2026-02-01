import { useState } from 'react';
import { Menu, MenuItem, Sidebar, SubMenu } from 'react-pro-sidebar';
import { NavLink } from 'react-router-dom';
import {
  AccountBalanceWalletOutlined,
  BookmarksOutlined,
  BusinessOutlined,
  DashboardOutlined,
  DisplaySettingsOutlined,
  DonutLargeOutlined,
  FolderSharedOutlined,
  InsertChartOutlined,
  LocalOfferOutlined,
  MenuOutlined,
  PaymentsOutlined,
  TipsAndUpdatesOutlined,
} from '@mui/icons-material';
import { alpha, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ROUTE_ACCOUNTS,
  ROUTE_BUDGETS,
  ROUTE_CATEGORIES,
  ROUTE_DASHBOARD,
  ROUTE_ENTITIES,
  ROUTE_INVEST,
  ROUTE_RULES,
  ROUTE_STATS,
  ROUTE_TAGS,
  ROUTE_TRX,
} from '../providers/RoutesProvider';

const MyFinSidebar = () => {
  const theme = useTheme();
  const matchesMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setCollapsed] = useState(matchesMdScreen);
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
              backgroundColor: theme.palette.background.paper,
              [`&.active`]: {
                backgroundColor: theme.palette.background.default,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 0.3),
              },
            },
            subMenuContent: {
              backgroundColor: 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 1.0),
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
                  ? '/res/logo_light_plain_transparentbg.png'
                  : '/res/logo_dark_transparentbg.png'
              }
              alt={t('sidebar.logoAlt')}
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
          <MenuItem
            icon={<BookmarksOutlined />}
            component={<NavLink to={ROUTE_BUDGETS} />}
          >
            {' '}
            {t('sidebar.budgets')}
          </MenuItem>
          <MenuItem
            icon={<AccountBalanceWalletOutlined />}
            component={<NavLink to={ROUTE_ACCOUNTS} />}
          >
            {' '}
            {t('sidebar.accounts')}
          </MenuItem>
          <MenuItem
            icon={<DonutLargeOutlined />}
            component={<NavLink to={ROUTE_INVEST} />}
          >
            {' '}
            {t('sidebar.investments')}
          </MenuItem>
          <SubMenu label={t('sidebar.meta')} icon={<DisplaySettingsOutlined />}>
            <MenuItem
              icon={<FolderSharedOutlined />}
              component={<NavLink to={ROUTE_CATEGORIES} />}
            >
              {' '}
              {t('sidebar.categories')}
            </MenuItem>
            <MenuItem
              icon={<BusinessOutlined />}
              component={<NavLink to={ROUTE_ENTITIES} />}
            >
              {' '}
              {t('sidebar.entities')}
            </MenuItem>
            <MenuItem
              icon={<LocalOfferOutlined />}
              component={<NavLink to={ROUTE_TAGS} />}
            >
              {' '}
              {t('sidebar.tags')}
            </MenuItem>
            <MenuItem
              icon={<TipsAndUpdatesOutlined />}
              component={<NavLink to={ROUTE_RULES} />}
            >
              {' '}
              {t('sidebar.rules')}
            </MenuItem>
          </SubMenu>
          <MenuItem
            icon={<InsertChartOutlined />}
            component={<NavLink to={ROUTE_STATS} />}
          >
            {' '}
            {t('sidebar.statistics')}
          </MenuItem>
          {/*<Divider />*/}
        </Menu>
      </Sidebar>
    </div>
  );
};

export default MyFinSidebar;
