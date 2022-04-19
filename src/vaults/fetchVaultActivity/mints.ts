import { BigNumber } from '@ethersproject/bignumber';
import { NFTX_SUBGRAPH, NFTX_STAKING_ZAP } from '@nftx/constants';
import { getChainConstant } from '../../utils';
import { addressEqual } from '../../web3';
import { buildWhere, gql, querySubgraph } from '../../web3/subgraph';
import { VaultActivity, VaultAddress } from '../types';
import { transformFeeReceipt } from './common';

export type Mint = {
  id: string;
  zapAction: {
    ethAmount: string;
    id: string;
  };
  vault: {
    id: string;
    vaultId: string;
    token: { symbol: string };
    asset: { id: string };
    inventoryStakingPool: { id: string };
  };
  user: { id: string };
  date: string;
  nftIds: string[];
  amounts: string[];
  feeReceipt: { amount: string; date: string };
};

export const createMintsQuery = (where: Record<string, any>) => {
  return gql`mints(
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
      inventoryStakingPool {
        id
      }
    }
    user {
      id
    }
    date
    nftIds
    amounts
    feeReceipt {
      amount
      date
    }
  }`;
};

const isStakeOrMint = (mint: Mint, network: number) => {
  if (
    addressEqual(mint.user?.id, getChainConstant(NFTX_STAKING_ZAP, network))
  ) {
    // LP Stake
    return 'stake';
  }
  if (addressEqual(mint.user?.id, mint.vault.inventoryStakingPool?.id)) {
    // Inventory Stake
    return 'stake';
  }

  if (mint.zapAction) {
    return 'sell';
  }

  return 'mint';
};

export const processMints = async (
  response: { mints: Mint[] },
  network: number,
  vaultAddresses: VaultAddress[]
) => {
  let mints = response.mints.flatMap((mint): VaultActivity[] => {
    const receipt = transformFeeReceipt(
      mint.feeReceipt,
      mint.vault.id,
      network
    );
    const type = isStakeOrMint(mint, network);

    return mint.nftIds.map((nftId, i): VaultActivity => {
      return {
        vaultAddress: mint.vault.id,
        date: Number(mint.date),
        tokenId: nftId,
        txId: mint.id,
        amount: Number(mint.amounts[i]),
        ethAmount: BigNumber.from(mint?.zapAction?.ethAmount ?? 0),
        feeAmount: receipt.amount.div(mint.nftIds.length),
        type,
      };
    });
  });

  if (mints.length === 1000) {
    const lastMint = mints[mints.length - 1];
    const nextTimestamp = lastMint.date;
    const moreMints = await getMints({
      network,
      vaultAddresses,
      fromTimestamp: Number(nextTimestamp),
    });
    mints = [...mints, ...moreMints];
  }

  return mints;
};

export const getMints = async ({
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
  const query = `{ ${createMintsQuery(where)} }`;

  const response = await querySubgraph<{ mints: Mint[] }>({
    url: getChainConstant(NFTX_SUBGRAPH, network),
    query,
  });

  const mints = await processMints(response, network, vaultAddresses);

  return mints;
};
