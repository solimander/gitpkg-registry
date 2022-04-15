import { Network } from './networks';

const ROOT = 'https://gateway.thegraph.com/api';
const GRAPH_API_KEY = '690cf8d6987a151008c2536454bd3d7a';

export const NON_STANDARD_SUBGRAPH = {
  [Network.Mainnet]:
    'https://thegraph-api.nftx.org/subgraphs/name/0xorg/non-standard-nfts',
  [Network.Rinkeby]:
    'https://thegraph-api.nftx.org/subgraphs/name/0xorg/non-standard-nfts-rinkeby',
};

export const ERC721_SUBGRAPH = {
  [Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/AVZ1dGwmRGKsbDAbwvxNmXzeEkD48voB3LfGqj5w7FUS`,
  [Network.Arbitrum]:
    'https://api.thegraph.com/subgraphs/name/quantumlyy/eip721-subgraph-arbitrum',
  [Network.Rinkeby]:
    'https://api.thegraph.com/subgraphs/name/0xorg/eip721-subgraph-rinkeby',
};

export const ERC1155_SUBGRAPH = {
  [Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/GCQVLurkeZrdMf4t5v5NyeWJY8pHhfE9sinjFMjLYd9C`,
  [Network.Arbitrum]:
    'https://api.thegraph.com/subgraphs/name/quantumlyy/eip1155-subgraph-arbitrum',
  [Network.Rinkeby]:
    'https://api.thegraph.com/subgraphs/name/0xorg/eip1155-subgraph-rinkeby',
};

export const SUSHI_SUBGRAPH = {
  [Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6`,
  [Network.Arbitrum]:
    'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
  [Network.Rinkeby]:
    'https://thegraph-api.nftx.org/subgraphs/name/bilalmir135/sushi-swap-exchange',
};

export const NFTX_SUBGRAPH = {
  [Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/4gZf3atMXjYDh4g48Zr83NFX3rkvZED86VqMNhgEXgLc`,
  [Network.Arbitrum]: `https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2-arbitrum`,
  [Network.Rinkeby]: `https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2-rinkeby`,
};
