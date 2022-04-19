import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Address } from '../web3/types';
declare const isApproved: ({ network, provider, spenderAddress, tokenAddress, userAddress, amount, standard, tokenId, tokenIds, }: {
    network: number;
    provider: JsonRpcProvider;
    tokenAddress: Address;
    spenderAddress: Address;
    userAddress: Address;
    tokenId?: string;
    tokenIds?: string[];
    amount?: BigNumber;
    standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}) => Promise<boolean>;
export default isApproved;
