import { Address } from '../../web3/types';
import { Asset } from '../types';
declare const erc1155: ({ network, userAddress, assetAddress, lastId, retryCount, }: {
    network: number;
    userAddress: Address;
    assetAddress: Address;
    lastId?: number;
    retryCount?: number;
}) => Promise<Asset[]>;
export default erc1155;
