import { ReactNode } from 'react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box/Box';

const DataCard = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <Box
      bgcolor="background.paper"
      borderRadius={theme.shape.borderRadius}
      sx={{ p: theme.spacing(2) }}
    >
      {children}
    </Box>
  );
};

export default DataCard;
