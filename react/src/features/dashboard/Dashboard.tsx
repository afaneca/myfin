import { Box, Button, Paper, Stack, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../../services/authHooks.ts";
import PageHeader from "../../components/PageHeader.tsx";
import { useLoading } from "../../providers/LoadingProvider.tsx";
import { useSnackbar } from "../../providers/SnackbarProvider.tsx";
import { ROUTE_PROFILE, ROUTE_AUTH } from "../../providers/RoutesProvider.tsx";

const Dashboard = () => {
    const logout = useLogout();
    const navigate = useNavigate();
    const theme = useTheme();
    const loader = useLoading();
    const snackbar = useSnackbar();

    function goToProfile() {
        navigate(ROUTE_PROFILE);
    }

    function handleLogout() {
        logout();
    }

    function showLoadingFor5Seconds() {
        loader.showLoading();
        setTimeout(() => {
            loader.hideLoading();
        }, 5_000);
    }

    function showSnackbar(){
        snackbar.showSnackbar("Teste info", "info")
        setTimeout(() => {
            snackbar.showSnackbar("Teste success", "success")
        }, 2_000)
        setTimeout(() => {
            snackbar.showSnackbar("Teste warning", "warning")
        }, 4_000)
        setTimeout(() => {
            snackbar.showSnackbar("Teste error", "error")
        }, 6_000)
    }

    return (
        <Paper elevation={2} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <PageHeader title="DASHBOARD" subtitle="Welcome to your dashboard" />
            </Box>
            <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={goToProfile}>Profile</Button>
                <Button variant="outlined" onClick={showLoadingFor5Seconds}>Show loading for 5 secs</Button>
                <Button variant="outlined" onClick={showSnackbar}>Show info snackbar</Button>
                <Button variant="contained" onClick={handleLogout}>Log out</Button>
            </Stack>
        </Paper>
    );
};

export default Dashboard;