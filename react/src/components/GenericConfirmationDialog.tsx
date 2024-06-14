import ConfirmationDialog from './ConfirmationDialog.tsx';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  titleText: string;
  descriptionText: string;
  positiveText: string;
  negativeText?: string;
}

const GenericConfirmationDialog = (props: Props) => {
  const { t } = useTranslation();
  return (
    <ConfirmationDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      onPositiveClick={props.onPositiveClick}
      onNegativeClick={props.onNegativeClick}
      title={props.titleText}
      description={props.descriptionText}
      positiveText={props.positiveText}
      negativeText={props.negativeText ?? t('common.cancel')}
    />
  );
};

export default GenericConfirmationDialog;
