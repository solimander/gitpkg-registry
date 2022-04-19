import type { BigNumber } from '@ethersproject/bignumber';
import type { Token } from '../tokens/types';
import type { InventoryPool, LiquidityPool } from '../pools/types';

export type VaultAddress = string;

export type VaultId = string;

export type VaultFeatures = {
  enableMint: boolean;
  enableRandomRedeem: boolean;
  enableTargetRedeem: boolean;
  enableRandomSwap: boolean;
  enableTargetSwap: boolean;
};

export type VaultHolding = {
  id: string;
  tokenId: string;
  amount: BigNumber;
  dateAdded: number;
};

export type VaultFees = {
  mintFee: BigNumber;
  randomRedeemFee: BigNumber;
  targetRedeemFee: BigNumber;
  targetSwapFee: BigNumber;
  randomSwapFee: BigNumber;
};

export type Vault = {
  vaultId: VaultId;
  id: VaultAddress;
  asset: Token;
  createdBy: { id: string };
  createdAt: number;
  derivedETH: BigNumber;
  rawPrice: BigNumber;
  reserveVtoken: BigNumber;
  reserveWeth: BigNumber;
  features: VaultFeatures;
  totalHoldings: number;
  totalMints: number;
  totalRedeems: number;
  holdings: VaultHolding[];
  is1155: boolean;
  isFinalized: boolean;
  usesFactoryFees: boolean;
  fees: VaultFees;
  manager: { id: string };
  token: Token;
  eligibilityModule: {
    id: string;
    eligibleIds: string[];
    eligibleRange: [string, string];
  };
  lpStakingPool: Pick<LiquidityPool, 'id'> & {
    stakingToken: Pick<LiquidityPool['stakingToken'], 'id'>;
  };
  inventoryStakingPool: Pick<InventoryPool, 'id'> & {
    dividendToken: Pick<InventoryPool['dividendToken'], 'symbol'>;
  };
};

export type VaultApy = unknown;

export type VaultActivity = {
  vaultAddress: VaultAddress;
  amount: number;
  ethAmount: BigNumber;
  date: number;
  feeAmount: BigNumber;
  tokenId: string;
  txId: string;
  type: 'buy' | 'sell' | 'swap' | 'mint' | 'redeem' | 'stake';
  swapTokenId?: string;
  random?: boolean;
};

export type VaultFeeReceipt = {
  vaultAddress: VaultAddress;
  amount: BigNumber;
  date: number;
};

type FetchVaultApy = (args: unknown) => Promise<VaultApy>;

type FetchVaultApys = (args: unknown) => Promise<VaultApy[]>;
