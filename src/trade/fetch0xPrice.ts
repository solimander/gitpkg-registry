import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { WeiPerEther } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { ZEROX_URL } from '@nftx/constants';
import { getChainConstant } from '../utils';
import { Address } from '../web3';

/** Fetch a quote price from the 0x api */
const fetch0xPrice = async ({
  buyToken,
  sellToken,
  amount = WeiPerEther,
  network,
}: {
  network: number;
  buyToken: Address;
  sellToken: Address;
  amount?: BigNumberish;
}) => {
  const searchParams = new URLSearchParams();
  searchParams.append('buyToken', buyToken);
  searchParams.append('sellToken', sellToken);
  searchParams.append('buyAmount', BigNumber.from(amount).toString());
  const query = searchParams.toString();
  const zeroUrl = getChainConstant(ZEROX_URL, network, null);
  if (!zeroUrl) {
    throw new Error(`${network} is not a supported network for the 0x API`);
  }
  const url = `${zeroUrl}/swap/v1/price?${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const data: { price: string } = await response.json();

  const quotePrice = parseEther(data.price);

  return quotePrice;
};

export default fetch0xPrice;
