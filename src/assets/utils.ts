import { CRYPTOKITTIES, CRYPTOPUNKS } from '@nftx/constants';
import { addressEqual } from '../web3';
import { Address } from '../web3/types';

export const isCryptoPunk = (address: Address) => {
  return addressEqual(address, CRYPTOPUNKS);
};

export const isCryptoKitty = (address: Address) => {
  return addressEqual(address, CRYPTOKITTIES);
};

export const isNonstandard721 = (address: Address) => {
  return isCryptoPunk(address) || isCryptoKitty(address);
};
