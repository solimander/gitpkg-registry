import { Address } from "../web3/types";
import { Asset, AssetMetadata } from "./types";
export declare type Response = {
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
    traits: {
        [key: string]: string | [];
    };
};
declare const fetchAssetMetadata: ({ metaUrl }: Pick<Asset, "metaUrl">) => Promise<AssetMetadata>;
export default fetchAssetMetadata;
