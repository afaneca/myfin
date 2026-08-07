import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Public } from '@mui/icons-material';
import { ColorGradient } from '../../consts';
import { cssGradients } from '../../utils/gradientUtils.ts';
import { AccountType } from '../auth/authServices.ts';
import { AccountIcon } from './accountIcons.tsx';

type Props = {
  accountType?: AccountType | null;
  colorGradient?: string | null;
  size?: 'small' | 'compact' | 'medium';
  external?: boolean;
};

const AccountIconBadge = ({
  accountType,
  colorGradient,
  size = 'medium',
  external = false,
}: Props) => {
  const theme = useTheme();
  const colorBackground =
    cssGradients[
      (colorGradient ??
        (external ? ColorGradient.DarkGray : '')) as ColorGradient
    ] ?? '';
  const isSmall = size === 'small';
  const isCompact = size === 'compact';
  const boxSize = isSmall ? 22 : isCompact ? 26 : 30;
  const iconSize = isSmall ? 14 : isCompact ? 16 : 18;
  const accentInset = isSmall ? 3 : 4;
  const accentBottom = isSmall ? 2 : isCompact ? 3 : 3;
  const accentHeight = isSmall ? 3 : isCompact ? 3 : 4;
  const borderRadius = isSmall ? 0.6 : isCompact ? 0.7 : 0.75;
  const margin = isSmall ? 0.25 : isCompact ? 0.375 : 0.5;
  const iconMarginBottom = isSmall ? 0.5 : isCompact ? 0.625 : 0.75;

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
      {external ? (
        <Public
          sx={{
            color: theme.palette.text.primary,
            fontSize: iconSize,
            zIndex: 1,
            mb: iconMarginBottom,
          }}
        />
      ) : (
        <AccountIcon
          accountType={accountType}
          sx={{
            color: theme.palette.text.primary,
            fontSize: iconSize,
            zIndex: 1,
            mb: iconMarginBottom,
          }}
        />
      )}
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

export default AccountIconBadge;
