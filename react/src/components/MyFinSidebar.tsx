import {useState} from 'react';
import {Sidebar, Menu, MenuItem} from "react-pro-sidebar";
import {NavLink} from "react-router-dom";
import {AccountCircleOutlined, DashboardOutlined, MenuOutlined, PaymentsOutlined} from "@mui/icons-material";
import {alpha, darken, lighten, useTheme} from "@mui/material";
import { ROUTE_DASHBOARD, ROUTE_TRX } from '../providers/RoutesProvider';

const MyFinSidebar = () => {

    const [isCollapsed, setCollapsed] = useState(false);
    const theme = useTheme();

    function toggleSidebarCollapse() {
        setCollapsed(!isCollapsed);
    }

    return (
        <div>
            <Sidebar style={{height:'100vh',top:0, border: 0}}
                     backgroundColor={theme.palette.background.paper}
                     collapsed={isCollapsed}>
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
                        icon={<MenuOutlined/>}
                        onClick={() => {
                            toggleSidebarCollapse();
                        }}
                        style={{textAlign: "center", marginBottom: "10px"}}
                    >
                        {" "}
                        <h2>MyFin</h2>
                    </MenuItem>
                    <MenuItem icon={<DashboardOutlined/>}
                              component={<NavLink to={ROUTE_DASHBOARD}/>}> Dashboard</MenuItem>
                              <MenuItem icon={<PaymentsOutlined/>}
                              component={<NavLink to={ROUTE_TRX}/>}> Transactions</MenuItem>
                </Menu>
            </Sidebar>
        </div>
    );
};

export default MyFinSidebar;