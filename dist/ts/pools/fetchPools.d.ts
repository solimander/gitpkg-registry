import { VaultAddress } from '../vaults/types';
import { LiquidityPool } from './types';
declare const fetchPools: ({ network, vaultAddress, }: {
    network: number;
    vaultAddress?: VaultAddress;
}) => Promise<LiquidityPool[]>;
export default fetchPools;
