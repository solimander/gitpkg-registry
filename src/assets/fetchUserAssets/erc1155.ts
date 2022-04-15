import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';
import { Network, ERC1155_SUBGRAPH } from '@nftx/constants';
import { getChainConstant } from '../../utils';
import { gql, querySubgraph } from '../../web3/subgraph';
import { Address } from '../../web3/types';
import { Asset } from '../types';

const LIMIT = 1000;

type Response = {
  account: {
    id: string;
    balances: Array<{
      id: string;
      token: {
        identifier: string;
      };
      value: string;
    }>;
  };
};

const erc1155 = async ({
  network,
  userAddress,
  assetAddress,
  lastId = 0,
  retryCount = 0,
}: {
  network: number;
  userAddress: Address;
  assetAddress: Address;
  lastId?: number;
  retryCount?: number;
}): Promise<Asset[]> => {
  const query = gql`{
    account(id: ${userAddress.toLowerCase()}) {
      id
      balances: ERC1155balances(
        first: ${LIMIT},
        where: {
          value_gt: ${lastId},
          token_contains: ${assetAddress}
        },
        orderBy: value,
        orderDirection: asc
      ) {
        id
        token {
          identifier
        }
        value
      }
    }
  }`;

  let data: Response;

  try {
    data = await querySubgraph<Response>({
      url: getChainConstant(ERC1155_SUBGRAPH, network),
      query,
    });
  } catch (e) {
    if (retryCount < 3) {
      return erc1155({
        assetAddress,
        network,
        userAddress,
        lastId,
        retryCount: retryCount + 1,
      });
    }
    throw e;
  }

  const assets = data?.account?.balances?.map(
    ({ id, token: { identifier }, value }) => {
      const [assetAddress] = id.split(network === Network.Mainnet ? '/' : '-');
      const tokenId = BigNumber.from(identifier).toString();
      const quantity =
        Number(value) < 1 ? parseEther(value) : BigNumber.from(value);

      const asset: Asset = {
        id,
        tokenId,
        assetAddress,
        quantity,
        metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`,
      };
      return asset;
    }
  );

  if (assets?.length === LIMIT) {
    const moreAssets = await erc1155({
      assetAddress,
      network,
      userAddress,
      retryCount: 0,
      lastId: Number(assets[assets.length].quantity),
    });
    return [...assets, ...moreAssets];
  }

  return assets;
};

export default erc1155;
