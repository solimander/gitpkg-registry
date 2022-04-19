import { Zero } from '@ethersproject/constants';
import { Vault } from './types';

export const isVaultSwappable = (vault: Pick<Vault, 'features'>) => {
  return (
    vault?.features?.enableTargetSwap ||
    vault?.features?.enableRandomSwap ||
    false
  );
};

export const doesVaultHaveTargetSwapFee = (vault: Pick<Vault, 'fees'>) => {
  return (vault?.fees?.targetSwapFee ?? Zero).isZero() === false;
};

export const doesVaultHaveRandomSwapFee = (vault: Pick<Vault, 'fees'>) => {
  return (vault?.fees?.randomSwapFee ?? Zero).isZero() === false;
};
