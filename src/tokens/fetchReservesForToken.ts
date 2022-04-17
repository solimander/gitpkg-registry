import { Address } from '../web3/types';
import fetchReservesForTokens from './fetchReservesForTokens';

const fetchReservesForToken = async ({
  network,
  tokenAddress,
}: {
  network: number;
  tokenAddress: Address;
}) => {
  const results = await fetchReservesForTokens({
    network,
    tokenAddresses: [tokenAddress],
  });
  return results?.[0];
};

export default fetchReservesForToken;
