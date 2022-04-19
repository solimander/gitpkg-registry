import { Address } from '../../web3/types';
import { Asset } from '../types';
declare const erc721: ({ network, userAddress, assetAddresses, lastId, retryCount, }: {
    network: number;
    userAddress: Address;
    assetAddresses: Address[];
    lastId?: number;
    retryCount?: number;
}) => Promise<Asset[]>;
export default erc721;
