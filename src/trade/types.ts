import type { BigNumber } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import type { Address } from '../web3/types';

/** Approves a spender to spend a specific token address */
type Approve = (args: {
  /** The token we want to spend */
  tokenAddress: Address;
  /** The smart contract address that will be spending the token */
  spenderAddress: Address;
  /** For ERC721/ERC1155, provide the token id or tokenIds */
  tokenId?: string;
  tokenIds?: string[];
  /** For ERC20, provide the amount the spender can spend - if omitted it defaults to the max amount */
  amount?: BigNumber;
  provider: JsonRpcProvider;
  /** If the standard is omitted, we will infer either ERC721 or ERC20 based on amount/tokenId/tokenIds parameters */
  standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}) => Promise<ContractTransaction>;

type IsApproved = (args: {
  network: number;
  provider: JsonRpcProvider;
  tokenAddress: Address;
  spenderAddress: Address;
  tokenId?: string;
  tokenIds?: string[];
  amount?: BigNumber;
  standard?: 'ERC721' | 'ERC1155' | 'ERC20';
}) => Promise<boolean>;
