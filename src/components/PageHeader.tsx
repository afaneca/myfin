import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

type Props = {
  title: string;
  subtitle: string;
  titleChipText?: string;
};

const PageHeader = (props: Props) => {
  const theme = useTheme();
  return (
    <Box mb="30px">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          fontWeight="bold"
          sx={{ m: '0 0 5px 0' }}
        >
          {props.title}
        </Typography>
        {props.titleChipText && (
          <Chip
            label={props.titleChipText}
            size="small"
            variant="outlined"
            color="success"
            aria-label={props.titleChipText}
            sx={{ fontSize: '0.6rem', }}
          />
        )}
      </Stack>
      <Typography variant="body1" color={theme.palette.primary.main}>
        {props.subtitle}
      </Typography>
    </Box>
  );
};

export default PageHeader;
