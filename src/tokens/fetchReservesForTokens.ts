import { BigNumber } from '@ethersproject/bignumber';
import { SUSHI_SUBGRAPH, WETH_TOKEN } from '@nftx/constants';
import { getChainConstant } from '../utils';
import { gql, querySubgraph } from '../web3/subgraph';
import { Address } from '../web3/types';
import { TokenReserve } from './types';

const LIMIT = 1000;

type TokenPair = {
  id?: Address;
  derivedETH: string;
  basePairs: {
    id: string;
    reserve0: string;
    reserve1: string;
    token0: {
      id: string;
    };
    token1: {
      id: string;
    };
  }[];
  quotePairs: {
    id: string;
    reserve0: string;
    reserve1: string;
    token0: {
      id: string;
    };
    token1: {
      id: string;
    };
  }[];
};

type Response = {
  tokens: TokenPair[];
};

function formatTokenReserves(token: TokenPair, network: number) {
  const weth = getChainConstant(WETH_TOKEN, network).toLowerCase();
  // check to see if basePair is vtoken
  // PUNK-ETH
  if (token?.basePairs?.length) {
    const wethPair = token.basePairs.find(
      (p) => p.token1.id.toLowerCase() === weth
    );

    if (wethPair) {
      return {
        tokenId: token.id,
        derivedEth: BigNumber.from(token.derivedETH || 0),
        reserveVtoken: BigNumber.from(wethPair.reserve0 || 0),
        reserveWeth: BigNumber.from(wethPair.reserve1 || 0),
      };
    }
  }

  // check to see if it's the quote pair
  // ETH-PUNK
  if (token?.quotePairs?.length) {
    const wethPair = token.quotePairs.find(
      (p) => p.token0.id.toLowerCase() === weth
    );

    if (wethPair) {
      return {
        tokenId: token.id,
        derivedEth: BigNumber.from(token.derivedETH || 0),
        reserveVtoken: BigNumber.from(wethPair.reserve1 || 0),
        reserveWeth: BigNumber.from(wethPair.reserve0 || 0),
      };
    }
  }

  return {
    tokenId: token?.id,
    derivedEth: token?.derivedETH ? BigNumber.from(token.derivedETH) : null,
    reserveVtoken: null,
    reserveWeth: null,
  };
}

const fetchReservesForTokens = async ({
  network,
  tokenAddresses,
}: {
  network: number;
  tokenAddresses: Address[];
}) => {
  const query = gql`{
    tokens(
      first: ${LIMIT},
      where: {
        id_in: ${tokenAddresses.map((x) => x.toLowerCase())}
      }
    ) {
      id
      derivedETH
      quotePairs {
        id
        token0 {
          id
        }
        reserve0
        token1 {
          id
        }
        reserve1
      }
      basePairs {
        id
        token0 {
          id
        }
        reserve0
        token1 {
          id
        }
        reserve1
      }
    }
  }`;
  const response = await querySubgraph<Response>({
    url: getChainConstant(SUSHI_SUBGRAPH, network),
    query,
  });

  return response?.tokens?.map(
    (token): TokenReserve => formatTokenReserves(token, network)
  );
};

export default fetchReservesForTokens;
