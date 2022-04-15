import { Network } from './networks';

/**
 * The Cryptokitty contract (Doesn't implement 721 properly)
 */
export const CRYPTOKITTIES = '0x06012c8cf97bead5deae237070f9587f8e7a266d';

/**
 * The Punk contract (doesn't implement 721)
 */
export const CRYPTOPUNKS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';

export const WETH_TOKEN = {
  [Network.Mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [Network.Arbitrum]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [Network.Rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab',
};

export const USDC = {
  [Network.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [Network.Arbitrum]: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  [Network.Rinkeby]: '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926',
};

export const OPENSEA_COLLECTION = '0x495f947276749ce646f68ac8c248420045cb7b5e';

export const MULTICALL = {
  [Network.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  [Network.Rinkeby]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [Network.Arbitrum]: '0x8a0bd1773139C6609e861B9ab68082587a3cD581',
};

export const NFTX_INVENTORY_STAKING = {
  [Network.Mainnet]: '0x3E135c3E981fAe3383A5aE0d323860a34CfAB893',
  [Network.Arbitrum]: '0x64029E2da85B1d53815d111FEd15609034E5D557',
  [Network.Rinkeby]: '0x05aD54B40e3be8252CB257f77d9301E9CB1A9470',
};

export const NFTX_STAKING_ZAP = {
  [Network.Mainnet]: '0x7a5e0B4069709cF4D02423b8cafDc608f4436791',
  [Network.Arbitrum]: '0xa12d30440D75aC533f781a2dd5fcF7EABB4C695E',
  [Network.Rinkeby]: '0xeF5F5491EF04Df94638162Cb8f7CBAd64760e797',
};

export const NFTX_MARKETPLACE_ZAP = {
  [Network.Mainnet]: '0x0fc584529a2AEfA997697FAfAcbA5831faC0c22d',
  [Network.Arbitrum]: '0x95Eaddd888c0063B392B771d11Db9704843df8bE',
  [Network.Rinkeby]: '0xF83d27657a6474cB2Ae09a5b39177BBB80E63d81',
};

export const SUSHISWAP_ROUTER = {
  [Network.Mainnet]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  [Network.Arbitrum]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506,',
  [Network.Rinkeby]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
};

export const UNISWAP_QUOTER = {
  [Network.Mainnet]: '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6',
  [Network.Rinkeby]: '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6',
};
