import { Address } from '../web3/types';
declare const fetchReservesForToken: ({ network, tokenAddress, }: {
    network: number;
    tokenAddress: Address;
}) => Promise<import("./types").TokenReserve>;
export default fetchReservesForToken;
