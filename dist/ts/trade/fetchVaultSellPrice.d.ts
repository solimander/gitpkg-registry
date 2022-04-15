import { JsonRpcProvider } from '@ethersproject/providers';
import { Vault } from '../vaults';
declare const fetchVaultSellPrice: ({ vault, network, provider, sells, }: {
    vault: Vault;
    network: number;
    provider: JsonRpcProvider;
    sells?: number;
}) => Promise<import("@ethersproject/bignumber").BigNumber>;
export default fetchVaultSellPrice;
