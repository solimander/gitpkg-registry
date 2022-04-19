import { JsonRpcProvider } from '@ethersproject/providers';
import { Vault } from '../vaults';
declare const fetchVaultBuyPrice: ({ vault, network, provider, targetBuys, randomBuys, }: {
    vault: Vault;
    network: number;
    provider: JsonRpcProvider;
    targetBuys?: number;
    randomBuys?: number;
}) => Promise<import("@ethersproject/bignumber").BigNumber>;
export default fetchVaultBuyPrice;
