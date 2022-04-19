import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Address } from '../web3/types';
declare const fetchSellPrice: ({ network, provider, tokenAddress, amount, quote, }: {
    network: number;
    provider: JsonRpcProvider;
    tokenAddress: Address;
    amount?: BigNumberish;
    quote?: 'ETH';
}) => Promise<BigNumber>;
export default fetchSellPrice;
