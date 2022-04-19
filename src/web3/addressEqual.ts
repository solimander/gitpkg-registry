import { Address } from './types';

// TODO: there's quite a lot of other logic in useDapp's addressEqual function
const addressEqual = (a: Address, b: Address) => {
  if (!a || !b) {
    return false;
  }
  return a.toLowerCase() === b.toLowerCase();
};

export default addressEqual;
