import { ContractInterface, Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import MulticallContract from './MulticallContract';
import { Address } from './types';

/** Returns an ethers.js contract
 * For "read" if multicall is supported and enabled it will return a multicall contract
 */
const getContract = <T>({
  network,
  provider,
  address,
  abi,
  type = 'read',
  multicall = true,
}: {
  network: number;
  provider: JsonRpcProvider;
  address: Address;
  abi: ContractInterface;
  type?: 'read' | 'write';
  multicall?: boolean;
}): Contract & T => {
  if (type === 'write' || !multicall) {
    return new Contract(address, abi, provider.getSigner()) as Contract & T;
  }
  return new MulticallContract<T>(network, address, abi, provider);
};

export default getContract;
