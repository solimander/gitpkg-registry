import { NFTX_SUBGRAPH } from '@nftx/constants';
import { getChainConstant } from '../../utils';
import { buildWhere, querySubgraph } from '../../web3/subgraph';
import { VaultAddress } from '../types';
import { createMintsQuery, Mint, processMints } from './mints';
import { createRedeemsQuery, processRedeems, Redeem } from './redeems';
import { createSwapsQuery, processSwaps, Swap } from './swaps';

export const getAll = async ({
  fromTimestamp,
  vaultAddresses,
  network,
}: {
  network: number;
  vaultAddresses: VaultAddress[];
  fromTimestamp?: number;
}) => {
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses,
  });
  const query = `{
    ${createMintsQuery(where)}
    ${createRedeemsQuery(where)}
    ${createSwapsQuery(where)}
  }`;

  const response = await querySubgraph<{
    mints: Mint[];
    redeems: Redeem[];
    swaps: Swap[];
  }>({
    url: getChainConstant(NFTX_SUBGRAPH, network),
    query,
  });

  const mints = await processMints(response, network, vaultAddresses);
  const redeems = await processRedeems(response, network, vaultAddresses);
  const swaps = await processSwaps(response, network, vaultAddresses);

  return { mints, swaps, redeems };
};
