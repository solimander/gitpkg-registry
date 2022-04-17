import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as abi from '@nftx/constants/abis/NFTXMarketplaceZap.json';
import { VaultAddress, VaultId } from '../vaults/types';
import { Address } from '../web3/types';
import { Vault } from '../vaults';
import { getTotalTokenIds } from './utils';
import { getContract } from '../web3';
import { getChainConstant, omitNil } from '../utils';
import { NFTX_MARKETPLACE_ZAP, WETH_TOKEN } from '@nftx/constants';
import estimateGasAndFees from './estimateGasAndFees';
import increaseGasLimit from './increaseGasLimit';

const swapWithVault = async ({
  vault,
  mintTokenIds,
  network,
  provider,
  redeemTokenIds,
  userAddress,
  vaultAddress,
  vaultId,
  maxPrice,
  quote,
  standard,
}: {
  network: number;
  provider: JsonRpcProvider;
  userAddress: Address;
  vaultId: VaultId;
  vaultAddress: VaultAddress;
  vault: { fees: Pick<Vault['fees'], 'randomSwapFee' | 'targetSwapFee'> };
  mintTokenIds: string[] | [string, number][];
  redeemTokenIds: string[] | [string, number][];
  maxPrice?: BigNumber;
  standard?: 'ERC721' | 'ERC1155';
  quote?: 'ETH';
}): Promise<ContractTransaction> => {
  if (standard === 'ERC721' && quote === 'ETH') {
    const totalCount = getTotalTokenIds(mintTokenIds);
    const targetCount = getTotalTokenIds(redeemTokenIds);
    const randomCount = totalCount - targetCount;
    const hasFee =
      (targetCount > 0 && vault.fees.targetSwapFee.gt(0)) ||
      (randomCount > 0 && vault.fees.randomSwapFee.gt(0));

    if (hasFee) {
      const contract = getContract({
        network,
        provider,
        abi,
        address: getChainConstant(NFTX_MARKETPLACE_ZAP, network),
        type: 'write',
      });

      const path = [getChainConstant(WETH_TOKEN, network), vaultAddress];

      const args = [vaultId, mintTokenIds, redeemTokenIds, path, userAddress];

      const { gasEstimate, maxFeePerGas, maxPriorityFeePerGas } =
        await estimateGasAndFees({
          contract,
          method: 'buyAndSwap721',
          args,
          overrides: omitNil({
            value: maxPrice,
          }),
        });
      const gasLimit = increaseGasLimit({ estimate: gasEstimate, amount: 7 });

      try {
        return contract.buyAndSwap721(
          ...args,
          omitNil({
            value: maxPrice,
            gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
          })
        );
      } catch {
        return contract.buyAndSwap721(
          ...args,
          omitNil({
            value: maxPrice,
            gasLimit,
          })
        );
      }
    } else {
    }
  }
  throw new Error(`swapWithVault is not supported for ${standard} / ${quote}`);
};
