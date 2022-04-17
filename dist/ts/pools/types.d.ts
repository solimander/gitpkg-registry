import type { Token } from '../tokens/types';
import type { VaultAddress, VaultId } from '../vaults/types';
import type { Address } from '../web3/types';
export declare type LiquidityPool = {
    id: string;
    /** the sushi token i.e. PUNK-ETH */
    stakingToken: Token;
    /** The address of the token you mint when you stake i.e. xPUNK */
    dividendToken: Token;
    /** The token rewarded for staking i.e. PUNK */
    rewardToken: Token;
    deployBlock: string;
    vaultAddress: VaultAddress;
    vaultId: VaultId;
};
export declare type InventoryPool = {
    /** the xToken address */
    id: Address;
    dividendToken: Token;
    vaultAddress: VaultAddress;
    vaultId: VaultId;
};
