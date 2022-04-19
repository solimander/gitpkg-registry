import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
declare const fetchEthPrice: ({ network, provider, }: {
    network: number;
    provider: JsonRpcProvider;
}) => Promise<BigNumber>;
export default fetchEthPrice;
