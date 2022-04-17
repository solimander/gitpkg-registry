import { BigNumber } from '@ethersproject/bignumber';
/**
 * Takes a contract gas estimate and increases it by given %
 * @param call ethers estimateGas method on a contract function
 * @param amount amount to increase by (as a percentage, e.g. 5)
 * @returns
 */
export declare const increaseGasLimit: ({ estimate, amount, }: {
    estimate: BigNumber;
    amount?: number;
}) => BigNumber;
export default increaseGasLimit;
