import { Address } from '../../web3/types';
import { isNonstandard721 } from '../utils';
import erc1155 from './erc1155';
import erc721 from './erc721';
import nonstandard from './nonstandard';

function* chunks(arr: any[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const collectAddresses = (
  assetAddresses: Array<Address | { address: Address; is1155?: boolean }>
): [Address[][], Address[], Address[]] => {
  const standard721addresses: Address[] = [];
  const nonStandardAddresses: Address[] = [];
  const standard1155Addresses: Address[] = [];

  assetAddresses.forEach((item) => {
    const address = typeof item === 'string' ? item : item?.address;
    const is1155 = !!(typeof item === 'object' && item?.is1155);

    if (isNonstandard721(address)) {
      nonStandardAddresses.push(address);
    } else if (is1155) {
      standard1155Addresses.push(address);
    } else {
      standard721addresses.push(address);
    }
  });

  return [
    [...chunks([...new Set(standard721addresses)], 20)],
    [...new Set(standard1155Addresses)],
    [...new Set(nonStandardAddresses)],
  ];
};

const fetchUserAssets = async ({
  assetAddresses,
  network,
  userAddress,
}: {
  network: number;
  userAddress: Address;
  assetAddresses: Array<Address | { address: Address; is1155?: boolean }>;
}) => {
  const [standard721addresses, standard1155Addresses, nonStandardAddresses] =
    collectAddresses(assetAddresses);

  const allAssets = await Promise.all([
    Promise.all(
      standard721addresses.map(async (assetAddresses) => {
        try {
          const assets = await erc721({
            assetAddresses,
            network,
            userAddress,
          });
          return assets;
        } catch {
          return null;
        }
      })
    ).then((assets) => assets.flat().filter(Boolean)),
    Promise.all(
      standard1155Addresses.map(async (assetAddress) => {
        try {
          const assets = await erc1155({
            assetAddress,
            network,
            userAddress,
          });
          return assets;
        } catch {
          return null;
        }
      })
    ).then((assets) => assets.flat().filter(Boolean)),
    nonstandard({ assetAddresses: nonStandardAddresses, network, userAddress }),
  ]);

  return allAssets.flat();
};

export default fetchUserAssets;
