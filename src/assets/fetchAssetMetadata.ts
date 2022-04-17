import { Address } from "../web3/types";
import { Asset, AssetMetadata } from "./types";

export type Response = {
  animation_url: null | string;
  api_response: "covalent" | "opensea";
  asset_contract: {
    address: Address;
    name: string;
  };
  background_color?: null | string;
  collection: {
    slug: string;
    description?: null | string;
  };
  id: number;
  image_preview_url: string;
  image_url: string;
  name: string | null;
  objectID: string;
  permalink: string;
  supports_wyvern?: boolean;
  token_id: string;
  traits: { [key: string]: string | [] };
};

const fetchAssetMetadata = async ({ metaUrl }: Pick<Asset, "metaUrl">) => {
  const response = await fetch(metaUrl);
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  const data: Response = await response.json();
  if (!data?.id) {
    throw new Error(JSON.stringify(data));
  }

  const meta: AssetMetadata = {
    name: data.name,
    api: data.api_response,
    traits: data.traits,
    tokenId: data.token_id,
    assetName: data.asset_contract.name,
    openseaSlug: data.collection?.slug,
    imageUrl: data.image_url,
    imagePreviewUrl: data.image_preview_url,
    openseaBlocked: data.supports_wyvern === false,
    animationUrl: data.animation_url?.includes(".mp4")
      ? data.animation_url
      : null,
    backgroundColor: data.background_color ? `#${data.background_color}` : null,
    detailUrl:
      data.api_response === "covalent"
        ? `https://looksrare.org/collections/${data.asset_contract.address.toLowerCase()}/${
            data.token_id
          }`
        : `https://opensea.io/assets/${data.asset_contract.address}/${data.token_id}`,
  };

  return meta;
};

export default fetchAssetMetadata;
