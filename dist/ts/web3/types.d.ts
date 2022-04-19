import { BigNumber } from '@ethersproject/bignumber';
export declare type Address = string;
export declare type NftxTokenBalance = {
    type: 'vToken' | 'xToken' | 'slp' | 'xSlp';
    balance: BigNumber;
    symbol: string;
    address: Address;
    name: string;
};
