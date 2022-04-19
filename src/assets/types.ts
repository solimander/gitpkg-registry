import { BigNumber } from "@ethersproject/bignumber";
import type { Address } from "../web3/types";

export type Asset = {
  id: string;
  tokenId: string;
  assetAddress: Address;
  metaUrl: string;
  quantity?: BigNumber;
};

export type AssetMetadata = {
  name: string;
  traits: Record<string, string | string[]>;
  api: "covalent" | "opensea";
  tokenId: string;
  assetName: string;
  openseaSlug: string;
  openseaBlocked: boolean;
  imageUrl: string;
  imagePreviewUrl: string;
  detailUrl: string;
  animationUrl: string;
  backgroundColor: string;
};
