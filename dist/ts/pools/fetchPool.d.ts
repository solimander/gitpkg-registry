import { VaultAddress } from "../vaults/types";
declare const fetchPool: ({ network, vaultAddress, }: {
    network: number;
    vaultAddress: VaultAddress;
}) => Promise<import("./types").LiquidityPool>;
export default fetchPool;
