import fetchVaults from './fetchVaults';
import { Vault, VaultAddress, VaultId } from './types';

async function fetchVault(args: {
  network: number;
  vaultAddress: VaultAddress;
}): Promise<Vault>;
async function fetchVault(args: {
  network: number;
  vaultId: VaultId;
}): Promise<Vault>;
async function fetchVault({
  network,
  vaultAddress,
  vaultId,
}: {
  network: number;
  vaultAddress?: VaultAddress;
  vaultId?: VaultId;
}) {
  const vaults = await fetchVaults({
    network,
    vaultIds: vaultId == null ? null : [vaultId],
    vaultAddresses: vaultAddress == null ? null : [vaultAddress],
  });

  return vaults?.[0];
}

export default fetchVault;
