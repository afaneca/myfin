import { createContext, useContext, ReactNode, useState } from 'react';
import { AlertColor } from '@mui/material/Alert';
import MyFinSnackbar from '../components/MyFinSnackbar';

export enum AlertSeverity {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity: AlertSeverity,
    duration?: number,
  ) => void;
}

const SnackbarContext = createContext({} as SnackbarContextType);

export const useSnackbar = () => {
  return useContext(SnackbarContext);
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');
  const [duration, setDuration] = useState();

  const showSnackbar = (message: string, severity: AlertColor) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
    setOpen(true);
  };

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
  );
};
