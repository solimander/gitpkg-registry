import { VaultAddress } from '../types';
export declare const getAll: ({ fromTimestamp, vaultAddresses, network, }: {
    network: number;
    vaultAddresses: VaultAddress[];
    fromTimestamp?: number;
}) => Promise<{
    mints: import("../types").VaultActivity[];
    swaps: import("../types").VaultActivity[];
    redeems: import("../types").VaultActivity[];
}>;
