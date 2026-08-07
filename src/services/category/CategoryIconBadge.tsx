import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ColorGradient } from '../../consts';
import { CategoryIcon } from './categoryIcons.tsx';
import { cssGradients } from '../../utils/gradientUtils.ts';

type Props = {
  iconKey?: string | null;
  colorGradient?: string | null;
  size?: 'small' | 'medium';
};

const CategoryIconBadge = ({
  iconKey,
  colorGradient,
  size = 'medium',
}: Props) => {
  const theme = useTheme();
  const colorBackground = cssGradients[colorGradient as ColorGradient] ?? '';
  const isSmall = size === 'small';
  const boxSize = isSmall ? 22 : 30;
  const iconSize = isSmall ? 14 : 18;
  const accentInset = isSmall ? 3 : 4;
  const accentBottom = isSmall ? 2 : 3;
  const accentHeight = isSmall ? 3 : 4;
  const borderRadius = isSmall ? 0.6 : 0.75;
  const margin = isSmall ? 0.25 : 0.5;
  const iconMarginBottom = isSmall ? 0.5 : 0.75;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.action.hover,
        position: 'relative',
        margin,
        overflow: 'hidden',
        width: boxSize,
        height: boxSize,
        borderRadius,
        flexShrink: 0,
      }}
    >
      <CategoryIcon
        iconKey={iconKey}
        sx={{
          color: theme.palette.text.primary,
          fontSize: iconSize,
          zIndex: 1,
          mb: iconMarginBottom,
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: accentInset,
          right: accentInset,
          bottom: accentBottom,
          height: accentHeight,
          background: colorBackground,
          borderRadius: 999,
        }}
      />
    </Box>
  );
};

export default CategoryIconBadge;
