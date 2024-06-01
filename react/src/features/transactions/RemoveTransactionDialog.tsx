import ConfirmationDialog from '../../components/ConfirmationDialog.tsx';
import { Transaction } from '../../services/trx/trxServices.ts';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPositiveClick: () => void;
  onNegativeClick: () => void;
  transaction: Transaction | null;
}

const RemoveTransactionDialog = (props: Props) => {
  const { t } = useTranslation();
  return (
    <ConfirmationDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      onPositiveClick={props.onPositiveClick}
      onNegativeClick={props.onNegativeClick}
      title={t('transactions.deleteTransactionModalTitle', {
        id: props.transaction?.transaction_id,
      })}
      description={t('transactions.deleteTransactionModalSubtitle')}
      positiveText={t('common.delete')}
      negativeText={t('common.cancel')}
    />
  );
};

export default RemoveTransactionDialog;
