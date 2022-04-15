import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { NFTX_MARKETPLACE_ZAP, WETH_TOKEN } from '@nftx/constants';
import * as abi from '@nftx/constants/abis/NFTXMarketplaceZap.json';
import { getChainConstant, omitNil } from '../utils';
import { VaultAddress, VaultId } from '../vaults/types';
import { getContract } from '../web3';
import { Address } from '../web3/types';
import estimateGasAndFees from './estimateGasAndFees';
import increaseGasLimit from './increaseGasLimit';
import { getTokenIdAmounts, getUniqueTokenIds } from './utils';

const sellIntoVault = async ({
  minPrice,
  network,
  provider,
  tokenIds,
  userAddress,
  vaultAddress,
  vaultId,
  quote,
  standard,
}: {
  network: number;
  provider: JsonRpcProvider;
  userAddress: Address;
  vaultId: VaultId;
  vaultAddress: VaultAddress;
  /** Ids of the individual NFTs you want to sell
   * For 721s you just pass a flat array of ids ['1', '2']
   * For 1155s if you're dealing with multiples, you pass a tuple of [tokenId, quantity] [['1', 2], ['2', 1]]
   */
  tokenIds: string[] | [string, number][];
  /** The minimum accepted payout amount
   * for example, 4 items at 1ETH each plus 5% slippage would be 3.8ETH
   */
  minPrice: BigNumber;
  standard?: 'ERC721' | 'ERC1155';
  quote?: 'ETH';
}): Promise<ContractTransaction> => {
  const ids = getUniqueTokenIds(tokenIds);
  const path = [vaultAddress, getChainConstant(WETH_TOKEN, network)];
  const amounts = getTokenIdAmounts(tokenIds);

  const contract = getContract({
    network,
    provider,
    abi,
    address: getChainConstant(NFTX_MARKETPLACE_ZAP, network),
    type: 'write',
  });

  if (standard === 'ERC721' && quote === 'ETH') {
    const args = [vaultId, ids, minPrice, path, userAddress];

    const { gasEstimate, maxFeePerGas, maxPriorityFeePerGas } =
      await estimateGasAndFees({
        contract,
        method: 'mintAndSell721',
        args,
      });
    const gasLimit = increaseGasLimit({ estimate: gasEstimate, amount: 7 });

    try {
      // Attempt an EIP1559 transaction
      return contract.mintAndSell721(
        ...args,
        omitNil({ gasLimit, maxFeePerGas, maxPriorityFeePerGas })
      );
    } catch {
      // Fallback to a legacy tx
      return contract.mintAndSell721(
        vaultId,
        ids,
        minPrice,
        userAddress,
        omitNil({ gasLimit })
      );
    }
  }

  if (standard === 'ERC1155' && quote === 'ETH') {
    const args = [vaultId, ids, amounts, minPrice, path, userAddress];

    const { gasEstimate, maxFeePerGas, maxPriorityFeePerGas } =
      await estimateGasAndFees({ contract, method: 'mintAndSell1155', args });
    const gasLimit = increaseGasLimit({ estimate: gasEstimate, amount: 7 });

    return contract.mintAndSell1155(
      ...args,
      omitNil({
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      })
    );
  }

  throw new Error(`sellIntoVault is not supported for ${standard} / ${quote}`);
};

export default sellIntoVault;
