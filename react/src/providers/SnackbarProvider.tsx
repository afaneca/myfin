import { Snackbar, SnackbarContent } from "@mui/material";
import { createContext, useContext, ReactNode, useState } from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import MyFinSnackbar from "../components/MyFinSnackbar";

interface SnackbarContextType {
    showSnackbar: (message: string, serverity: AlertColor, duration?: number) => void;
}

const SnackbarContext = createContext({} as SnackbarContextType);

export const useSnackbar = () => {
    return useContext(SnackbarContext);
}

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');
    const [duration, setDuration] = useState();

    const showSnackbar = (message: string, serverity: AlertColor) => {
        setMessage(message);
        setSeverity(serverity);
        setDuration(duration)
        setOpen(true);
    }


    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            <MyFinSnackbar
                open={open}
                message={message}
                severity={severity}
                duration={duration ?? 5_000}
                handleClose={() => setOpen(false)}
            />
            {children}
        </SnackbarContext.Provider>
    )
}