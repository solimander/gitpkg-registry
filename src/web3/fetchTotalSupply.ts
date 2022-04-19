import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Address } from './types';
import getContract from './getContract';
import abi from '@nftx/constants/abis/ERC20.json';

/** Return the total supply of a given token */
const fetchTotalSupply = async ({
  network,
  provider,
  tokenAddress,
}: {
  network: number;
  provider: JsonRpcProvider;
  tokenAddress: Address;
}) => {
  const contract = getContract({
    network,
    address: tokenAddress,
    provider,
    abi,
  });

  const supply: BigNumber = await contract.totalSupply();

  return supply;
};

export default fetchTotalSupply;
