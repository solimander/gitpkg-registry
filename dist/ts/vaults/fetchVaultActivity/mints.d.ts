import { VaultActivity, VaultAddress } from '../types';
export declare type Mint = {
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
    user: {
        id: string;
    };
    date: string;
    nftIds: string[];
    amounts: string[];
    feeReceipt: {
        amount: string;
        date: string;
    };
};
export declare const createMintsQuery: (where: Record<string, any>) => string;
export declare const processMints: (response: {
    mints: Mint[];
}, network: number, vaultAddresses: VaultAddress[]) => Promise<VaultActivity[]>;
export declare const getMints: ({ network, fromTimestamp, vaultAddresses, }: {
    network: number;
    fromTimestamp: number;
    vaultAddresses: VaultAddress[];
}) => Promise<VaultActivity[]>;
