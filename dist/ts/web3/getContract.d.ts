import { ContractInterface, Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Address } from './types';
/** Returns an ethers.js contract
 * For "read" if multicall is supported and enabled it will return a multicall contract
 */
declare const getContract: <T>({ network, provider, address, abi, type, multicall, }: {
    network: number;
    provider: JsonRpcProvider;
    address: Address;
    abi: ContractInterface;
    type?: 'read' | 'write';
    multicall?: boolean;
}) => Contract & T;
export default getContract;
