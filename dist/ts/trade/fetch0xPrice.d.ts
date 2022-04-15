import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Address } from '../web3';
/** Fetch a quote price from the 0x api */
declare const fetch0xPrice: ({ buyToken, sellToken, amount, network, }: {
    network: number;
    buyToken: Address;
    sellToken: Address;
    amount?: BigNumberish;
}) => Promise<BigNumber>;
export default fetch0xPrice;
