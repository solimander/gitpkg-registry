import { Address } from '../web3/types';
import { TokenReserve } from './types';
declare const fetchReservesForTokens: ({ network, tokenAddresses, }: {
    network: number;
    tokenAddresses: Address[];
}) => Promise<TokenReserve[]>;
export default fetchReservesForTokens;
