import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Address } from './types';
/** Return the user's balance of a given token */
declare const fetchTokenBalance: ({ network, ownerAddress, provider, tokenAddress, }: {
    network: number;
    provider: JsonRpcProvider;
    /** The token address */
    tokenAddress: Address;
    /** The owner (i.e. the user) whose balance we're fetching */
    ownerAddress: Address;
}) => Promise<BigNumber>;
export default fetchTokenBalance;
