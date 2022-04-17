import { BigNumber } from '@ethersproject/bignumber';
import { NFTX_SUBGRAPH } from '@nftx/constants';
import { getChainConstant } from '../../utils';
import { buildWhere, gql, querySubgraph } from '../../web3/subgraph';
import { VaultActivity, VaultAddress } from '../types';
import { transformFeeReceipt } from './common';

export type Redeem = {
  id: string;
  zapAction: { ethAmount: string; id: string };
  vault: {
    id: string;
    vaultId: string;
    token: { symbol: string };
    asset: { id: string };
  };
  user: { id: string };
  date: string;
  nftIds: string[];
  specificIds: string[];
  randomCount: string;
  feeReceipt: {
    amount: string;
    date: string;
  };
};

export const createRedeemsQuery = (where: Record<string, any>) => {
  return gql`redeems(
    first: 1000,
    where: ${where},
    orderBy: date,
    orderDirection: asc
  ) {
    id
    zapAction {
      ethAmount
      id
    }
    vault {
      id
      vaultId
      token {
        symbol
      }
      asset {
        id
      }
    }
    user {
      id
    }
    date
    nftIds
    specificIds
    randomCount
    targetCount
    feeReceipt {
      amount
      date
    }
  }`;
};

export const processRedeems = async (
  response: { redeems: Redeem[] },
  network: number,
  vaultAddresses: VaultAddress[]
) => {
  let redeems = response.redeems.flatMap((redeem) => {
    const receipt = transformFeeReceipt(
      redeem.feeReceipt,
      redeem.vault.id,
      network
    );
    return redeem.nftIds.map((nftId): VaultActivity => {
      const target = redeem.specificIds?.includes(nftId);
      // TOOD: figure out a way to get msg.sender so we know if it's gem etc.
      const isBuy = redeem.zapAction != null;

      return {
        tokenId: nftId,
        vaultAddress: redeem.vault.id,
        date: Number(redeem.date),
        txId: redeem.id,
        random: !target,
        type: isBuy ? 'buy' : 'redeem',
        amount: 1,
        ethAmount: redeem?.zapAction?.ethAmount
          ? BigNumber.from(redeem.zapAction.ethAmount)
          : null,
        feeAmount: receipt.amount.div(redeem.nftIds.length),
      };
    });
  });

  if (redeems.length === 1000) {
    const lastRedeem = redeems[redeems.length - 1];
    const nextTimestamp = lastRedeem.date;
    const moreRedeems = await getRedeems({
      vaultAddresses,
      network,
      fromTimestamp: nextTimestamp,
    });

    redeems = [...redeems, ...moreRedeems];
  }

  return redeems;
};

export const getRedeems = async ({
  network,
  fromTimestamp,
  vaultAddresses,
}: {
  network: number;
  fromTimestamp: number;
  vaultAddresses: VaultAddress[];
}) => {
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses,
  });
  const query = `{ ${createRedeemsQuery(where)} }`;

  const response = await querySubgraph<{ redeems: Redeem[] }>({
    url: getChainConstant(NFTX_SUBGRAPH, network),
    query,
  });

  const mints = await processRedeems(response, network, vaultAddresses);

  return mints;
};
