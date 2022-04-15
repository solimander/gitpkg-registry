import { Zero } from '@ethersproject/constants';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  doesVaultHaveRandomSwapFee,
  doesVaultHaveTargetSwapFee,
  Vault,
} from '../vaults';
import fetchBuyPrice from './fetchBuyPrice';

const fetchVaultSwapPrice = async ({
  network,
  provider,
  vault,
  targetSwaps,
  randomSwaps,
}: {
  network: number;
  provider: JsonRpcProvider;
  vault: Pick<Vault, 'fees' | 'id'>;
  targetSwaps?: number;
  randomSwaps?: number;
}) => {
  /** For waps the price is purely for the swap fee
   * so we just have to work out the total fees for the intended target/random counts
   */
  let amount = Zero;

  if (targetSwaps != null || randomSwaps != null) {
    if (targetSwaps) {
      amount = amount.add(vault.fees.targetSwapFee.mul(targetSwaps));
    }
    if (randomSwaps) {
      amount = amount.add(vault.fees.randomSwapFee.mul(randomSwaps));
    }
    /** If you don't specificy a number of swaps, we assume you want to know the price of
     * 1 random or 1 target swap (dependent on the vault)
     */
  } else if (
    doesVaultHaveRandomSwapFee(vault) &&
    !doesVaultHaveTargetSwapFee(vault)
  ) {
    amount = amount.add(vault.fees.randomSwapFee);
  } else if (doesVaultHaveTargetSwapFee(vault)) {
    amount = amount.add(vault.fees.targetSwapFee);
  }

  if (amount.isZero()) {
    return amount;
  }

  return fetchBuyPrice({
    network,
    provider,
    tokenAddress: vault.id,
    quote: 'ETH',
    amount,
  });
};

export default fetchVaultSwapPrice;
