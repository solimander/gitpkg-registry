import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Address } from './types';
/** Return the total supply of a given token */
declare const fetchTotalSupply: ({ network, provider, tokenAddress, }: {
    network: number;
    provider: JsonRpcProvider;
    tokenAddress: Address;
}) => Promise<BigNumber>;
export default fetchTotalSupply;
