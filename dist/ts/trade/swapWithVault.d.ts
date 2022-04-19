import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { VaultAddress, VaultId } from '../vaults/types';
import { Address } from '../web3/types';
import { Vault } from '../vaults';
declare const swapWithVault: ({ vault, mintTokenIds, network, provider, redeemTokenIds, userAddress, vaultAddress, vaultId, maxPrice, quote, standard, }: {
    network: number;
    provider: JsonRpcProvider;
    userAddress: Address;
    vaultId: VaultId;
    vaultAddress: VaultAddress;
    vault: {
        fees: Pick<Vault['fees'], 'randomSwapFee' | 'targetSwapFee'>;
    };
    mintTokenIds: string[] | [string, number][];
    redeemTokenIds: string[] | [string, number][];
    maxPrice?: BigNumber;
    standard?: 'ERC721' | 'ERC1155';
    quote?: 'ETH';
}) => Promise<ContractTransaction>;
export default swapWithVault;
