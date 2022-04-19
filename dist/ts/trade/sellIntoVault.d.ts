import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultAddress, VaultId } from '../vaults/types';
import { Address } from '../web3/types';
declare const sellIntoVault: ({ minPrice, network, provider, tokenIds, userAddress, vaultAddress, vaultId, quote, standard, }: {
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
}) => Promise<ContractTransaction>;
export default sellIntoVault;
