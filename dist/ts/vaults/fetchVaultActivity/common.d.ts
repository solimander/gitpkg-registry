import { VaultAddress, VaultFeeReceipt } from '../types';
export declare const transformFeeReceipt: (receipt: {
    amount: string;
    date: string;
}, vaultAddress: VaultAddress, network: number) => VaultFeeReceipt;
