import { VaultAddress, VaultFeeReceipt } from './types';
declare function fetchVaultFees(args: {
    network: number;
    vaultAddress: VaultAddress;
    fromTimestamp?: number;
    retryCount?: number;
}): Promise<VaultFeeReceipt[]>;
declare function fetchVaultFees(args: {
    network: number;
    vaultAddresses: VaultAddress[];
    fromTimestamp?: number;
    retryCount?: number;
}): Promise<VaultFeeReceipt[]>;
export default fetchVaultFees;
