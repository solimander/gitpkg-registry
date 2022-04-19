import type { BigNumber } from '@ethersproject/bignumber';
import type { Address } from '../web3/types';

export type Token = {
  id: Address;
  name: string;
  symbol: string;
};

export type TokenReserve = {
  tokenId: Address;
  derivedEth: BigNumber;
  reserveVtoken: BigNumber;
  reserveWeth: BigNumber;
};
