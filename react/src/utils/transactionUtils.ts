import { Transaction, TransactionType } from '../services/trx/trxServices.ts';

/**
 * Infers and returns the transaction type for the given transaction
 * @param trx - the transaction
 * @returns the transaction type {TransactionType}
 */
export const inferTrxType = (
  trx: Transaction | null,
): TransactionType | null => {
  if (trx == null) return null;
  if (trx.accounts_account_from_id == null) return TransactionType.Income;
  if (trx.accounts_account_to_id == null) return TransactionType.Expense;
  return TransactionType.Transfer;
};
