import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultId } from '../vaults/types';
import { getContract } from '../web3';
import { Address } from '../web3/types';
import * as abi from '@nftx/constants/abis/NFTXMarketplaceZap.json';
import { NFTX_MARKETPLACE_ZAP, WETH_TOKEN } from '@nftx/constants';
import { getExactTokenIds, getTotalTokenIds } from './utils';
import estimateGasAndFees from './estimateGasAndFees';
import { getChainConstant, omitNil } from '../utils';
import increaseGasLimit from './increaseGasLimit';

const erc721 = async ({
  network,
  provider,
  userAddress,
  vaultAddress,
  vaultId,
  maxPrice,
  randomBuys,
  tokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  userAddress: Address;
  vaultId: VaultId;
  vaultAddress: Address;
  tokenIds: string[] | [string, number][];
  randomBuys: number;
  maxPrice: BigNumber;
}) => {
  const ids = getExactTokenIds(tokenIds);
  const amount = getTotalTokenIds(tokenIds) + randomBuys;
  const contract = getContract({
    network,
    provider,
    abi,
    address: getChainConstant(NFTX_MARKETPLACE_ZAP, network),
    type: 'write',
  });
  const path = [getChainConstant(WETH_TOKEN, network), vaultAddress];

  const { gasEstimate, maxFeePerGas, maxPriorityFeePerGas } =
    await estimateGasAndFees({
      contract,
      method: 'buyAndRedeem',
      args: [vaultId, amount, ids, path, userAddress],
      overrides: omitNil({ value: maxPrice?.toString() }),
    });

  const gasLimit = increaseGasLimit({ estimate: gasEstimate, amount: 7 });

  return contract.buyAndRedeem(
    vaultId,
    amount,
    ids,
    path,
    userAddress,
    omitNil({
      value: maxPrice?.toString(),
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    })
  );
};

const erc1155 = erc721;

/** Buy one or more NFTs from a vault */
const buyFromVault = async ({
  network,
  provider,
  userAddress,
  vaultAddress,
  vaultId,
  maxPrice,
  randomBuys = 0,
  tokenIds = [],
  standard = 'ERC721',
  quote = 'ETH',
}: {
  network: number;
  provider: JsonRpcProvider;
  userAddress: Address;
  vaultId: VaultId;
  vaultAddress: Address;
  /** Ids of the individual NFTs you want to buy
   * For 721s you just pass a flat array of ids ['1','2','3']
   * For 1155s if you're dealing with multiples, you pass a tuple of [tokenId, quantity] [['1', 2], ['2', 1], ['3', 2]]
   */
  tokenIds?: string[] | [string, number][];
  /** If you want to do a random buy, enter the number of randoms you want to carry out */
  randomBuys?: number;
  /** The max price (including slippage) you're willing to pay */
  maxPrice?: BigNumber;
  standard?: 'ERC721' | 'ERC1155';
  quote?: 'ETH';
}): Promise<ContractTransaction> => {
  if (quote === 'ETH') {
    if (standard === 'ERC721') {
      return erc721({
        maxPrice,
        network,
        provider,
        randomBuys,
        tokenIds,
        userAddress,
        vaultAddress,
        vaultId,
      });
    }
    if (standard === 'ERC1155') {
      return erc1155({
        maxPrice,
        network,
        provider,
        randomBuys,
        tokenIds,
        userAddress,
        vaultAddress,
        vaultId,
      });
    }
  }

  throw new Error(`buyFromVault is not supported for ${standard} / ${quote}`);
};

export default buyFromVault;
