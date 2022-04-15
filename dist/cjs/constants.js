'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.Network = void 0;

(function (Network) {
  Network[Network["Mainnet"] = 1] = "Mainnet";
  Network[Network["Rinkeby"] = 4] = "Rinkeby";
  Network[Network["Palm"] = 11297108109] = "Palm";
  Network[Network["Arbitrum"] = 42161] = "Arbitrum";
})(exports.Network || (exports.Network = {}));

/**
 * The Cryptokitty contract (Doesn't implement 721 properly)
 */

const CRYPTOKITTIES = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
/**
 * The Punk contract (doesn't implement 721)
 */

const CRYPTOPUNKS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';
const WETH_TOKEN = {
  [exports.Network.Mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [exports.Network.Arbitrum]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [exports.Network.Rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab'
};
const USDC = {
  [exports.Network.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [exports.Network.Arbitrum]: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  [exports.Network.Rinkeby]: '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926'
};
const OPENSEA_COLLECTION = '0x495f947276749ce646f68ac8c248420045cb7b5e';
const MULTICALL = {
  [exports.Network.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  [exports.Network.Rinkeby]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [exports.Network.Arbitrum]: '0x8a0bd1773139C6609e861B9ab68082587a3cD581'
};
const NFTX_INVENTORY_STAKING = {
  [exports.Network.Mainnet]: '0x3E135c3E981fAe3383A5aE0d323860a34CfAB893',
  [exports.Network.Arbitrum]: '0x64029E2da85B1d53815d111FEd15609034E5D557',
  [exports.Network.Rinkeby]: '0x05aD54B40e3be8252CB257f77d9301E9CB1A9470'
};
const NFTX_STAKING_ZAP = {
  [exports.Network.Mainnet]: '0x7a5e0B4069709cF4D02423b8cafDc608f4436791',
  [exports.Network.Arbitrum]: '0xa12d30440D75aC533f781a2dd5fcF7EABB4C695E',
  [exports.Network.Rinkeby]: '0xeF5F5491EF04Df94638162Cb8f7CBAd64760e797'
};
const NFTX_MARKETPLACE_ZAP = {
  [exports.Network.Mainnet]: '0x0fc584529a2AEfA997697FAfAcbA5831faC0c22d',
  [exports.Network.Arbitrum]: '0x95Eaddd888c0063B392B771d11Db9704843df8bE',
  [exports.Network.Rinkeby]: '0xF83d27657a6474cB2Ae09a5b39177BBB80E63d81'
};
const SUSHISWAP_ROUTER = {
  [exports.Network.Mainnet]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  [exports.Network.Arbitrum]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506,',
  [exports.Network.Rinkeby]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
};
const UNISWAP_QUOTER = {
  [exports.Network.Mainnet]: '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6',
  [exports.Network.Rinkeby]: '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6'
};

const ROOT = 'https://gateway.thegraph.com/api';
const GRAPH_API_KEY = '690cf8d6987a151008c2536454bd3d7a';
const NON_STANDARD_SUBGRAPH = {
  [exports.Network.Mainnet]: 'https://thegraph-api.nftx.org/subgraphs/name/0xorg/non-standard-nfts',
  [exports.Network.Rinkeby]: 'https://thegraph-api.nftx.org/subgraphs/name/0xorg/non-standard-nfts-rinkeby'
};
const ERC721_SUBGRAPH = {
  [exports.Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/AVZ1dGwmRGKsbDAbwvxNmXzeEkD48voB3LfGqj5w7FUS`,
  [exports.Network.Arbitrum]: 'https://api.thegraph.com/subgraphs/name/quantumlyy/eip721-subgraph-arbitrum',
  [exports.Network.Rinkeby]: 'https://api.thegraph.com/subgraphs/name/0xorg/eip721-subgraph-rinkeby'
};
const ERC1155_SUBGRAPH = {
  [exports.Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/GCQVLurkeZrdMf4t5v5NyeWJY8pHhfE9sinjFMjLYd9C`,
  [exports.Network.Arbitrum]: 'https://api.thegraph.com/subgraphs/name/quantumlyy/eip1155-subgraph-arbitrum',
  [exports.Network.Rinkeby]: 'https://api.thegraph.com/subgraphs/name/0xorg/eip1155-subgraph-rinkeby'
};
const SUSHI_SUBGRAPH = {
  [exports.Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6`,
  [exports.Network.Arbitrum]: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
  [exports.Network.Rinkeby]: 'https://thegraph-api.nftx.org/subgraphs/name/bilalmir135/sushi-swap-exchange'
};
const NFTX_SUBGRAPH = {
  [exports.Network.Mainnet]: `${ROOT}/${GRAPH_API_KEY}/subgraphs/id/4gZf3atMXjYDh4g48Zr83NFX3rkvZED86VqMNhgEXgLc`,
  [exports.Network.Arbitrum]: `https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2-arbitrum`,
  [exports.Network.Rinkeby]: `https://api.thegraph.com/subgraphs/name/nftx-project/nftx-v2-rinkeby`
};

const ZEROX_URL = {
  [exports.Network.Mainnet]: 'https://api.0x.org'
};

exports.CRYPTOKITTIES = CRYPTOKITTIES;
exports.CRYPTOPUNKS = CRYPTOPUNKS;
exports.ERC1155_SUBGRAPH = ERC1155_SUBGRAPH;
exports.ERC721_SUBGRAPH = ERC721_SUBGRAPH;
exports.MULTICALL = MULTICALL;
exports.NFTX_INVENTORY_STAKING = NFTX_INVENTORY_STAKING;
exports.NFTX_MARKETPLACE_ZAP = NFTX_MARKETPLACE_ZAP;
exports.NFTX_STAKING_ZAP = NFTX_STAKING_ZAP;
exports.NFTX_SUBGRAPH = NFTX_SUBGRAPH;
exports.NON_STANDARD_SUBGRAPH = NON_STANDARD_SUBGRAPH;
exports.OPENSEA_COLLECTION = OPENSEA_COLLECTION;
exports.SUSHISWAP_ROUTER = SUSHISWAP_ROUTER;
exports.SUSHI_SUBGRAPH = SUSHI_SUBGRAPH;
exports.UNISWAP_QUOTER = UNISWAP_QUOTER;
exports.USDC = USDC;
exports.WETH_TOKEN = WETH_TOKEN;
exports.ZEROX_URL = ZEROX_URL;
