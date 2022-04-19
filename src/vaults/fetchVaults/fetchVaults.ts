import { fetchReservesForTokens } from '../../tokens';
import { Address } from '../../web3/types';
import { Vault, VaultAddress, VaultId } from '../types';
import { OPENSEA_COLLECTION } from '@nftx/constants';
import fetch from './fetch';
import transformVault from './transformVault';
import { addressEqual } from '../../web3';

const isVaultEnabled = (vault: Vault) => {
  // finalized or DAO vaults only
  if (!vault.isFinalized) {
    return false;
  }
  // otherwise has to have following features enabled
  if (
    !vault.features.enableMint ||
    (!vault.features.enableRandomRedeem && !vault.features.enableTargetRedeem)
  ) {
    return false;
  }
  // if we have a finalised vault, make sure that if it's using OpenSea Collection it has some form of eligibilities set
  if (
    addressEqual(vault.asset.id, OPENSEA_COLLECTION) &&
    !vault.eligibilityModule?.id
  ) {
    return false;
  }
  return true;
};

const fetchVaults = async ({
  network,
  vaultAddresses,
  vaultIds,
  manager,
  finalised,
  enabled,
  minimumHoldings,
  lastId = 0,
  retryCount = 0,
}: {
  network: number;
  vaultAddresses?: VaultAddress[];
  vaultIds?: VaultId[];
  minimumHoldings?: number;
  finalised?: boolean;
  enabled?: boolean;
  manager?: Address;
  lastId?: number;
  retryCount?: number;
}): Promise<Vault[]> => {
  const data = await fetch({
    network,
    finalised,
    lastId,
    manager,
    minimumHoldings,
    retryCount,
    vaultAddresses,
    vaultIds,
  });

  const reserves = await fetchReservesForTokens({
    network,
    tokenAddresses: data?.vaults?.map(({ id }) => id) ?? [],
  });

  const globalFees = data?.globals?.[0]?.fees;

  let vaults: Vault[] =
    data?.vaults?.map((x): Vault => {
      return transformVault({
        globalFees,
        reserves,
        vault: x,
      });
    }) ?? [];

  if (vaults.length === 1000) {
    const moreVaults = await fetchVaults({
      network,
      finalised,
      manager,
      vaultAddresses,
      vaultIds,
      retryCount: 0,
      lastId: Number(vaults[vaults.length - 1].vaultId) + 1,
    });
    vaults = [...vaults, ...moreVaults];
  }

  // We only want to filter/sort once we've got all the vaults fetched
  // if lastId > 0 that means we're recursively fetching _more_ vaults
  if (lastId > 0) {
    return vaults;
  }

  // Filter out any vaults that aren't set up for use
  if (enabled) {
    vaults = vaults.filter(isVaultEnabled);
  }

  vaults.sort((a, b) => {
    const tvlB = b.derivedETH.toNumber() * b.totalHoldings;
    const tvlA = a.derivedETH.toNumber() * a.totalHoldings;
    return tvlB - tvlA;
  });

  return vaults;
};

export default fetchVaults;
