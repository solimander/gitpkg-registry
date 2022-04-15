import { Vault, VaultAddress, VaultId } from './types';
declare function fetchVault(args: {
    network: number;
    vaultAddress: VaultAddress;
}): Promise<Vault>;
declare function fetchVault(args: {
    network: number;
    vaultId: VaultId;
}): Promise<Vault>;
export default fetchVault;
