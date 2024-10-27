import Chip from '@mui/material/Chip/Chip';
import { formatNumberAsPercentage } from '../utils/textUtils.ts';

const PercentageChip = ({ percentage }: { percentage: number }) => {
  return (
    <Chip
      sx={{ mt: 0.2 }}
      variant="outlined"
      size="small"
      color={
        percentage === 0 || !Number.isFinite(percentage)
          ? 'default'
          : percentage < 0
            ? 'warning'
            : 'success'
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
