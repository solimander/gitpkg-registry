import { Vault } from './types';
export declare const isVaultSwappable: (vault: Pick<Vault, 'features'>) => boolean;
export declare const doesVaultHaveTargetSwapFee: (vault: Pick<Vault, 'fees'>) => boolean;
export declare const doesVaultHaveRandomSwapFee: (vault: Pick<Vault, 'fees'>) => boolean;
