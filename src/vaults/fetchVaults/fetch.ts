import { NFTX_SUBGRAPH } from '@nftx/constants';
import { getChainConstant } from '../../utils';
import { buildWhere, gql, querySubgraph } from '../../web3/subgraph';
import { Address } from '../../web3/types';
import { VaultAddress, VaultId } from '../types';

export type Response = {
  globals: Array<{
    fees: {
      mintFee: string;
      randomRedeemFee: string;
      targetRedeemFee: string;
      randomSwapFee: string;
      targetSwapFee: string;
    };
  }>;
  vaults: Array<{
    vaultId: string;
    id: string;
    is1155: boolean;
    isFinalized: boolean;
    totalHoldings: string;
    totalMints: string;
    totalRedeems: string;
    createdAt: string;
    holdings: Array<{
      id: string;
      tokenId: string;
      amount: string;
      dateAdded: string;
    }>;
    token: {
      id: string;
      name: string;
      symbol: string;
    };
    fees: {
      mintFee: string;
      randomRedeemFee: string;
      targetRedeemFee: string;
      randomSwapFee: string;
      targetSwapFee: string;
    };
    usesFactoryFees: boolean;
    asset: {
      id: string;
      name: string;
      symbol: string;
    };
    manager: {
      id: string;
    };
    createdBy: {
      id: string;
    };
    eligibilityModule: {
      id: string;
      eligibleIds: string[];
      eligibleRange: [string, string];
    };
    features: {
      enableMint: boolean;
      enableRandomRedeem: boolean;
      enableTargetRedeem: boolean;
      enableRandomSwap: boolean;
      enableTargetSwap: boolean;
    };
    inventoryStakingPool: {
      id: string;
      dividendToken: {
        symbol: string;
      };
    };
    lpStakingPool: {
      id: string;
      stakingToken: {
        id: string;
      };
    };
  }>;
};

const fetch = async ({
  network,
  vaultAddresses,
  vaultIds,
  manager,
  finalised,
  minimumHoldings,
  lastId = 0,
  retryCount = 0,
}: {
  network: number;
  vaultAddresses?: VaultAddress[];
  vaultIds?: VaultId[];
  minimumHoldings?: number;
  finalised?: boolean;
  manager?: Address;
  lastId?: number;
  retryCount?: number;
}): Promise<Response> => {
  const where = buildWhere({
    isFinalized: finalised,
    totalHoldings_gt: minimumHoldings,
    vaultId_in: vaultIds,
    id_in: vaultAddresses?.map((x) => x.toLowerCase()),
    manager: manager?.toLowerCase(),
    vaultId_gte: lastId,
  });

  const query = gql`{
    globals {
      fees {
        mintFee
        randomRedeemFee
        targetRedeemFee
        randomSwapFee
        targetSwapFee
      }
    }
    vaults(
      first: 1000
      where: ${where}
    ) {
      vaultId
      id
      is1155
      isFinalized
      totalHoldings
      totalMints
      totalRedeems
      createdAt
      holdings(
        first: 1000,
        orderBy: dateAdded,
        orderDirection: desc
      ) {
        id
        tokenId
        amount
        dateAdded
      }
      token {
        id
        name
        symbol
      }
      fees {
        mintFee
        randomRedeemFee
        targetRedeemFee
        randomSwapFee
        targetSwapFee
      }
      usesFactoryFees
      asset {
        id
        name
        symbol
      }
      manager {
        id
      }
      createdBy {
        id
      }
      eligibilityModule {
        id
        eligibleIds
        eligibleRange
      }
      features {
        enableMint
        enableRandomRedeem
        enableTargetRedeem
        enableRandomSwap
        enableTargetSwap
      }
      inventoryStakingPool {
        id
        dividendToken {
          id
          name
          symbol
        }
      }
      lpStakingPool {
        id
        stakingToken {
          id
          name
          symbol
        }
      }
    }
  }`;

  let data: Response;

  try {
    data = await querySubgraph<Response>({
      url: getChainConstant(NFTX_SUBGRAPH, network),
      query,
    });
  } catch (e) {
    console.error(e);
    if (retryCount < 3) {
      return fetch({
        network,
        finalised,
        lastId,
        manager,
        vaultAddresses,
        vaultIds,
        retryCount: retryCount + 1,
      });
    }
    throw e;
  }

  return data;
};

export default fetch;
