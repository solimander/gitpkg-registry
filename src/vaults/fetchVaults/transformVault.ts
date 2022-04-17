import { BigNumber } from '@ethersproject/bignumber';
import { TokenReserve } from '../../tokens';
import { mapObj } from '../../utils';
import { Vault } from '../types';
import { Response } from './fetch';
import transformVaultReserves from './transformVaultReserves';

const transformVault = ({
  reserves,
  vault: x,
  globalFees,
}: {
  reserves: TokenReserve[];
  vault: Response['vaults'][0];
  globalFees: Response['globals'][0]['fees'];
}) => {
  const reserve = reserves?.find(({ tokenId }) => tokenId === x.id);

  const holdings = x.holdings.map((holding) => ({
    ...holding,
    amount: BigNumber.from(holding.amount),
    dateAdded: Number(holding.dateAdded),
  }));

  const rawFees = (x.usesFactoryFees && globalFees ? globalFees : x.fees) ?? {};
  const fees: Vault['fees'] = mapObj(rawFees, (key, value) => {
    return [key, BigNumber.from(value)];
  });

  const { derivedETH, rawPrice, reserveVtoken, reserveWeth } =
    transformVaultReserves(reserve);

  const vault: Vault = {
    ...x,
    createdAt: Number(x.createdAt),
    totalHoldings: Number(x.totalHoldings),
    totalMints: Number(x.totalMints),
    totalRedeems: Number(x.totalRedeems),
    holdings,
    fees,
    derivedETH,
    rawPrice,
    reserveVtoken,
    reserveWeth,
  };

  return vault;
};

export default transformVault;
