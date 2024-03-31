import { ReactNode } from 'react';
import { useTheme, Theme, SxProps } from '@mui/material';
import Box from '@mui/material/Box/Box';

const DataCard = ({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme> | undefined;
}) => {
  const theme = useTheme();

  return (
    <Box
      borderRadius={theme.shape.borderRadius}
      sx={{
        ...{ p: theme.spacing(2), background: theme.palette.background.paper },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default DataCard;
