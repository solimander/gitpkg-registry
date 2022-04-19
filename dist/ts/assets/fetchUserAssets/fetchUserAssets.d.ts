import { Address } from '../../web3/types';
declare const fetchUserAssets: ({ assetAddresses, network, userAddress, }: {
    network: number;
    userAddress: Address;
    assetAddresses: Array<Address | {
        address: Address;
        is1155?: boolean;
    }>;
}) => Promise<import("..").Asset[]>;
export default fetchUserAssets;
