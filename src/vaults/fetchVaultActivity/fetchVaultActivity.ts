import { VaultActivity, VaultAddress } from '../types';
import { getAll } from './getAll';

type Result = {
  mints: VaultActivity[];
  redeems: VaultActivity[];
  swaps: VaultActivity[];
};

function fetchVaultActivity(args: {
  network: number;
  vaultAddress: VaultAddress;
  fromTimestamp?: number;
}): Promise<Result>;
function fetchVaultActivity(args: {
  network: number;
  vaultAddresses: VaultAddress[];
  fromTimestamp?: number;
}): Promise<Result>;
function fetchVaultActivity({
  network,
  fromTimestamp,
  vaultAddress,
  vaultAddresses = [vaultAddress],
}: {
  network: number;
  vaultAddress?: VaultAddress;
  vaultAddresses?: VaultAddress[];
  fromTimestamp?: number;
}) {
  return getAll({ network, vaultAddresses, fromTimestamp });
}

export default fetchVaultActivity;
