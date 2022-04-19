import { NFTX_SUBGRAPH, Network } from '@nftx/constants';
import { Token } from '../tokens/types';
import { getChainConstant } from '../utils';
import { Vault, VaultAddress } from '../vaults/types';
import { buildWhere, gql, querySubgraph } from '../web3/subgraph';
import { LiquidityPool } from './types';

type Response = {
  pools: Array<{
    id: string;
    vault: Pick<Vault, 'id' | 'vaultId'>;
    deployBlock: string;
    stakingToken: Token;
    dividendToken: Token;
    rewardToken: Token;
  }>;
};

function getSafeStakingBlockHeight(network: number) {
  switch (network) {
    case Network.Mainnet:
      return 13011203;
    case Network.Rinkeby:
      return 9087000;
    default:
      return 0;
  }
}

const ARBITRUM_EXCEPTION_POOL_ID = '0xc5d592305a8ac4cce16485ab46b6b8bf593f5bce';

const fetchPools = async ({
  network,
  vaultAddress,
}: {
  network: number;
  vaultAddress?: VaultAddress;
}) => {
  const deployBlock = getSafeStakingBlockHeight(network);

  const query = gql`{
    pools(
      first: 1000,
      where: ${buildWhere({
        vault: vaultAddress,
        deployBlock_gtw: deployBlock,
        id_not: ARBITRUM_EXCEPTION_POOL_ID,
      })}
    ) {
      id
      vault {
        id
        vaultId
      }
      deployBlock
      stakingToken {
        id
        name
        symbol
      }
      dividendToken {
        id
        name
        symbol
      }
      rewardToken {
        id
        name
        symbol
      }
    }
  }`;
  const data = await querySubgraph<Response>({
    url: getChainConstant(NFTX_SUBGRAPH, network),
    query,
  });

  return data?.pools?.map(
    ({
      id,
      deployBlock,
      dividendToken,
      rewardToken,
      stakingToken,
      vault: { id: vaultAddress, vaultId },
    }) => {
      const pool: LiquidityPool = {
        id,
        deployBlock,
        dividendToken,
        rewardToken,
        stakingToken,
        vaultAddress,
        vaultId,
      };
      return pool;
    }
  );
};

export default fetchPools;
