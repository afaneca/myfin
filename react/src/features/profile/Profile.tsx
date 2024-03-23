import {Box, Button, Paper, useTheme} from "@mui/material";
import {useNavigate} from "react-router-dom";
import PageHeader from "../../components/PageHeader.tsx";
import { ROUTE_DASHBOARD } from "../../providers/RoutesProvider.tsx";

const Profile = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    function goToDashboard() {
        navigate(ROUTE_DASHBOARD);
    }

    return (
        <Paper elevation={2} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <PageHeader title="PROFILE" subtitle="Read and update your personal info" />
            </Box>
            <Button onClick={goToDashboard}>Dashboard</Button>
        </Paper>
    );
};

export default Profile;