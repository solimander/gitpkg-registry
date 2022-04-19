import { Contract as EthersContract, ContractInterface } from '@ethersproject/contracts';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
interface IMulticallContractClass {
    new <T extends Record<string, any>>(network: number, addressOrName: string, contractInterface: ContractInterface, signerOrProvider: JsonRpcSigner | JsonRpcProvider): IMulticallContract<T>;
}
declare type IMulticallContract<T extends Record<string, any>> = EthersContract & T;
declare const _default: IMulticallContractClass;
export default _default;
