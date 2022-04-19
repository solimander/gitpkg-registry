import { JsonRpcProvider } from '@ethersproject/providers';
import fetchXTokenShare from './fetchXTokenShare';
import { VaultId } from './types';

const fetchXTokenShares = async ({
  network,
  provider,
  vaultIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultIds: VaultId[];
}) => {
  const shares = await Promise.all(
    vaultIds.map(async (vaultId) => {
      const share = await fetchXTokenShare({ network, provider, vaultId });
      return { vaultId, share };
    })
  );

  return shares;
};

export default fetchXTokenShares;
