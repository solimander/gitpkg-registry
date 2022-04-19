import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Address } from '../web3/types';
/** Approves a spender to spend a specific token address */
declare function approve({ network, tokenAddress, spenderAddress, tokenId, tokenIds, provider, amount, standard, }: {
    network: number;
    /** The token we want to spend */
    tokenAddress: Address;
    /** The smart contract address that will be spending the token */
    spenderAddress: Address;
    provider: JsonRpcProvider;
    tokenId?: string;
    /** For ERC721/ERC1155, provide the token id or tokenIds */
    tokenIds?: string[];
    /** For ERC20, provide the amount the spender can spend - if omitted it defaults to the max amount */
    amount?: BigNumber;
    /** If the standard is omitted, we will infer either ERC721 or ERC20 based on amount/tokenId/tokenIds parameters */
    standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}): Promise<ContractTransaction>;
export default approve;
