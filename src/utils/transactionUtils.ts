import { Transaction, TransactionType } from '../services/trx/trxServices.ts';

/**
 * Infers and returns the transaction type for the given transaction
 * @param trx - the transaction
 * @returns the transaction type {TransactionType}
 */
export const inferTrxType = (
  trx: Transaction | null,
): TransactionType | null => {
  return inferTrxTypeByAttributes(
    trx?.accounts_account_from_id,
    trx?.accounts_account_to_id,
  );
};

export const inferTrxTypeByAttributes = (
  accountFromId: bigint | undefined,
  accountToId: bigint | undefined,
) => {
  if (!accountFromId && !accountToId) return null;
  if (!accountFromId && accountToId) return TransactionType.Income;
  if (accountFromId && !accountToId) return TransactionType.Expense;
  return TransactionType.Transfer;
};
