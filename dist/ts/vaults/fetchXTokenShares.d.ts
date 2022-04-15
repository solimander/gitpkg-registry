import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultId } from './types';
declare const fetchXTokenShares: ({ network, provider, vaultIds, }: {
    network: number;
    provider: JsonRpcProvider;
    vaultIds: VaultId[];
}) => Promise<{
    vaultId: string;
    share: import("@ethersproject/bignumber").BigNumber;
}[]>;
export default fetchXTokenShares;
