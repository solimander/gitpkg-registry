import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
declare const estimateGasAndFees: ({ contract, method, args, overrides, }: {
    contract: Contract;
    method: string;
    args: any[];
    overrides?: Record<string, any>;
}) => Promise<{
    gasEstimate: BigNumber;
    maxFeePerGas: BigNumber;
    maxPriorityFeePerGas: BigNumber;
}>;
export default estimateGasAndFees;
