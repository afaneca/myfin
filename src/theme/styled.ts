import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const PanelTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  ...theme.typography.overline,
}));
