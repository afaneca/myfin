import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  subtitle: string;
  titleChipText?: string;
  titleChipTooltip?: string;
  compact?: boolean;
};

const PageHeader = (props: Props) => {
  const theme = useTheme();
  const titleChip = props.titleChipText ? (
    <Chip
      label={props.titleChipText}
      size="small"
      variant="outlined"
      color="success"
      clickable={Boolean(props.titleChipTooltip)}
      aria-label={props.titleChipText}
    />
  ) : null;

  return (
    <Box mb={props.compact ? 0 : '30px'}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          fontWeight="bold"
          sx={{ m: props.compact ? 0 : '0 0 5px 0' }}
        >
          {props.title}
        </Typography>
        {titleChip &&
          (props.titleChipTooltip ? (
            <Tooltip title={props.titleChipTooltip}>{titleChip}</Tooltip>
          ) : (
            titleChip
          ))}
      </Stack>
      <Typography
        variant={props.compact ? 'body2' : 'body1'}
        color={theme.palette.primary.main}
      >
        {props.subtitle}
      </Typography>
    </Box>
  );
};

export default PageHeader;
