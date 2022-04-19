import { VaultActivity, VaultAddress } from '../types';
declare type Result = {
    mints: VaultActivity[];
    redeems: VaultActivity[];
    swaps: VaultActivity[];
};
declare function fetchVaultActivity(args: {
    network: number;
    vaultAddress: VaultAddress;
    fromTimestamp?: number;
}): Promise<Result>;
declare function fetchVaultActivity(args: {
    network: number;
    vaultAddresses: VaultAddress[];
    fromTimestamp?: number;
}): Promise<Result>;
export default fetchVaultActivity;
