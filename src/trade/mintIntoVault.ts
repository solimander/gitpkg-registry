import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as abi from '@nftx/constants/abis/NFTXVaultUpgradeable.json';
import { VaultAddress, VaultId } from '../vaults/types';
import { getContract } from '../web3';
import { Address } from '../web3/types';
import { getTokenIdAmounts, getUniqueTokenIds } from './utils';

const mintIntoVault = async ({
  network,
  provider,
  tokenIds,
  vaultAddress,
}: {
  network: number;
  provider: JsonRpcProvider;
  userAddress: Address;
  vaultAddress: VaultAddress;
  vaultId: VaultId;
  /** Ids of the individual NFTs you want to mint
   * For 721s you just pass a flat array of ids ['1','2','3']
   * For 1155s if you're dealing with multiples, you pass a tuple of [tokenId, quantity] [['1', 2], ['2', 1], ['3', 2]]
   */
  tokenIds: string[] | [string, number][];
}): Promise<ContractTransaction> => {
  const ids = getUniqueTokenIds(tokenIds);
  const amounts = getTokenIdAmounts(tokenIds);

  const contract = getContract({
    network,
    provider,
    abi,
    address: vaultAddress,
    type: 'write',
  });

  return contract.mint(ids, amounts);
};

export default mintIntoVault;
