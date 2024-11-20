import styled from '@mui/material/styles/styled';
import Typography from '@mui/material/Typography/Typography';

export const PanelTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  ...theme.typography.overline,
}));
