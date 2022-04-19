import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';
import { WeiPerEther, Zero } from '@ethersproject/constants';
import { TokenReserve } from '../../tokens';

function midQuote(
  amountA: BigNumber,
  reserveA: BigNumber,
  reserveB: BigNumber
) {
  if (!amountA.gt(0)) {
    return false;
  }
  if (!reserveA.gt(0) || !reserveB.gt(0)) {
    return false;
  }

  const amountB = amountA.mul(reserveB).div(reserveA);

  return amountB;
}

// given an output amount of an asset and pair reserves, returns a required input amount of the other asset
function getAmountIn(
  amountOut: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
) {
  if (!amountOut.gt(0)) {
    return false;
  }
  if (!reserveIn.gt(0) || !reserveOut.gt(0)) {
    return false;
  }

  const numerator = reserveIn.mul(amountOut).mul(1000);
  const denominator = reserveOut.sub(amountOut).mul(997);

  // not enough liquidity
  if (denominator.eq(0) || numerator.eq(0)) {
    return false;
  }

  return numerator.div(denominator).add(1);
}

// given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
function getAmountOut(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
) {
  if (!amountIn.gt(0)) {
    return false;
  }
  if (!reserveIn.gt(0) || !reserveOut.gt(0)) {
    return false;
  }

  const amountInWithFee = amountIn.mul(997);
  const numerator = amountInWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(amountInWithFee);

  // not enough liquidity
  if (denominator.eq(0) || numerator.eq(0)) {
    return false;
  }

  return numerator.div(denominator);
}

const calcMidPrice = (reserve: TokenReserve, amount = '1') => {
  if (amount && reserve.reserveVtoken && reserve.reserveWeth) {
    return midQuote(
      parseEther(amount),
      reserve.reserveVtoken,
      reserve.reserveWeth
    );
  }

  return false;
};

const calcBuyPrice = (reserve: TokenReserve, amount = '1') =>
  getAmountIn(parseEther(amount), reserve.reserveWeth, reserve.reserveVtoken);

const calcSellPrice = (reserve: TokenReserve, amount = '1') =>
  getAmountOut(parseEther(amount), reserve.reserveVtoken, reserve.reserveWeth);

const transformVaultReserves = (reserves: TokenReserve) => {
  if (!reserves || !reserves.reserveVtoken || !reserves.reserveWeth) {
    return {
      derivedETH: Zero,
      rawPrice: Zero,
      reserveVtoken: Zero,
      reserveWeth: Zero,
    };
  }

  const midPrice = calcMidPrice(reserves);
  // use 0.25 vtoken purchase as liqudity check
  const buyPrice = calcBuyPrice(reserves, '0.25');
  const sellPrice = calcSellPrice(reserves, '0.25');

  // only show price if 10% spread or less
  const enoughLiquidity =
    buyPrice && sellPrice
      ? buyPrice
          .sub(sellPrice)
          .mul(WeiPerEther)
          .div(buyPrice)
          .lte(parseEther('0.1'))
      : false;

  if (midPrice) {
    return {
      derivedETH: enoughLiquidity ? midPrice : Zero,
      rawPrice: midPrice,
      reserveVtoken: reserves.reserveVtoken,
      reserveWeth: reserves.reserveWeth,
    };
  }

  return {
    derivedETH: Zero,
    rawPrice: Zero,
    reserveVtoken: Zero,
    reserveWeth: Zero,
  };
};

export default transformVaultReserves;
