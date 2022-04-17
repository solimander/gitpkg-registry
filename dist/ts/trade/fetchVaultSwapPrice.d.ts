import { JsonRpcProvider } from '@ethersproject/providers';
import { Vault } from '../vaults';
declare const fetchVaultSwapPrice: ({ network, provider, vault, targetSwaps, randomSwaps, }: {
    network: number;
    provider: JsonRpcProvider;
    vault: Pick<Vault, 'fees' | 'id'>;
    targetSwaps?: number;
    randomSwaps?: number;
}) => Promise<import("@ethersproject/bignumber").BigNumber>;
export default fetchVaultSwapPrice;
