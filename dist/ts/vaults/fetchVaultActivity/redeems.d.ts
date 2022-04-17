import { VaultActivity, VaultAddress } from '../types';
export declare type Redeem = {
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
    };
    user: {
        id: string;
    };
    date: string;
    nftIds: string[];
    specificIds: string[];
    randomCount: string;
    feeReceipt: {
        amount: string;
        date: string;
    };
};
export declare const createRedeemsQuery: (where: Record<string, any>) => string;
export declare const processRedeems: (response: {
    redeems: Redeem[];
}, network: number, vaultAddresses: VaultAddress[]) => Promise<VaultActivity[]>;
export declare const getRedeems: ({ network, fromTimestamp, vaultAddresses, }: {
    network: number;
    fromTimestamp: number;
    vaultAddresses: VaultAddress[];
}) => Promise<VaultActivity[]>;
