import { styled } from '@mui/material/styles';
import { MyFinTheme } from '../theme';

interface DropzoneBoxProps {
  theme?: MyFinTheme;
  isFocused?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
}

const UploadDropzoneBox = styled('div')<DropzoneBoxProps>(({
  theme,
  isFocused,
  isDragAccept,
  isDragReject,
}) => {
  const getColor = () => {
    if (isDragAccept) {
      return theme.palette.primary.main;
    }
    if (isDragReject) {
      return theme.palette.error.light;
    }
    if (isFocused) {
      return theme.palette.primary.main;
    }
    return theme.palette.background.default;
  };

  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2.5), // 20px equivalent
    borderWidth: 2,
    borderRadius: 2,
    borderColor: getColor(),
    borderStyle: 'dashed',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.disabled,
    outline: 'none',
    transition: 'border 0.24s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      // You can add hover effects here if needed
      backgroundColor: theme.palette.background.default,
      transition: 'background 0.24s ease-in-out',
    },
  };
});

export default UploadDropzoneBox;
