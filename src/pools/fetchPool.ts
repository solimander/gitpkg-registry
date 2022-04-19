import { VaultAddress } from "../vaults/types";
import fetchPools from "./fetchPools";

const fetchPool = async ({
  network,
  vaultAddress,
}: {
  network: number;
  vaultAddress: VaultAddress;
}) => {
  const pools = await fetchPools({ network, vaultAddress });

  return pools?.[0];
};

export default fetchPool;
