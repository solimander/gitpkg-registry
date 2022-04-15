import { Address } from '../../web3/types';
import { Vault, VaultAddress, VaultId } from '../types';
declare const fetchVaults: ({ network, vaultAddresses, vaultIds, manager, finalised, enabled, minimumHoldings, lastId, retryCount, }: {
    network: number;
    vaultAddresses?: VaultAddress[];
    vaultIds?: VaultId[];
    minimumHoldings?: number;
    finalised?: boolean;
    enabled?: boolean;
    manager?: Address;
    lastId?: number;
    retryCount?: number;
}) => Promise<Vault[]>;
export default fetchVaults;
