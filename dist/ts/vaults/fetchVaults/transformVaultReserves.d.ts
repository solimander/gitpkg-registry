import { BigNumber } from '@ethersproject/bignumber';
import { TokenReserve } from '../../tokens';
declare const transformVaultReserves: (reserves: TokenReserve) => {
    derivedETH: BigNumber;
    rawPrice: BigNumber;
    reserveVtoken: BigNumber;
    reserveWeth: BigNumber;
};
export default transformVaultReserves;
