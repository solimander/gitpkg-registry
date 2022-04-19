import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import erc721Abi from '@nftx/constants/abis/ERC721.json';
import erc20Abi from '@nftx/constants/abis/ERC20.json';
import punkAbi from '@nftx/constants/abis/CryptoPunks.json';
import { isCryptoPunk } from '../assets';
import { addressEqual, getContract } from '../web3';
import { Address } from '../web3/types';
import { MaxUint256 } from '@ethersproject/constants';

const isApproved = async ({
  network,
  provider,
  spenderAddress,
  tokenAddress,
  userAddress,
  amount,
  standard,
  tokenId,
  tokenIds,
}: {
  network: number;
  provider: JsonRpcProvider;
  tokenAddress: Address;
  spenderAddress: Address;
  userAddress: Address;
  tokenId?: string;
  tokenIds?: string[];
  amount?: BigNumber;
  standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}): Promise<boolean> => {
  if (standard === 'ERC721' || standard === 'ERC1155') {
    if (isCryptoPunk(tokenAddress)) {
      const contract = getContract({
        network,
        provider,
        address: tokenAddress,
        abi: punkAbi,
      });

      const results = await Promise.all(
        (tokenIds ?? [tokenId]).map(async (tokenId) => {
          try {
            const punk: {
              isForSale: boolean;
              punkIndex: BigNumber;
              seller: string;
              minValue: BigNumber;
              onlySellTo: string;
            } = await contract.punksOfferedForSale(tokenId);

            return [
              punk.isForSale,
              addressEqual(punk.seller, userAddress),
              punk.minValue.isZero(),
              addressEqual(punk.onlySellTo, spenderAddress),
            ].every(Boolean);
          } catch {
            return false;
          }
        })
      );

      return results.every(Boolean);
    }
    const contract = getContract({
      network,
      abi: erc721Abi,
      provider,
      address: tokenAddress,
    });
    return contract.isApprovedForAll(userAddress, spenderAddress);
  }
  if (standard === 'ERC20') {
    try {
      const contract = getContract({
        network,
        provider,
        abi: erc20Abi,
        address: tokenAddress,
      });
      const allowance: BigNumber = await contract.allowance(
        userAddress,
        spenderAddress
      );
      return allowance.gt(0) && allowance.gte(amount ?? MaxUint256);
    } catch {
      return false;
    }
  }

  return false;
};

export default isApproved;
