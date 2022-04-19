import { VaultActivity, VaultAddress } from '../types';
export declare type Swap = {
    id: string;
    zapAction: {
        ethAmount: string;
        id: string;
    };
    vault: {
        id: string;
        vaultId: string;
        token: {
            symbol: string;
        };
        asset: {
            id: string;
        };
        inventoryStakingPool: {
            id: string;
        };
    };
    date: string;
    mintedIds: string[];
    redeemedIds: string[];
    specificIds: string[];
    randomCount: string;
    targetCount: string;
    feeReceipt: {
        amount: string;
        date: string;
    };
};
export declare const createSwapsQuery: (where: Record<string, any>) => string;
export declare const processSwaps: (response: {
    swaps: Swap[];
}, network: number, vaultAddresses: VaultAddress[]) => Promise<VaultActivity[]>;
export declare const getSwaps: ({ network, fromTimestamp, vaultAddresses, }: {
    network: number;
    fromTimestamp: number;
    vaultAddresses: VaultAddress[];
}) => Promise<VaultActivity[]>;
