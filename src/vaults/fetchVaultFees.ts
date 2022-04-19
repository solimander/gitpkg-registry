import { NFTX_SUBGRAPH } from '@nftx/constants';
import { getChainConstant } from '../utils';
import { gql, querySubgraph } from '../web3/subgraph';
import { transformFeeReceipt } from './fetchVaultActivity/common';
import { VaultAddress, VaultFeeReceipt } from './types';

const fetchSingleVaultFees = async ({
  vaultAddress,
  fromTimestamp,
  network,
  retryCount = 0,
}: {
  vaultAddress: string;
  fromTimestamp: number;
  network: number;
  retryCount?: number;
}): Promise<VaultFeeReceipt[]> => {
  const query = gql`{
      vault(id: ${vaultAddress}) {
        feeReceipts(
          first: 1000,
          where: {
            date_gt: ${fromTimestamp}
          },
          orderBy: date,
          orderDirection: asc
        ) {
          amount
          date
        }
      }
    }`;

  try {
    const data = await querySubgraph<{
      vault: { feeReceipts: Array<{ amount: string; date: string }> };
    }>({
      url: getChainConstant(NFTX_SUBGRAPH, network),
      query,
    });

    let receipts = data?.vault?.feeReceipts?.map((receipt) => {
      return transformFeeReceipt(receipt, vaultAddress, network);
    });

    if (receipts.length === 1000) {
      const moreReceipts = await fetchVaultFees({
        network,
        vaultAddress,
        retryCount: 0,
        fromTimestamp: receipts[receipts.length - 1].date,
      });
      receipts = [...receipts, ...moreReceipts];
    }

    return receipts;
  } catch (e) {
    if (retryCount < 3) {
      return fetchSingleVaultFees({
        fromTimestamp,
        network,
        vaultAddress,
        retryCount: retryCount + 1,
      });
    }
    throw e;
  }
};

const fetchMultiVaultFees = async ({
  network,
  vaultAddresses,
  fromTimestamp,
  lastId = 0,
  retryCount = 0,
}: {
  network: number;
  vaultAddresses: VaultAddress[];
  fromTimestamp: number;
  lastId?: number;
  retryCount?: number;
}): Promise<VaultFeeReceipt[]> => {
  const query = gql`{
    vaults(
      first: 1000,
      where: {
        id_in: ${vaultAddresses.map((x) => x.toLowerCase())}
        vaultId_gte: ${lastId}
      }
    ) {
      id
      vaultId
      feeReceipts(
        first: 1000
        where: {
          date_gt: ${fromTimestamp}
        }
        orderBy: date
        orderDirection: asc
      ) {
        amount
        date
      }
    }
  }`;

  try {
    const data = await querySubgraph<{
      vaults: Array<{
        id: string;
        vaultId: string;
        feeReceipts: Array<{ amount: string; date: string }>;
      }>;
    }>({
      url: getChainConstant(NFTX_SUBGRAPH, network),
      query,
    });

    const feeReceipts = await Promise.all(
      data?.vaults?.map(async (vault) => {
        let receipts = vault.feeReceipts.map((receipt) => {
          return transformFeeReceipt(receipt, vault.id, network);
        });
        if (receipts.length === 1000) {
          const moreReceipts = await fetchSingleVaultFees({
            network,
            vaultAddress: vault.id,
            fromTimestamp: receipts[receipts.length - 1].date,
          });
          receipts = [...receipts, ...moreReceipts];
        }
        return receipts;
      }) ?? []
    ).then((x) => x.flat());

    return feeReceipts;
  } catch (e) {
    if (retryCount < 3) {
      return fetchMultiVaultFees({
        fromTimestamp,
        network,
        vaultAddresses,
        lastId,
        retryCount: retryCount + 1,
      });
    }
    throw e;
  }
};

function fetchVaultFees(args: {
  network: number;
  vaultAddress: VaultAddress;
  fromTimestamp?: number;
  retryCount?: number;
}): Promise<VaultFeeReceipt[]>;
function fetchVaultFees(args: {
  network: number;
  vaultAddresses: VaultAddress[];
  fromTimestamp?: number;
  retryCount?: number;
}): Promise<VaultFeeReceipt[]>;
async function fetchVaultFees({
  network,
  vaultAddress,
  vaultAddresses,
  fromTimestamp = 0,
}: {
  network: number;
  vaultAddress?: VaultAddress;
  vaultAddresses?: VaultAddress[];
  fromTimestamp?: number;
}) {
  if (vaultAddress) {
    return fetchSingleVaultFees({
      vaultAddress,
      fromTimestamp,
      network,
    });
  }
  if (vaultAddresses?.length) {
    return fetchMultiVaultFees({
      vaultAddresses,
      fromTimestamp,
      network,
    });
  }
  return [];
}

export default fetchVaultFees;
