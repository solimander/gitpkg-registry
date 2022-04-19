import { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import * as erc721Abi from '@nftx/constants/abis/ERC721.json';
import * as punkAbi from '@nftx/constants/abis/CryptoPunks.json';
import * as erc20Abi from '@nftx/constants/abis/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { isCryptoPunk } from '../assets';
import { getContract } from '../web3';
import { Address } from '../web3/types';

/** Approves a spender to spend a specific token address */
async function approve({
  network,
  tokenAddress,
  spenderAddress,
  tokenId,
  tokenIds,
  provider,
  amount,
  standard = tokenId || tokenIds ? 'ERC721' : amount ? 'ERC20' : null,
}: {
  network: number;
  /** The token we want to spend */
  tokenAddress: Address;
  /** The smart contract address that will be spending the token */
  spenderAddress: Address;
  provider: JsonRpcProvider;
  tokenId?: string;
  /** For ERC721/ERC1155, provide the token id or tokenIds */
  tokenIds?: string[];
  /** For ERC20, provide the amount the spender can spend - if omitted it defaults to the max amount */
  amount?: BigNumber;
  /** If the standard is omitted, we will infer either ERC721 or ERC20 based on amount/tokenId/tokenIds parameters */
  standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}): Promise<ContractTransaction> {
  if (standard === 'ERC721' || standard === 'ERC1155') {
    if (isCryptoPunk(tokenAddress)) {
      if (!tokenId && !tokenIds?.[0]) {
        throw new Error('To approve a punk you must provide the tokenID');
      }
      const contract = getContract({
        network,
        address: tokenAddress,
        type: 'write',
        provider,
        abi: punkAbi,
      });
      return contract.offerPunkForSaleToAddress(
        tokenIds?.[0] ?? tokenId,
        0,
        spenderAddress
      );
    }
    const contract = getContract({
      network,
      address: tokenAddress,
      type: 'write',
      provider,
      abi: erc721Abi,
    });
    return contract.setApprovalForAll(spenderAddress, true);
  }
  if (standard === 'ERC20') {
    const contract = getContract({
      network,
      address: tokenAddress,
      provider,
      type: 'write',
      abi: erc20Abi,
    });
    return contract.approve(spenderAddress, amount ?? MaxUint256);
  }

  throw new Error(`approve not supported for ${standard}`);
}

export default approve;
