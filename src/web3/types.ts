import { BigNumber } from '@ethersproject/bignumber';

export type Address = string;

export type NftxTokenBalance = {
  type: 'vToken' | 'xToken' | 'slp' | 'xSlp';
  balance: BigNumber;
  symbol: string;
  address: Address;
  name: string;
};

type FetchNftxTokenBalances = (args: {
  userAddress: Address;
}) => Promise<NftxTokenBalance>;
