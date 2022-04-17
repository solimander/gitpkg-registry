import { CRYPTOKITTIES, CRYPTOPUNKS } from '@nftx/constants';
import { Address } from '../web3/types';

export const isCryptoPunk = (address: Address) => {
  return address?.toLowerCase() === CRYPTOPUNKS;
};

export const isCryptoKitty = (address: Address) => {
  return address?.toLowerCase() === CRYPTOKITTIES;
};

export const isNonstandard721 = (address: Address) => {
  return isCryptoPunk(address) || isCryptoKitty(address);
};
