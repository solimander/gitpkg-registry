import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { VaultId } from './types';
declare const fetchXTokenShare: ({ network, provider, vaultId, }: {
    network: number;
    provider: JsonRpcProvider;
    vaultId: VaultId;
}) => Promise<BigNumber>;
export default fetchXTokenShare;
