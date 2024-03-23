import {Formik, Form} from "formik";
import * as yup from 'yup';
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {MYFIN_BASE_API_URL} from "../../config";
import {useNavigate} from "react-router-dom";
import {useAuthStatus, useLogin} from "../../services/authHooks.ts";
import { ROUTE_DASHBOARD } from "../../providers/RoutesProvider.tsx";
import { useEffect } from "react";

const Login = () => {
    const navigate = useNavigate();
    const authStatus = useAuthStatus(true);
    const loginRequest = useLogin();

    async function handleSubmit(username: string, password: string) {
        loginRequest.mutate({username, password})
    }

    const formValidationSchema = yup.object().shape({
        username: yup.string().min(3).required('Username is required'),
        password: yup.string().required('Password is required')
    });

    const initialValues = {
        username: '',
        password: '',
    }

    useEffect(() => {
        if (loginRequest.isSuccess) {
            navigate(ROUTE_DASHBOARD);
        }
    }, [loginRequest.isSuccess, navigate]) 
    
    useEffect(() => {
        if(authStatus.isAuthenticated){
            navigate(ROUTE_DASHBOARD)
        }
    }, [authStatus.isAuthenticated, navigate])


    return (
        <div>
            <Grid container>
                <Grid item sm={6} xs={12}>
                    <Box m={5} p={3}>
                        <Typography variant="h5">Login @ {MYFIN_BASE_API_URL}</Typography>
                        {/*<Typography variant="h6">(Logged in: {localStore.isAuthenticated().toString()})</Typography>*/}
                        {loginRequest.isError && <Typography variant="h6">Credenciais inválidas!</Typography>}
                        {loginRequest.isLoading && <Typography variant="h6">Loading...</Typography>}
                        <Formik initialValues={initialValues} validationSchema={formValidationSchema}
                                onSubmit={(values) => handleSubmit(values.username, values.password)}>
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
                                            error={props.touched.username && Boolean(props.errors.username)}
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
                                            error={props.touched.password && Boolean(props.errors.password)}
                                            helperText={props.touched.password && props.errors.password}
                                        />
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            color="primary"
                                            fullWidth
                                        >
                                            Submit
                                        </Button>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default Login;