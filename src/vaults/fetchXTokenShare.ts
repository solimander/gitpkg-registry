import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import * as abi from '@nftx/constants/abis/NFTXInventoryStaking.json';
import { NFTX_INVENTORY_STAKING } from '@nftx/constants';
import { getChainConstant } from '../utils';
import { VaultId } from './types';
import getContract from '../web3/getContract';

const fetchXTokenShare = async ({
  network,
  provider,
  vaultId,
}: {
  network: number;
  provider: JsonRpcProvider;
  vaultId: VaultId;
}) => {
  const address = getChainConstant(NFTX_INVENTORY_STAKING, network);
  const contract = getContract({
    network,
    provider,
    abi,
    address,
  });
  const share: BigNumber = await contract.xTokenShareValue(vaultId);

  return share;
};

export default fetchXTokenShare;
