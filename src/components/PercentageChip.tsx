import Chip from '@mui/material/Chip/Chip';
import { formatNumberAsPercentage } from '../utils/textUtils.ts';
import { ArrowOutward } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';

const PercentageChip = ({
  percentage,
  hideIcon,
  sx,
}: {
  percentage: number;
  hideIcon?: boolean;
  sx?: SxProps<Theme> | undefined;
}) => {
  return (
    <Chip
      sx={{ mt: 0.2, ...sx }}
      variant="outlined"
      size="small"
      color={
        percentage === 0 || !Number.isFinite(percentage)
          ? 'default'
          : percentage < 0
            ? 'warning'
            : 'success'
      }
      icon={
        hideIcon === true ||
        percentage === 0 ||
        !Number.isFinite(percentage) ? (
          <></>
        ) : percentage < 0 ? (
          <ArrowOutward sx={{ transform: 'rotate(90deg)' }} />
        ) : (
          <ArrowOutward sx={{ transform: 'rotate(0deg)' }} />
        )
      }
      label={
        percentage === 0 || !Number.isFinite(percentage)
          ? '-%'
          : formatNumberAsPercentage(percentage, true)
      }
    />
  );
};

export default PercentageChip;
