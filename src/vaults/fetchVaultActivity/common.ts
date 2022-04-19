import { BigNumber } from '@ethersproject/bignumber';
import { Network } from '@nftx/constants';
import { VaultAddress, VaultFeeReceipt } from '../types';

export const transformFeeReceipt = (
  receipt: { amount: string; date: string },
  vaultAddress: VaultAddress,
  network: number
): VaultFeeReceipt => {
  const unsafeFeeCalcTime = network === Network.Mainnet ? 1642684642 : 0;
  const date = Number(receipt.date);
  let amount = BigNumber.from(receipt.amount);

  if (date > unsafeFeeCalcTime) {
    amount = amount.mul(5);
  }

  return { vaultAddress, date, amount };
};
