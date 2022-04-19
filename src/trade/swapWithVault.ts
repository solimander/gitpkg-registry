import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as abi from '@nftx/constants/abis/NFTXMarketplaceZap.json';
import * as vaultAbi from '@nftx/constants/abis/NFTXVaultUpgradeable.json';
import { VaultAddress, VaultId } from '../vaults/types';
import { Address } from '../web3/types';
import { Vault } from '../vaults';
import {
  getExactTokenIds,
  getTokenIdAmounts,
  getTotalTokenIds,
  getUniqueTokenIds,
} from './utils';
import { getContract } from '../web3';
import { getChainConstant, omitNil } from '../utils';
import { NFTX_MARKETPLACE_ZAP, WETH_TOKEN } from '@nftx/constants';
import estimateGasAndFees from './estimateGasAndFees';
import increaseGasLimit from './increaseGasLimit';

const erc721EthFee = async ({
  network,
  provider,
  vaultId,
  userAddress,
  vaultAddress,
  maxPrice,
  mintTokenIds,
  redeemTokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultId: VaultId;
  vaultAddress: VaultAddress;
  userAddress: Address;
  maxPrice: BigNumber;
  mintTokenIds: string[] | [string, number][];
  redeemTokenIds: string[] | [string, number][];
}) => {
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const redeemIds = getUniqueTokenIds(redeemTokenIds);

  const contract = getContract({
    network,
    provider,
    abi,
    address: getChainConstant(NFTX_MARKETPLACE_ZAP, network),
    type: 'write',
  });

  const path = [getChainConstant(WETH_TOKEN, network), vaultAddress];

  const args = [vaultId, mintIds, redeemIds, path, userAddress];

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
};

const erc721EthNoFee = async ({
  network,
  provider,
  vaultAddress,
  mintTokenIds,
  redeemTokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultAddress: VaultAddress;
  mintTokenIds: string[] | [string, number][];
  redeemTokenIds: string[] | [string, number][];
}) => {
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const redeemIds = getUniqueTokenIds(redeemTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);

  const contract = getContract({
    network,
    provider,
    address: vaultAddress,
    type: 'write',
    abi: vaultAbi,
  });
  return contract.swap(mintIds, amounts, redeemIds);
};

const erc1155Fee = async ({
  network,
  provider,
  vaultId,
  userAddress,
  vaultAddress,
  maxPrice,
  mintTokenIds,
  redeemTokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultId: VaultId;
  vaultAddress: VaultAddress;
  userAddress: Address;
  maxPrice: BigNumber;
  mintTokenIds: string[] | [string, number][];
  redeemTokenIds: string[] | [string, number][];
}) => {
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);
  const redeemIds = getExactTokenIds(redeemTokenIds);
  const contract = getContract({
    network,
    provider,
    abi,
    address: getChainConstant(NFTX_MARKETPLACE_ZAP, network),
    type: 'write',
  });
  const path = [getChainConstant(WETH_TOKEN, network), vaultAddress];
  const args = [vaultId, mintIds, amounts, redeemIds, path, userAddress];

  const { gasEstimate, maxFeePerGas, maxPriorityFeePerGas } =
    await estimateGasAndFees({
      args,
      contract,
      method: 'buyAndSwap1155',
      overrides: omitNil({ value: maxPrice }),
    });
  const gasLimit = increaseGasLimit({ estimate: gasEstimate, amount: 7 });

  try {
    return contract.buyAndSwap1155(
      ...args,
      omitNil({
        value: maxPrice,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      })
    );
  } catch {
    return contract.buyAndSwap1155(
      ...args,
      omitNil({
        value: maxPrice,
        gasLimit,
      })
    );
  }
};

const erc1155NoFee = async ({
  network,
  provider,
  vaultAddress,
  mintTokenIds,
  redeemTokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultAddress: VaultAddress;
  mintTokenIds: string[] | [string, number][];
  redeemTokenIds: string[] | [string, number][];
}) => {
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);
  const redeemIds = getExactTokenIds(redeemTokenIds);

  const contract = getContract({
    network,
    provider,
    address: vaultAddress,
    type: 'write',
    abi: vaultAbi,
  });
  return contract.swap(mintIds, amounts, redeemIds);
};

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
  const totalCount = getTotalTokenIds(mintTokenIds);
  const targetCount = getTotalTokenIds(redeemTokenIds);
  const randomCount = totalCount - targetCount;
  const hasFee =
    (targetCount > 0 && vault.fees.targetSwapFee.gt(0)) ||
    (randomCount > 0 && vault.fees.randomSwapFee.gt(0));

  if (quote === 'ETH') {
    if (standard === 'ERC721') {
      if (hasFee) {
        return erc721EthFee({
          maxPrice,
          mintTokenIds,
          network,
          provider,
          redeemTokenIds,
          userAddress,
          vaultAddress,
          vaultId,
        });
      }
      return erc721EthNoFee({
        mintTokenIds,
        network,
        provider,
        redeemTokenIds,
        vaultAddress,
      });
    }
    if (standard === 'ERC1155') {
      if (hasFee) {
        return erc1155Fee({
          maxPrice,
          mintTokenIds,
          network,
          provider,
          redeemTokenIds,
          userAddress,
          vaultAddress,
          vaultId,
        });
      }
      return erc1155NoFee({
        mintTokenIds,
        network,
        provider,
        redeemTokenIds,
        vaultAddress,
      });
    }
  }

  throw new Error(`swapWithVault is not supported for ${standard} / ${quote}`);
};

export default swapWithVault;
