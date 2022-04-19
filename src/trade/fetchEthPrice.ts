import { BigNumber } from '@ethersproject/bignumber';
import { WeiPerEther } from '@ethersproject/constants';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  Network,
  UNISWAP_QUOTER,
  USDC,
  WETH_TOKEN,
  ZEROX_URL,
} from '@nftx/constants';
import abi from '@nftx/constants/abis/UniswapQuoter.json';
import { getChainConstant } from '../utils';
import { getContract } from '../web3';
import fetch0xPrice from './fetch0xPrice';

const fetchEthPriceFromApi = async ({ network }: { network: number }) => {
  return fetch0xPrice({
    network,
    buyToken: 'ETH',
    sellToken: 'USDC',
    amount: WeiPerEther,
  });
};

const fetchEthPriceFromWeb3 = async ({
  network,
  provider,
}: {
  network: number;
  provider: JsonRpcProvider;
}) => {
  const contract = getContract({
    network,
    provider,
    abi,
    address: getChainConstant(UNISWAP_QUOTER, network),
  });

  if (network === Network.Rinkeby) {
    // $22500 eth on rinkeby
    return BigNumber.from('2500000000');
  }

  const quote: BigNumber = await contract.quoteExactOutputSingle(
    getChainConstant(USDC, network),
    getChainConstant(WETH_TOKEN, network),
    '3000', // the fee (0.3%)
    WeiPerEther,
    '0' // don't care about pool limits etc
  );

  return quote;
};

const fetchEthPrice = async ({
  network,
  provider,
}: {
  network: number;
  provider: JsonRpcProvider;
}) => {
  const apiSupported = !!getChainConstant(ZEROX_URL, network, null);
  if (apiSupported) {
    try {
      return await fetchEthPriceFromApi({ network });
    } catch (e) {
      console.error(e);
      // fall back to uniswap
    }
  }
  return fetchEthPriceFromWeb3({ network, provider });
};

export default fetchEthPrice;
