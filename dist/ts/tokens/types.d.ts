import type { BigNumber } from '@ethersproject/bignumber';
import type { Address } from '../web3/types';
export declare type Token = {
    id: Address;
    name: string;
    symbol: string;
};
export declare type TokenReserve = {
    tokenId: Address;
    derivedEth: BigNumber;
    reserveVtoken: BigNumber;
    reserveWeth: BigNumber;
};
