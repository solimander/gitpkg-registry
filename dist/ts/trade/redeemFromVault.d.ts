import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultAddress, VaultId } from '../vaults/types';
import { Address } from '../web3/types';
/** Redeems an item from the vault
 * Exchanges, for example, 1.05 PUNK for a punk nft
 */
declare const redeemFromVault: ({ network, provider, targetIds, vaultAddress, randomRedeems, }: {
    network: number;
    provider: JsonRpcProvider;
    userAddress: Address;
    vaultId: VaultId;
    vaultAddress: VaultAddress;
    /** Ids of the individual NFTs you want to redeem
     * For 721s you just pass a flat array of ids ['1','2','3']
     * For 1155s if you're dealing with multiples, you pass a tuple of [tokenId, quantity] [['1', 2], ['2', 1], ['3', 2]]
     */
    targetIds: Array<string> | Array<[string, number]>;
    /** If you want to do a random redeem, enter the number of randoms you want to carry out */
    randomRedeems?: number;
    standard?: 'ERC721' | 'ERC1155';
    quote?: 'ETH';
}) => Promise<ContractTransaction>;
export default redeemFromVault;
