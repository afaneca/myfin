
import { Box, Typography, useTheme } from '@mui/material';

type Props = {
    title: string, subtitle: string
}

const PageHeader = (props: Props) => {
    const theme = useTheme();
    return (
      <Box mb="30px">
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          fontWeight="bold"
          sx={{ m: "0 0 5px 0" }}
        >
          {props.title}
        </Typography>
        <Typography variant="body1" color={theme.palette.primary.main}>
          {props.subtitle}
        </Typography>
      </Box>
    );
}
  
  export default PageHeader;
