import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultId } from '../vaults/types';
import { Address } from '../web3/types';
/** Buy one or more NFTs from a vault */
declare const buyFromVault: ({ network, provider, userAddress, vaultAddress, vaultId, maxPrice, randomBuys, tokenIds, standard, quote, }: {
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
}) => Promise<ContractTransaction>;
export default buyFromVault;
