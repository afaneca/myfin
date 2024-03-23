import React from 'react'
import { Alert, AlertColor, Snackbar } from '@mui/material'

type Props = {
    open: boolean;
    message: string;
    duration?: number;
    handleClose: () => void;
    severity?: AlertColor;
}

/**
 * A Snackbar that automatically opens with sensible defaults
 * @param props 
 */
const MyFinSnackbar = (props: Props) => {
    return (
            <Snackbar
                open={props.open}
                autoHideDuration={props.duration ?? 5_000}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                message={props.message}
                onClose={props.handleClose}
            >
                <Alert severity={props.severity}>
                    {props.message}
                </Alert>
            </Snackbar>
    );
}

export default MyFinSnackbar