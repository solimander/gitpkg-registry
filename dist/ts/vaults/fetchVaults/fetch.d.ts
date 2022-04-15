import { Address } from '../../web3/types';
import { VaultAddress, VaultId } from '../types';
export declare type Response = {
    globals: Array<{
        fees: {
            mintFee: string;
            randomRedeemFee: string;
            targetRedeemFee: string;
            randomSwapFee: string;
            targetSwapFee: string;
        };
    }>;
    vaults: Array<{
        vaultId: string;
        id: string;
        is1155: boolean;
        isFinalized: boolean;
        totalHoldings: string;
        totalMints: string;
        totalRedeems: string;
        createdAt: string;
        holdings: Array<{
            id: string;
            tokenId: string;
            amount: string;
            dateAdded: string;
        }>;
        token: {
            id: string;
            name: string;
            symbol: string;
        };
        fees: {
            mintFee: string;
            randomRedeemFee: string;
            targetRedeemFee: string;
            randomSwapFee: string;
            targetSwapFee: string;
        };
        usesFactoryFees: boolean;
        asset: {
            id: string;
            name: string;
            symbol: string;
        };
        manager: {
            id: string;
        };
        createdBy: {
            id: string;
        };
        eligibilityModule: {
            id: string;
            eligibleIds: string[];
            eligibleRange: [string, string];
        };
        features: {
            enableMint: boolean;
            enableRandomRedeem: boolean;
            enableTargetRedeem: boolean;
            enableRandomSwap: boolean;
            enableTargetSwap: boolean;
        };
        inventoryStakingPool: {
            id: string;
            dividendToken: {
                symbol: string;
            };
        };
        lpStakingPool: {
            id: string;
            stakingToken: {
                id: string;
            };
        };
    }>;
};
declare const fetch: ({ network, vaultAddresses, vaultIds, manager, finalised, minimumHoldings, lastId, retryCount, }: {
    network: number;
    vaultAddresses?: VaultAddress[];
    vaultIds?: VaultId[];
    minimumHoldings?: number;
    finalised?: boolean;
    manager?: Address;
    lastId?: number;
    retryCount?: number;
}) => Promise<Response>;
export default fetch;
