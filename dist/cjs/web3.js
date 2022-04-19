'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var erc721Abi = require('@nftx/constants/abis/ERC721.json');
var punkAbi = require('@nftx/constants/abis/CryptoPunks.json');
var abi = require('@nftx/constants/abis/ERC20.json');
var constants$1 = require('@ethersproject/constants');
var constants = require('@nftx/constants');
var contracts = require('@ethersproject/contracts');
var bignumber = require('@ethersproject/bignumber');
var units = require('@ethersproject/units');
var abi$2 = require('@nftx/constants/abis/NFTXMarketplaceZap.json');
var routerAbi = require('@nftx/constants/abis/UniswapV2Router.json');
var abi$3 = require('@nftx/constants/abis/UniswapQuoter.json');
var abi$5 = require('@nftx/constants/abis/NFTXVaultUpgradeable.json');
var abi$4 = require('@nftx/constants/abis/NFTXInventoryStaking.json');
var abi$1 = require('@ethersproject/abi');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var erc721Abi__default = /*#__PURE__*/_interopDefaultLegacy(erc721Abi);
var punkAbi__default = /*#__PURE__*/_interopDefaultLegacy(punkAbi);
var abi__default = /*#__PURE__*/_interopDefaultLegacy(abi);
var abi__default$1 = /*#__PURE__*/_interopDefaultLegacy(abi$2);
var routerAbi__default = /*#__PURE__*/_interopDefaultLegacy(routerAbi);
var abi__default$2 = /*#__PURE__*/_interopDefaultLegacy(abi$3);
var abi__default$4 = /*#__PURE__*/_interopDefaultLegacy(abi$5);
var abi__default$3 = /*#__PURE__*/_interopDefaultLegacy(abi$4);

const fetchAssetMetadata = async _ref => {
  var _data$collection, _data$animation_url;

  let {
    metaUrl
  } = _ref;
  const response = await fetch(metaUrl);

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!(data != null && data.id)) {
    throw new Error(JSON.stringify(data));
  }

  const meta = {
    name: data.name,
    api: data.api_response,
    traits: data.traits,
    tokenId: data.token_id,
    assetName: data.asset_contract.name,
    openseaSlug: (_data$collection = data.collection) == null ? void 0 : _data$collection.slug,
    imageUrl: data.image_url,
    imagePreviewUrl: data.image_preview_url,
    openseaBlocked: data.supports_wyvern === false,
    animationUrl: (_data$animation_url = data.animation_url) != null && _data$animation_url.includes(".mp4") ? data.animation_url : null,
    backgroundColor: data.background_color ? `#${data.background_color}` : null,
    detailUrl: data.api_response === "covalent" ? `https://looksrare.org/collections/${data.asset_contract.address.toLowerCase()}/${data.token_id}` : `https://opensea.io/assets/${data.asset_contract.address}/${data.token_id}`
  };
  return meta;
};

var fetchAssetMetadata$1 = fetchAssetMetadata;

// TODO: there's quite a lot of other logic in useDapp's addressEqual function
const addressEqual = (a, b) => {
  if (!a || !b) {
    return false;
  }

  return a.toLowerCase() === b.toLowerCase();
};

var addressEqual$1 = addressEqual;

const getChainConstant = function (obj, network, fallback) {
  if (fallback === void 0) {
    fallback = obj[constants.Network.Mainnet];
  }

  return obj[network] ?? fallback;
};
const reduceObj = (obj, fn) => {
  return Object.fromEntries(Object.entries(obj).reduce((acc, _ref) => {
    let [key, value] = _ref;
    return fn(acc, key, value);
  }, []));
};
const mapObj = (obj, fn) => {
  return reduceObj(obj, (acc, key, value) => [...acc, fn(key, value)]);
};
const filterObj = (obj, fn) => {
  return reduceObj(obj, (acc, key, value) => {
    if (fn(key, value)) {
      return [...acc, [key, value]];
    }

    return acc;
  });
};
const omitNil = obj => {
  return filterObj(obj, (_key, value) => value != null);
};

const ABI = ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'];
const queue = {};
let queued = false;

function warnOnInvalidContractCall(_ref) {
  let {
    contract: {
      address
    },
    args,
    method
  } = _ref;
  console.warn(`Invalid contract call: address=${address} method=${method} args=${args}`);
}
/** Directly run a contract method on the contract itself (bypassing multicall)
 * equivalent to contract.foo(arg1, arg2)
 */


const singlecall = _ref2 => {
  let {
    res,
    rej,
    args,
    method,
    contract
  } = _ref2;
  return contract[method](...args).then(res, rej);
};
/** Encode a request
 * Takes the method/args and creates a hex of the data
 * returns a tuple of [address, data]
 */


const encode = _ref3 => {
  let {
    args,
    method,
    contract: {
      interface: abi,
      address
    }
  } = _ref3;

  if (!address || !method) {
    warnOnInvalidContractCall({
      method,
      args,
      contract: {
        address
      }
    });
    return undefined;
  }

  try {
    const encoded = abi.encodeFunctionData(method, args);
    return [address, encoded];
  } catch (e) {
    warnOnInvalidContractCall({
      method,
      args,
      contract: {
        address
      }
    });
    return undefined;
  }
};
/** decodes a hex string and returns the response data */


const decode = (_ref4, data) => {
  let {
    contract: {
      interface: abi
    },
    method
  } = _ref4;
  const decoded = abi.decodeFunctionResult(method, data); // deep breath
  // so when you encode/decode contract calls, you'll always get a tuple back
  // but if you were to do the contract call natively with ethers.js
  // you would only get a tuple back if the result was actually a tuple
  // if a contract method only returns a single value, it would just return that directly
  // ideally we want to keep functionally as close to ethers.js's Contract class
  // so we attempt to tell if the result is actually a tuple of a single value
  // an if it's a single value, unwrap the tuple

  const arr = [...decoded];

  if (arr.length === 1) {
    return arr[0];
  }

  return decoded;
};

const multicall = () => {
  // if we have calls spread across multiple chains, we need to process them all separately
  Object.keys(queue).forEach(async network => {
    // grab the waiting calls and empty the queue list
    const requests = (queue[network] ?? []).splice(0);

    if (!requests.length) {
      return;
    }

    if (requests.length === 1) {
      // if we only have one call, it'd be an unecessary extra trip to go through the multicall contract
      return singlecall(requests[0]);
    }

    const multicallAddress = getChainConstant(constants.MULTICALL, Number(network), null);

    if (multicallAddress == null) {
      // Not a supported multicall network
      return Promise.all(requests.map(request => singlecall(request)));
    } // we need a provider, so just use the first request's instance
    // I can't think of a scenario where different calls would be using different providers
    // unless you used a signer for one request - but MulticallContract should really only be
    // used for reads...


    const provider = requests[0].contract.provider; // we use the block number to tag the request, wonder if there's a more efficient way to do this
    // as right now this will cause an additional contract call

    const blockNumber = await provider.getBlockNumber();
    const contract = new contracts.Contract(multicallAddress, ABI, provider);
    let results;

    try {
      [, results] = await contract.aggregate(requests.map(encode), {
        blockTag: blockNumber
      });
    } catch {
      // if the entire multicall fails just fall back to single call
      requests.forEach(singlecall);
      return;
    } // the requests and results should have a 1:1 match up


    requests.forEach((request, i) => {
      const {
        res,
        rej
      } = request;
      const data = results[i];

      if (data == '0x') {
        warnOnInvalidContractCall(request);
        rej(null);
        return;
      }

      try {
        res(decode(request, data));
      } catch (e) {
        warnOnInvalidContractCall(request);
        rej(e);
      }
    });
  });
};
/** starts the timeout for the multicall fn
 * if there is already a timeout, it does nothing
 */


const triggerMulticall = () => {
  if (queued) {
    return;
  }

  queued = true;
  setTimeout(() => {
    queued = false;
    multicall();
  }, 100);
};
/** creates a request and queues it up
 * returns a promise that resolves once the request has been resolved by multicall
 */


const addToQueue = (network, contract, method, args) => {
  return new Promise((res, rej) => {
    queue[network] = queue[network] ?? [];
    queue[network].push({
      contract,
      args,
      method,
      res,
      rej
    });
    triggerMulticall();
  });
};

const wrapContract = (network, contract) => {
  // instead of returning the actual contract, we actually create a proxy against
  // an empty object and then defer all getters to the contract
  // if you call a contract method, we intercept it and queue it up for multicall
  const proxy = new Proxy({}, {
    get(target, prop) {
      if (typeof contract[prop] !== 'function') {
        return contract[prop];
      }

      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return addToQueue(network, contract, prop, args);
      };
    }

  });
  return proxy;
};

class MulticallContract extends contracts.Contract {
  constructor(network, addressOrName, contractInterface, signerOrProvider) {
    super(addressOrName, contractInterface, signerOrProvider);
    const wrappedContract = wrapContract(network, this);
    return wrappedContract;
  }

}

var MulticallContract$1 = MulticallContract;

/** Returns an ethers.js contract
 * For "read" if multicall is supported and enabled it will return a multicall contract
 */
const getContract = _ref => {
  let {
    network,
    provider,
    address,
    abi,
    type = 'read',
    multicall = true
  } = _ref;

  if (type === 'write' || !multicall) {
    return new contracts.Contract(address, abi, provider.getSigner());
  }

  return new MulticallContract$1(network, address, abi, provider);
};

var getContract$1 = getContract;

/** Return the user's balance of a given token */

const fetchTokenBalance = async _ref => {
  let {
    network,
    ownerAddress,
    provider,
    tokenAddress
  } = _ref;
  const contract = getContract$1({
    network,
    address: tokenAddress,
    abi: abi__default["default"],
    provider
  });
  const result = await contract.balanceOf(ownerAddress);
  return result;
};

var fetchTokenBalance$1 = fetchTokenBalance;

/** Return the total supply of a given token */

const fetchTotalSupply = async _ref => {
  let {
    network,
    provider,
    tokenAddress
  } = _ref;
  const contract = getContract$1({
    network,
    address: tokenAddress,
    provider,
    abi: abi__default["default"]
  });
  const supply = await contract.totalSupply();
  return supply;
};

var fetchTotalSupply$1 = fetchTotalSupply;

const parseLogEvent = _ref => {
  let {
    interface: iface,
    logs,
    signature,
    filter
  } = _ref;

  try {
    const parser = new abi$1.Interface([iface]);
    const event = logs == null ? void 0 : logs.slice() // we want the find the _last_ log that matches
    .reverse().find(log => {
      if (!log.topics[0].startsWith(signature)) {
        return false;
      }

      if (filter != null && !filter(log)) {
        return false;
      }

      return true;
    });

    if (!event) {
      return null;
    }

    return parser.parseLog(event).args;
  } catch (e) {
    console.error(e);
    return null;
  }
};

var parseLogEvent$1 = parseLogEvent;

const gql = function (s) {
  for (var _len = arguments.length, variables = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    variables[_key - 1] = arguments[_key];
  }

  return s.map((s, i) => {
    if (i === 0) {
      return s;
    }

    return JSON.stringify(variables[i - 1]) + s;
  }).join('').replace(/\n +/g, ' ');
};
const buildWhere = obj => {
  return omitNil(obj);
};
const querySubgraph = async _ref => {
  let {
    url,
    query
  } = _ref;

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query
      }).replace(/\\"/g, '') // Strip escaped double quotes

    });

    if (response.ok) {
      const {
        data
      } = await response.json();
      return data;
    } else {
      throw new Error(`Failed to fetch ${url} with query ${query}`);
    }
  } catch (err) {
    throw new Error(err);
  }
};

const isCryptoPunk = address => {
  return addressEqual$1(address, constants.CRYPTOPUNKS);
};
const isCryptoKitty = address => {
  return addressEqual$1(address, constants.CRYPTOKITTIES);
};
const isNonstandard721 = address => {
  return isCryptoPunk(address) || isCryptoKitty(address);
};

const LIMIT$3 = 1000;

const erc1155$2 = async _ref => {
  var _data, _data$account, _data$account$balance;

  let {
    network,
    userAddress,
    assetAddress,
    lastId = 0,
    retryCount = 0
  } = _ref;
  const query = gql`{
    account(id: ${userAddress.toLowerCase()}) {
      id
      balances: ERC1155balances(
        first: ${LIMIT$3},
        where: {
          value_gt: ${lastId},
          token_contains: ${assetAddress}
        },
        orderBy: value,
        orderDirection: asc
      ) {
        id
        token {
          identifier
        }
        value
      }
    }
  }`;
  let data;

  try {
    data = await querySubgraph({
      url: getChainConstant(constants.ERC1155_SUBGRAPH, network),
      query
    });
  } catch (e) {
    if (retryCount < 3) {
      return erc1155$2({
        assetAddress,
        network,
        userAddress,
        lastId,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }

  const assets = (_data = data) == null ? void 0 : (_data$account = _data.account) == null ? void 0 : (_data$account$balance = _data$account.balances) == null ? void 0 : _data$account$balance.map(_ref2 => {
    let {
      id,
      token: {
        identifier
      },
      value
    } = _ref2;
    const [assetAddress] = id.split(network === constants.Network.Mainnet ? '/' : '-');
    const tokenId = bignumber.BigNumber.from(identifier).toString();
    const quantity = Number(value) < 1 ? units.parseEther(value) : bignumber.BigNumber.from(value);
    const asset = {
      id,
      tokenId,
      assetAddress,
      quantity,
      metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`
    };
    return asset;
  });

  if ((assets == null ? void 0 : assets.length) === LIMIT$3) {
    const moreAssets = await erc1155$2({
      assetAddress,
      network,
      userAddress,
      retryCount: 0,
      lastId: Number(assets[assets.length].quantity)
    });
    return [...assets, ...moreAssets];
  }

  return assets;
};

var erc1155$3 = erc1155$2;

const LIMIT$2 = 1000;

const erc721$2 = async _ref => {
  var _assets;

  let {
    network,
    userAddress,
    assetAddresses,
    lastId = -1,
    retryCount = 0
  } = _ref;
  let assets = [];

  if (!assetAddresses.length) {
    return assets;
  }

  try {
    if (network === constants.Network.Mainnet) {
      var _data$account, _data$account$tokens;

      const query = gql`{
      account(id: ${userAddress.toLowerCase()}) {
        id
        tokens: ERC721tokens(
          first: ${LIMIT$2},
          where: {
            identifier_gt: ${lastId},
            contract_in: ${assetAddresses.map(x => x.toLowerCase())}
          },
          orderBy: identifier,
          orderDirection: asc
        ) {
          id
          identifier
        }
      }
    }`;
      const data = await querySubgraph({
        url: getChainConstant(constants.ERC721_SUBGRAPH, network),
        query
      });
      assets = data == null ? void 0 : (_data$account = data.account) == null ? void 0 : (_data$account$tokens = _data$account.tokens) == null ? void 0 : _data$account$tokens.map(_ref2 => {
        let {
          id,
          identifier
        } = _ref2;
        const [assetAddress] = id.split('/');
        const tokenId = identifier;
        const asset = {
          id,
          tokenId,
          assetAddress,
          metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`
        };
        return asset;
      });
    } else if (network === constants.Network.Rinkeby) {
      var _data$owner, _data$owner$tokens;

      const query = gql`{
      owner(id: ${userAddress.toLowerCase()}) {
        id
        tokens(
          first: ${LIMIT$2},
          where: {
            tokenID_gt: ${lastId},
            contract_in: ${assetAddresses.map(x => x.toLowerCase())}
          },
          orderBy: tokenID,
          orderDirection: asc
        ) {
          id
          tokenID
        }
      }
    }`;
      const data = await querySubgraph({
        url: getChainConstant(constants.ERC721_SUBGRAPH, network),
        query
      });
      assets = data == null ? void 0 : (_data$owner = data.owner) == null ? void 0 : (_data$owner$tokens = _data$owner.tokens) == null ? void 0 : _data$owner$tokens.map(_ref3 => {
        let {
          id,
          tokenID
        } = _ref3;
        const [assetAddress] = id.split('_');
        const tokenId = tokenID;
        const asset = {
          id,
          tokenId,
          assetAddress,
          metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`
        };
        return asset;
      });
    } else if (network === constants.Network.Arbitrum) {
      var _data$account2, _data$account2$tokens;

      const query = gql`{
      account(id: ${userAddress.toLowerCase()}) {
        id
        tokens: ERC721tokens(
          first: ${LIMIT$2},
          where: {
            identifier_gt: ${lastId},
            contract_in: ${assetAddresses.map(x => x.toLowerCase())}
          },
          orderBy: identifier,
          orderDirection: asc
        ) {
          id
          identifier
        }
      }
    }`;
      const data = await querySubgraph({
        url: getChainConstant(constants.ERC721_SUBGRAPH, network),
        query
      });
      assets = data == null ? void 0 : (_data$account2 = data.account) == null ? void 0 : (_data$account2$tokens = _data$account2.tokens) == null ? void 0 : _data$account2$tokens.map(_ref4 => {
        let {
          id,
          identifier
        } = _ref4;
        const [assetAddress] = id.split('/');
        const tokenId = identifier;
        const asset = {
          id,
          assetAddress,
          tokenId,
          metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`
        };
        return asset;
      });
    } else {
      throw new Error(`Unsupported network ${network}`);
    }
  } catch (e) {
    if (retryCount < 3) {
      return erc721$2({
        assetAddresses,
        network,
        userAddress,
        lastId,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }

  if (((_assets = assets) == null ? void 0 : _assets.length) === LIMIT$2) {
    const moreAssets = await erc721$2({
      assetAddresses,
      network,
      userAddress,
      lastId: Number(assets[assets.length - 1].tokenId),
      retryCount: 0
    });
    return [...assets, ...moreAssets];
  }

  return assets;
};

var erc721$3 = erc721$2;

const LIMIT$1 = 1000;

const transformNonStandardAssetResponse = network => response => {
  const [assetAddress] = response.id.split('-');
  const tokenId = bignumber.BigNumber.from(response.identifier).toString();
  const asset = {
    id: response.id,
    tokenId: tokenId,
    assetAddress: assetAddress,
    metaUrl: `https://api.nftx.xyz/asset/${assetAddress}/${tokenId}?chainId=${network}`
  };
  return asset;
};

const nonstandard = async _ref => {
  var _data, _data$account, _data$account$tokens;

  let {
    network,
    userAddress,
    assetAddresses,
    lastId = -1,
    retryCount = 0
  } = _ref;

  if (!assetAddresses.length) {
    return [];
  }

  const query = gql`{
    account(id: ${userAddress.toLowerCase()}) {
      id
      tokens(
        first: ${LIMIT$1},
        where: {
          identifier_gt: ${lastId},
          registry_in: ${assetAddresses.map(x => x.toLowerCase())}
        },
        orderBy: identifier,
        orderDirection: asc
      ) {
        id
        identifier
      }
    }
  }`;
  const url = getChainConstant(constants.NON_STANDARD_SUBGRAPH, network);
  let data;

  try {
    data = await querySubgraph({
      url,
      query
    });
  } catch (e) {
    if (retryCount < 3) {
      return nonstandard({
        network,
        assetAddresses,
        userAddress,
        lastId,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }

  const assets = ((_data = data) == null ? void 0 : (_data$account = _data.account) == null ? void 0 : (_data$account$tokens = _data$account.tokens) == null ? void 0 : _data$account$tokens.map(transformNonStandardAssetResponse(network))) ?? [];

  if ((assets == null ? void 0 : assets.length) === LIMIT$1) {
    const moreAssets = await nonstandard({
      network,
      assetAddresses,
      userAddress,
      retryCount: 0,
      lastId: Number(assets[assets.length - 1].tokenId)
    });
    return [...assets, ...moreAssets];
  }

  return assets;
};

var nonstandard$1 = nonstandard;

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const collectAddresses = assetAddresses => {
  const standard721addresses = [];
  const nonStandardAddresses = [];
  const standard1155Addresses = [];
  assetAddresses.forEach(item => {
    const address = typeof item === 'string' ? item : item == null ? void 0 : item.address;
    const is1155 = !!(typeof item === 'object' && item != null && item.is1155);

    if (isNonstandard721(address)) {
      nonStandardAddresses.push(address);
    } else if (is1155) {
      standard1155Addresses.push(address);
    } else {
      standard721addresses.push(address);
    }
  });
  return [[...chunks([...new Set(standard721addresses)], 20)], [...new Set(standard1155Addresses)], [...new Set(nonStandardAddresses)]];
};

const fetchUserAssets = async _ref => {
  let {
    assetAddresses,
    network,
    userAddress
  } = _ref;
  const [standard721addresses, standard1155Addresses, nonStandardAddresses] = collectAddresses(assetAddresses);
  const allAssets = await Promise.all([Promise.all(standard721addresses.map(async assetAddresses => {
    try {
      const assets = await erc721$3({
        assetAddresses,
        network,
        userAddress
      });
      return assets;
    } catch {
      return null;
    }
  })).then(assets => assets.flat().filter(Boolean)), Promise.all(standard1155Addresses.map(async assetAddress => {
    try {
      const assets = await erc1155$3({
        assetAddress,
        network,
        userAddress
      });
      return assets;
    } catch {
      return null;
    }
  })).then(assets => assets.flat().filter(Boolean)), nonstandard$1({
    assetAddresses: nonStandardAddresses,
    network,
    userAddress
  })]);
  return allAssets.flat();
};

var fetchUserAssets$1 = fetchUserAssets;

function getSafeStakingBlockHeight(network) {
  switch (network) {
    case constants.Network.Mainnet:
      return 13011203;

    case constants.Network.Rinkeby:
      return 9087000;

    default:
      return 0;
  }
}

const ARBITRUM_EXCEPTION_POOL_ID = '0xc5d592305a8ac4cce16485ab46b6b8bf593f5bce';

const fetchPools = async _ref => {
  var _data$pools;

  let {
    network,
    vaultAddress
  } = _ref;
  const deployBlock = getSafeStakingBlockHeight(network);
  const query = gql`{
    pools(
      first: 1000,
      where: ${buildWhere({
    vault: vaultAddress,
    deployBlock_gtw: deployBlock,
    id_not: ARBITRUM_EXCEPTION_POOL_ID
  })}
    ) {
      id
      vault {
        id
        vaultId
      }
      deployBlock
      stakingToken {
        id
        name
        symbol
      }
      dividendToken {
        id
        name
        symbol
      }
      rewardToken {
        id
        name
        symbol
      }
    }
  }`;
  const data = await querySubgraph({
    url: getChainConstant(constants.NFTX_SUBGRAPH, network),
    query
  });
  return data == null ? void 0 : (_data$pools = data.pools) == null ? void 0 : _data$pools.map(_ref2 => {
    let {
      id,
      deployBlock,
      dividendToken,
      rewardToken,
      stakingToken,
      vault: {
        id: vaultAddress,
        vaultId
      }
    } = _ref2;
    const pool = {
      id,
      deployBlock,
      dividendToken,
      rewardToken,
      stakingToken,
      vaultAddress,
      vaultId
    };
    return pool;
  });
};

var fetchPools$1 = fetchPools;

const fetchPool = async _ref => {
  let {
    network,
    vaultAddress
  } = _ref;
  const pools = await fetchPools$1({
    network,
    vaultAddress
  });
  return pools == null ? void 0 : pools[0];
};

var fetchPool$1 = fetchPool;

const LIMIT = 1000;

function formatTokenReserves(token, network) {
  var _token$basePairs, _token$quotePairs;

  const weth = getChainConstant(constants.WETH_TOKEN, network).toLowerCase(); // check to see if basePair is vtoken
  // PUNK-ETH

  if (token != null && (_token$basePairs = token.basePairs) != null && _token$basePairs.length) {
    const wethPair = token.basePairs.find(p => addressEqual$1(p.token1.id, weth));

    if (wethPair) {
      return {
        tokenId: token.id,
        derivedEth: bignumber.BigNumber.from(token.derivedETH || 0),
        reserveVtoken: bignumber.BigNumber.from(wethPair.reserve0 || 0),
        reserveWeth: bignumber.BigNumber.from(wethPair.reserve1 || 0)
      };
    }
  } // check to see if it's the quote pair
  // ETH-PUNK


  if (token != null && (_token$quotePairs = token.quotePairs) != null && _token$quotePairs.length) {
    const wethPair = token.quotePairs.find(p => addressEqual$1(p.token0.id, weth));

    if (wethPair) {
      return {
        tokenId: token.id,
        derivedEth: bignumber.BigNumber.from(token.derivedETH || 0),
        reserveVtoken: bignumber.BigNumber.from(wethPair.reserve1 || 0),
        reserveWeth: bignumber.BigNumber.from(wethPair.reserve0 || 0)
      };
    }
  }

  return {
    tokenId: token == null ? void 0 : token.id,
    derivedEth: token != null && token.derivedETH ? bignumber.BigNumber.from(token.derivedETH) : null,
    reserveVtoken: null,
    reserveWeth: null
  };
}

const fetchReservesForTokens = async _ref => {
  var _response$tokens;

  let {
    network,
    tokenAddresses
  } = _ref;
  const query = gql`{
    tokens(
      first: ${LIMIT},
      where: {
        id_in: ${tokenAddresses.map(x => x.toLowerCase())}
      }
    ) {
      id
      derivedETH
      quotePairs {
        id
        token0 {
          id
        }
        reserve0
        token1 {
          id
        }
        reserve1
      }
      basePairs {
        id
        token0 {
          id
        }
        reserve0
        token1 {
          id
        }
        reserve1
      }
    }
  }`;
  const response = await querySubgraph({
    url: getChainConstant(constants.SUSHI_SUBGRAPH, network),
    query
  });
  return response == null ? void 0 : (_response$tokens = response.tokens) == null ? void 0 : _response$tokens.map(token => formatTokenReserves(token, network));
};

var fetchReservesForTokens$1 = fetchReservesForTokens;

const fetchReservesForToken = async _ref => {
  let {
    network,
    tokenAddress
  } = _ref;
  const results = await fetchReservesForTokens$1({
    network,
    tokenAddresses: [tokenAddress]
  });
  return results == null ? void 0 : results[0];
};

var fetchReservesForToken$1 = fetchReservesForToken;

/** Approves a spender to spend a specific token address */
async function approve(_ref) {
  let {
    network,
    tokenAddress,
    spenderAddress,
    tokenId,
    tokenIds,
    provider,
    amount,
    standard = tokenId || tokenIds ? 'ERC721' : amount ? 'ERC20' : null
  } = _ref;

  if (standard === 'ERC721' || standard === 'ERC1155') {
    if (isCryptoPunk(tokenAddress)) {
      if (!tokenId && !(tokenIds != null && tokenIds[0])) {
        throw new Error('To approve a punk you must provide the tokenID');
      }

      const contract = getContract$1({
        network,
        address: tokenAddress,
        type: 'write',
        provider,
        abi: punkAbi__default["default"]
      });
      return contract.offerPunkForSaleToAddress((tokenIds == null ? void 0 : tokenIds[0]) ?? tokenId, 0, spenderAddress);
    }

    const contract = getContract$1({
      network,
      address: tokenAddress,
      type: 'write',
      provider,
      abi: erc721Abi__default["default"]
    });
    return contract.setApprovalForAll(spenderAddress, true);
  }

  if (standard === 'ERC20') {
    const contract = getContract$1({
      network,
      address: tokenAddress,
      provider,
      type: 'write',
      abi: abi__default["default"]
    });
    return contract.approve(spenderAddress, amount ?? constants$1.MaxUint256);
  }

  throw new Error(`approve not supported for ${standard}`);
}

/** Extracts the ids give an array of target ids
 * if an id has multiple quantities, the id is included multiple times in the output
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '2', '3']
 */
const getExactTokenIds = tokenIds => {
  return tokenIds.map(item => {
    if (Array.isArray(item)) {
      const [id, quantity] = item;
      return Array(quantity ?? 1).fill(id);
    }

    return item;
  }).flat();
};
/** Returns an array of target ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '3']
 */

const getUniqueTokenIds = tokenIds => {
  return tokenIds.map(item => {
    if (Array.isArray(item)) {
      return item[0];
    }

    return item;
  }).filter(x => x != null);
};
/** Returns an array of amounts ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> [1, 1, 1]
 * [['1', 1], ['2', 2], ['3', 1]] -> [1, 2, 1]
 */

const getTokenIdAmounts = tokenIds => {
  return tokenIds.map(item => {
    if (Array.isArray(item)) {
      return item[1] ?? 1;
    }

    return 1;
  });
};
/** Returns the total amount of ids
 * ['1', '2', '3'] -> 3
 * [['1', 1], ['2', 2], ['3', 1]] -> 4
 */

const getTotalTokenIds = tokenIds => {
  return getExactTokenIds(tokenIds).length;
};

const get1559GasFees = async _ref => {
  let {
    provider
  } = _ref;

  try {
    const feeData = await provider.getFeeData();
    const {
      maxFeePerGas,
      maxPriorityFeePerGas
    } = feeData;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  } catch {
    return {
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    };
  }
};

const estimateGasAndFees = async _ref2 => {
  let {
    contract,
    method,
    args,
    overrides
  } = _ref2;
  let maxFeePerGas = null;
  let maxPriorityFeePerGas = null;
  let gasEstimate = null;

  try {
    const fees = await get1559GasFees({
      provider: contract.provider
    });
    maxFeePerGas = fees.maxFeePerGas;
    maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
    gasEstimate = await contract.estimateGas[method](...args, { ...overrides,
      maxFeePerGas,
      maxPriorityFeePerGas
    });
  } catch {
    // EIP-1559 not supported/failed
    try {
      maxFeePerGas = null;
      maxPriorityFeePerGas = null;
      gasEstimate = await contract.estimateGas[method](...args, overrides);
    } catch {// Failed to estimate gas
    }
  }

  return {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  };
};

var estimateGasAndFees$1 = estimateGasAndFees;

/**
 * Takes a contract gas estimate and increases it by given %
 * @param call ethers estimateGas method on a contract function
 * @param amount amount to increase by (as a percentage, e.g. 5)
 * @returns
 */
const increaseGasLimit = _ref => {
  let {
    estimate,
    amount = 1
  } = _ref;

  try {
    if (estimate == null) {
      return null;
    }

    return estimate.mul(Number((amount * 10 + 1000).toFixed(1))).div(1000);
  } catch {
    return null;
  }
};
var increaseGasLimit$1 = increaseGasLimit;

const erc721$1 = async _ref => {
  let {
    network,
    provider,
    userAddress,
    vaultAddress,
    vaultId,
    maxPrice,
    randomBuys,
    tokenIds
  } = _ref;
  const ids = getExactTokenIds(tokenIds);
  const amount = getTotalTokenIds(tokenIds) + randomBuys;
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$1["default"],
    address: getChainConstant(constants.NFTX_MARKETPLACE_ZAP, network),
    type: 'write'
  });
  const path = [getChainConstant(constants.WETH_TOKEN, network), vaultAddress];
  const {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await estimateGasAndFees$1({
    contract,
    method: 'buyAndRedeem',
    args: [vaultId, amount, ids, path, userAddress],
    overrides: omitNil({
      value: maxPrice == null ? void 0 : maxPrice.toString()
    })
  });
  const gasLimit = increaseGasLimit$1({
    estimate: gasEstimate,
    amount: 7
  });
  return contract.buyAndRedeem(vaultId, amount, ids, path, userAddress, omitNil({
    value: maxPrice == null ? void 0 : maxPrice.toString(),
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas
  }));
};

const erc1155$1 = erc721$1;
/** Buy one or more NFTs from a vault */

const buyFromVault = async _ref2 => {
  let {
    network,
    provider,
    userAddress,
    vaultAddress,
    vaultId,
    maxPrice,
    randomBuys = 0,
    tokenIds = [],
    standard = 'ERC721',
    quote = 'ETH'
  } = _ref2;

  if (quote === 'ETH') {
    if (standard === 'ERC721') {
      return erc721$1({
        maxPrice,
        network,
        provider,
        randomBuys,
        tokenIds,
        userAddress,
        vaultAddress,
        vaultId
      });
    }

    if (standard === 'ERC1155') {
      return erc1155$1({
        maxPrice,
        network,
        provider,
        randomBuys,
        tokenIds,
        userAddress,
        vaultAddress,
        vaultId
      });
    }
  }

  throw new Error(`buyFromVault is not supported for ${standard} / ${quote}`);
};

var buyFromVault$1 = buyFromVault;

/** Fetch a quote price from the 0x api */
const fetch0xPrice$2 = async _ref => {
  let {
    buyToken,
    sellToken,
    amount = constants$1.WeiPerEther,
    network
  } = _ref;
  const searchParams = new URLSearchParams();
  searchParams.append('buyToken', buyToken);
  searchParams.append('sellToken', sellToken);
  searchParams.append('buyAmount', bignumber.BigNumber.from(amount).toString());
  const query = searchParams.toString();
  const zeroUrl = getChainConstant(constants.ZEROX_URL, network, null);

  if (!zeroUrl) {
    throw new Error(`${network} is not a supported network for the 0x API`);
  }

  const url = `${zeroUrl}/swap/v1/price?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const data = await response.json();
  const quotePrice = units.parseEther(data.price);
  return quotePrice;
};

var fetch0xPrice$3 = fetch0xPrice$2;

const fetchBuyPriceFromApi = async _ref => {
  let {
    network,
    tokenAddress,
    quote,
    amount
  } = _ref;
  return fetch0xPrice$3({
    network,
    amount,
    sellToken: quote,
    buyToken: tokenAddress
  });
};

const fetchBuyPriceFromWeb3 = async _ref2 => {
  let {
    network,
    provider,
    tokenAddress,
    amount
  } = _ref2;
  const contract = getContract$1({
    network,
    address: getChainConstant(constants.SUSHISWAP_ROUTER, network),
    abi: routerAbi__default["default"],
    provider
  });
  const tokenIn = getChainConstant(constants.WETH_TOKEN, network);
  const tokenOut = tokenAddress;
  const [quotePrice] = (await contract.getAmountsIn(amount, [tokenIn, tokenOut])) || [];
  return quotePrice;
};

const fetchBuyPrice = async _ref3 => {
  let {
    network,
    provider,
    tokenAddress,
    quote = 'ETH',
    amount = constants$1.WeiPerEther
  } = _ref3;
  const apiSupported = !!getChainConstant(constants.ZEROX_URL, network, null);

  if (apiSupported) {
    try {
      return await fetchBuyPriceFromApi({
        network,
        tokenAddress,
        amount,
        quote
      });
    } catch (e) {
      console.error(e); // fall back to the web3 call route
    }
  }

  return fetchBuyPriceFromWeb3({
    network,
    tokenAddress,
    amount,
    provider,
    quote
  });
};

var fetchBuyPrice$1 = fetchBuyPrice;

/** Fetch a quote price from the 0x api */
const fetch0xPrice = async _ref => {
  let {
    buyToken,
    sellToken,
    amount = constants$1.WeiPerEther,
    network
  } = _ref;
  const searchParams = new URLSearchParams();
  searchParams.append('buyToken', buyToken);
  searchParams.append('sellToken', sellToken);
  searchParams.append('buyAmount', bignumber.BigNumber.from(amount).toString());
  const query = searchParams.toString();
  const zeroUrl = getChainConstant(constants.ZEROX_URL, network, null);

  if (!zeroUrl) {
    throw new Error(`${network} is not a supported network for the 0x API`);
  }

  const url = `${zeroUrl}/swap/v1/price?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const data = await response.json();
  const quotePrice = units.parseEther(data.price);
  return quotePrice;
};

var fetch0xPrice$1 = fetch0xPrice;

const fetchEthPriceFromApi = async _ref => {
  let {
    network
  } = _ref;
  return fetch0xPrice$1({
    network,
    buyToken: 'ETH',
    sellToken: 'USDC',
    amount: constants$1.WeiPerEther
  });
};

const fetchEthPriceFromWeb3 = async _ref2 => {
  let {
    network,
    provider
  } = _ref2;
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$2["default"],
    address: getChainConstant(constants.UNISWAP_QUOTER, network)
  });

  if (network === constants.Network.Rinkeby) {
    // $22500 eth on rinkeby
    return bignumber.BigNumber.from('2500000000');
  }

  const quote = await contract.quoteExactOutputSingle(getChainConstant(constants.USDC, network), getChainConstant(constants.WETH_TOKEN, network), '3000', // the fee (0.3%)
  constants$1.WeiPerEther, '0' // don't care about pool limits etc
  );
  return quote;
};

const fetchEthPrice = async _ref3 => {
  let {
    network,
    provider
  } = _ref3;
  const apiSupported = !!getChainConstant(constants.ZEROX_URL, network, null);

  if (apiSupported) {
    try {
      return await fetchEthPriceFromApi({
        network
      });
    } catch (e) {
      console.error(e); // fall back to uniswap
    }
  }

  return fetchEthPriceFromWeb3({
    network,
    provider
  });
};

var fetchEthPrice$1 = fetchEthPrice;

const fetchSellPriceFromApi$1 = async _ref => {
  let {
    network,
    tokenAddress,
    amount,
    quote
  } = _ref;
  return fetch0xPrice$3({
    network,
    amount,
    sellToken: tokenAddress,
    buyToken: quote
  });
};

const fetchSellPriceFromWeb3$1 = async _ref2 => {
  let {
    network,
    provider,
    tokenAddress,
    amount
  } = _ref2;
  const contract = getContract$1({
    network,
    address: getChainConstant(constants.SUSHISWAP_ROUTER, network),
    abi: routerAbi__default["default"],
    provider
  });
  const tokenIn = tokenAddress;
  const tokenOut = getChainConstant(constants.WETH_TOKEN, network);
  const [, quotePrice] = (await contract.getAmountsOut(amount, [tokenIn, tokenOut])) || [];
  return quotePrice;
};

const fetchSellPrice$2 = async _ref3 => {
  let {
    network,
    provider,
    tokenAddress,
    amount = constants$1.WeiPerEther,
    quote = 'ETH'
  } = _ref3;
  const apiSupported = !!getChainConstant(constants.ZEROX_URL, network, null);

  if (apiSupported) {
    try {
      return await fetchSellPriceFromApi$1({
        network,
        tokenAddress,
        amount,
        quote
      });
    } catch (e) {
      console.error(e); // fall back to the web3 call route
    }
  }

  return fetchSellPriceFromWeb3$1({
    network,
    tokenAddress,
    amount,
    provider,
    quote
  });
};

var fetchSellPrice$3 = fetchSellPrice$2;

const fetchVaultBuyPrice = async _ref => {
  let {
    vault,
    network,
    provider,

    /** The number of target buys we are doing */
    targetBuys,

    /** The number of random buys we are doing */
    randomBuys
  } = _ref;
  const targetPrice = vault.fees.targetRedeemFee;
  const randomPrice = vault.fees.randomRedeemFee;
  let amount = constants$1.Zero;
  /** Vault buys come with a per-vault fee
   * so to buy 1 punk nft you have to redeem 1.05 PUNK
   * and to complicate things further, random buys have different fees to target buys
   */

  if (targetBuys != null || randomBuys != null) {
    if (targetBuys) {
      const quantity = constants$1.WeiPerEther.mul(targetBuys);
      const fee = targetPrice.mul(targetBuys);
      amount = amount.add(quantity).add(fee);
    }

    if (randomBuys) {
      const quantity = constants$1.WeiPerEther.mul(randomBuys);
      const fee = randomPrice.mul(randomBuys);
      amount = amount.add(quantity).add(fee);
    }
    /** if we haven't specified target/random buys,
     * we assume we're either getting the price for 1 random or 1 target redeem
     */

  } else if (vault.features.enableRandomRedeem && !vault.features.enableTargetRedeem) {
    amount = amount.add(constants$1.WeiPerEther).add(randomPrice);
  } else {
    amount = amount.add(constants$1.WeiPerEther).add(targetPrice);
  }

  const hasLiquidity = vault.reserveVtoken.gt(amount); // You can't buy anything if there isn't enough liquidity in the pool

  if (!hasLiquidity) {
    return constants$1.Zero;
  }

  return fetchBuyPrice$1({
    network,
    provider,
    tokenAddress: vault.id,
    quote: 'ETH',
    amount
  });
};

var fetchVaultBuyPrice$1 = fetchVaultBuyPrice;

const fetchSellPriceFromApi = async _ref => {
  let {
    network,
    tokenAddress,
    amount,
    quote
  } = _ref;
  return fetch0xPrice$3({
    network,
    amount,
    sellToken: tokenAddress,
    buyToken: quote
  });
};

const fetchSellPriceFromWeb3 = async _ref2 => {
  let {
    network,
    provider,
    tokenAddress,
    amount
  } = _ref2;
  const contract = getContract$1({
    network,
    address: getChainConstant(constants.SUSHISWAP_ROUTER, network),
    abi: routerAbi__default["default"],
    provider
  });
  const tokenIn = tokenAddress;
  const tokenOut = getChainConstant(constants.WETH_TOKEN, network);
  const [, quotePrice] = (await contract.getAmountsOut(amount, [tokenIn, tokenOut])) || [];
  return quotePrice;
};

const fetchSellPrice = async _ref3 => {
  let {
    network,
    provider,
    tokenAddress,
    amount = constants$1.WeiPerEther,
    quote = 'ETH'
  } = _ref3;
  const apiSupported = !!getChainConstant(constants.ZEROX_URL, network, null);

  if (apiSupported) {
    try {
      return await fetchSellPriceFromApi({
        network,
        tokenAddress,
        amount,
        quote
      });
    } catch (e) {
      console.error(e); // fall back to the web3 call route
    }
  }

  return fetchSellPriceFromWeb3({
    network,
    tokenAddress,
    amount,
    provider,
    quote
  });
};

var fetchSellPrice$1 = fetchSellPrice;

const fetchVaultSellPrice = async _ref => {
  let {
    vault,
    network,
    provider,
    sells = 1
  } = _ref;

  /** When you sell an NFT there's a mint fee that's deducted from the final price
   * so if you sell one punk NFT, we mint 1 PUNK, give 0.5 PUNKs to the stakers
   * and trade 0.95 PUNKs for ETH
   */
  const fee = vault.fees.mintFee.mul(sells);
  const amount = constants$1.WeiPerEther.mul(sells).sub(fee);
  return fetchSellPrice$1({
    network,
    provider,
    tokenAddress: vault.id,
    quote: 'ETH',
    amount
  });
};

var fetchVaultSellPrice$1 = fetchVaultSellPrice;

const transformFeeReceipt = (receipt, vaultAddress, network) => {
  const unsafeFeeCalcTime = network === constants.Network.Mainnet ? 1642684642 : 0;
  const date = Number(receipt.date);
  let amount = bignumber.BigNumber.from(receipt.amount);

  if (date > unsafeFeeCalcTime) {
    amount = amount.mul(5);
  }

  return {
    vaultAddress,
    date,
    amount
  };
};

const createMintsQuery = where => {
  return gql`mints(
    first: 1000,
    where: ${where},
    orderBy: date,
    orderDirection: asc
  ) {
    id
    zapAction {
      ethAmount
      id
    }
    vault {
      id
      vaultId
      token {
        symbol
      }
      asset {
        id
      }
      inventoryStakingPool {
        id
      }
    }
    user {
      id
    }
    date
    nftIds
    amounts
    feeReceipt {
      amount
      date
    }
  }`;
};

const isStakeOrMint = (mint, network) => {
  var _mint$user, _mint$user2, _mint$vault$inventory;

  if (addressEqual$1((_mint$user = mint.user) == null ? void 0 : _mint$user.id, getChainConstant(constants.NFTX_STAKING_ZAP, network))) {
    // LP Stake
    return 'stake';
  }

  if (addressEqual$1((_mint$user2 = mint.user) == null ? void 0 : _mint$user2.id, (_mint$vault$inventory = mint.vault.inventoryStakingPool) == null ? void 0 : _mint$vault$inventory.id)) {
    // Inventory Stake
    return 'stake';
  }

  if (mint.zapAction) {
    return 'sell';
  }

  return 'mint';
};

const processMints = async (response, network, vaultAddresses) => {
  let mints = response.mints.flatMap(mint => {
    const receipt = transformFeeReceipt(mint.feeReceipt, mint.vault.id, network);
    const type = isStakeOrMint(mint, network);
    return mint.nftIds.map((nftId, i) => {
      var _mint$zapAction;

      return {
        vaultAddress: mint.vault.id,
        date: Number(mint.date),
        tokenId: nftId,
        txId: mint.id,
        amount: Number(mint.amounts[i]),
        ethAmount: bignumber.BigNumber.from((mint == null ? void 0 : (_mint$zapAction = mint.zapAction) == null ? void 0 : _mint$zapAction.ethAmount) ?? 0),
        feeAmount: receipt.amount.div(mint.nftIds.length),
        type
      };
    });
  });

  if (mints.length === 1000) {
    const lastMint = mints[mints.length - 1];
    const nextTimestamp = lastMint.date;
    const moreMints = await getMints({
      network,
      vaultAddresses,
      fromTimestamp: Number(nextTimestamp)
    });
    mints = [...mints, ...moreMints];
  }

  return mints;
};
const getMints = async _ref => {
  let {
    network,
    fromTimestamp,
    vaultAddresses
  } = _ref;
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses
  });
  const query = `{ ${createMintsQuery(where)} }`;
  const response = await querySubgraph({
    url: getChainConstant(constants.NFTX_SUBGRAPH, network),
    query
  });
  const mints = await processMints(response, network, vaultAddresses);
  return mints;
};

const createRedeemsQuery = where => {
  return gql`redeems(
    first: 1000,
    where: ${where},
    orderBy: date,
    orderDirection: asc
  ) {
    id
    zapAction {
      ethAmount
      id
    }
    vault {
      id
      vaultId
      token {
        symbol
      }
      asset {
        id
      }
    }
    user {
      id
    }
    date
    nftIds
    specificIds
    randomCount
    targetCount
    feeReceipt {
      amount
      date
    }
  }`;
};
const processRedeems = async (response, network, vaultAddresses) => {
  let redeems = response.redeems.flatMap(redeem => {
    const receipt = transformFeeReceipt(redeem.feeReceipt, redeem.vault.id, network);
    return redeem.nftIds.map(nftId => {
      var _redeem$specificIds, _redeem$zapAction;

      const target = (_redeem$specificIds = redeem.specificIds) == null ? void 0 : _redeem$specificIds.includes(nftId); // TOOD: figure out a way to get msg.sender so we know if it's gem etc.

      const isBuy = redeem.zapAction != null;
      return {
        tokenId: nftId,
        vaultAddress: redeem.vault.id,
        date: Number(redeem.date),
        txId: redeem.id,
        random: !target,
        type: isBuy ? 'buy' : 'redeem',
        amount: 1,
        ethAmount: redeem != null && (_redeem$zapAction = redeem.zapAction) != null && _redeem$zapAction.ethAmount ? bignumber.BigNumber.from(redeem.zapAction.ethAmount) : null,
        feeAmount: receipt.amount.div(redeem.nftIds.length)
      };
    });
  });

  if (redeems.length === 1000) {
    const lastRedeem = redeems[redeems.length - 1];
    const nextTimestamp = lastRedeem.date;
    const moreRedeems = await getRedeems({
      vaultAddresses,
      network,
      fromTimestamp: nextTimestamp
    });
    redeems = [...redeems, ...moreRedeems];
  }

  return redeems;
};
const getRedeems = async _ref => {
  let {
    network,
    fromTimestamp,
    vaultAddresses
  } = _ref;
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses
  });
  const query = `{ ${createRedeemsQuery(where)} }`;
  const response = await querySubgraph({
    url: getChainConstant(constants.NFTX_SUBGRAPH, network),
    query
  });
  const mints = await processRedeems(response, network, vaultAddresses);
  return mints;
};

const createSwapsQuery = where => {
  return gql`swaps(
    first: 1000,
    where: ${where},
    orderBy: date,
    orderDirection: asc
  ) {
    id
    zapAction {
      ethAmount
      id
    }
    vault {
      id
      vaultId
      token {
        symbol
      }
      asset {
        id
      }
      inventoryStakingPool {
        id
      }
    }
    date
    mintedIds
    redeemedIds
    specificIds
    randomCount
    targetCount
    feeReceipt {
      amount
      date
    }
  }`;
};
const processSwaps = async (response, network, vaultAddresses) => {
  let swaps = response.swaps.flatMap(swap => {
    const receipt = transformFeeReceipt(swap.feeReceipt, swap.vault.id, network);
    return swap.redeemedIds.map((nftId, i) => {
      var _swap$zapAction;

      return {
        vaultAddress: swap.vault.id,
        date: Number(swap.date),
        tokenId: nftId,
        swapTokenId: swap.mintedIds[i],
        txId: swap.id,
        amount: 1,
        ethAmount: bignumber.BigNumber.from((swap == null ? void 0 : (_swap$zapAction = swap.zapAction) == null ? void 0 : _swap$zapAction.ethAmount) ?? 0),
        feeAmount: receipt.amount.div(swap.redeemedIds.length),
        type: 'swap'
      };
    });
  });

  if (swaps.length === 1000) {
    const lastSwap = swaps[swaps.length - 1];
    const nextTimestamp = lastSwap.date;
    const moreSwaps = await getSwaps({
      network,
      vaultAddresses,
      fromTimestamp: Number(nextTimestamp)
    });
    swaps = [...swaps, ...moreSwaps];
  }

  return swaps;
};
const getSwaps = async _ref => {
  let {
    network,
    fromTimestamp,
    vaultAddresses
  } = _ref;
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses
  });
  const query = `{ ${createSwapsQuery(where)} }`;
  const response = await querySubgraph({
    url: getChainConstant(constants.NFTX_SUBGRAPH, network),
    query
  });
  const swaps = await processSwaps(response, network, vaultAddresses);
  return swaps;
};

const getAll = async _ref => {
  let {
    fromTimestamp,
    vaultAddresses,
    network
  } = _ref;
  const where = buildWhere({
    date_gt: fromTimestamp,
    vault: vaultAddresses.length === 1 ? vaultAddresses[0] : null,
    vault_in: vaultAddresses.length === 1 ? null : vaultAddresses
  });
  const query = `{
    ${createMintsQuery(where)}
    ${createRedeemsQuery(where)}
    ${createSwapsQuery(where)}
  }`;
  const response = await querySubgraph({
    url: getChainConstant(constants.NFTX_SUBGRAPH, network),
    query
  });
  const mints = await processMints(response, network, vaultAddresses);
  const redeems = await processRedeems(response, network, vaultAddresses);
  const swaps = await processSwaps(response, network, vaultAddresses);
  return {
    mints,
    swaps,
    redeems
  };
};

function fetchVaultActivity(_ref) {
  let {
    network,
    fromTimestamp,
    vaultAddress,
    vaultAddresses = [vaultAddress]
  } = _ref;
  return getAll({
    network,
    vaultAddresses,
    fromTimestamp
  });
}

const fetch$1 = async _ref => {
  let {
    network,
    vaultAddresses,
    vaultIds,
    manager,
    finalised,
    minimumHoldings,
    lastId = 0,
    retryCount = 0
  } = _ref;
  const where = buildWhere({
    isFinalized: finalised,
    totalHoldings_gt: minimumHoldings,
    vaultId_in: vaultIds,
    id_in: vaultAddresses == null ? void 0 : vaultAddresses.map(x => x.toLowerCase()),
    manager: manager == null ? void 0 : manager.toLowerCase(),
    vaultId_gte: lastId
  });
  const query = gql`{
    globals {
      fees {
        mintFee
        randomRedeemFee
        targetRedeemFee
        randomSwapFee
        targetSwapFee
      }
    }
    vaults(
      first: 1000
      where: ${where}
    ) {
      vaultId
      id
      is1155
      isFinalized
      totalHoldings
      totalMints
      totalRedeems
      createdAt
      holdings(
        first: 1000,
        orderBy: dateAdded,
        orderDirection: desc
      ) {
        id
        tokenId
        amount
        dateAdded
      }
      token {
        id
        name
        symbol
      }
      fees {
        mintFee
        randomRedeemFee
        targetRedeemFee
        randomSwapFee
        targetSwapFee
      }
      usesFactoryFees
      asset {
        id
        name
        symbol
      }
      manager {
        id
      }
      createdBy {
        id
      }
      eligibilityModule {
        id
        eligibleIds
        eligibleRange
      }
      features {
        enableMint
        enableRandomRedeem
        enableTargetRedeem
        enableRandomSwap
        enableTargetSwap
      }
      inventoryStakingPool {
        id
        dividendToken {
          id
          name
          symbol
        }
      }
      lpStakingPool {
        id
        stakingToken {
          id
          name
          symbol
        }
      }
    }
  }`;
  let data;

  try {
    data = await querySubgraph({
      url: getChainConstant(constants.NFTX_SUBGRAPH, network),
      query
    });
  } catch (e) {
    console.error(e);

    if (retryCount < 3) {
      return fetch$1({
        network,
        finalised,
        lastId,
        manager,
        vaultAddresses,
        vaultIds,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }

  return data;
};

var fetch$2 = fetch$1;

function midQuote(amountA, reserveA, reserveB) {
  if (!amountA.gt(0)) {
    return false;
  }

  if (!reserveA.gt(0) || !reserveB.gt(0)) {
    return false;
  }

  const amountB = amountA.mul(reserveB).div(reserveA);
  return amountB;
} // given an output amount of an asset and pair reserves, returns a required input amount of the other asset


function getAmountIn(amountOut, reserveIn, reserveOut) {
  if (!amountOut.gt(0)) {
    return false;
  }

  if (!reserveIn.gt(0) || !reserveOut.gt(0)) {
    return false;
  }

  const numerator = reserveIn.mul(amountOut).mul(1000);
  const denominator = reserveOut.sub(amountOut).mul(997); // not enough liquidity

  if (denominator.eq(0) || numerator.eq(0)) {
    return false;
  }

  return numerator.div(denominator).add(1);
} // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset


function getAmountOut(amountIn, reserveIn, reserveOut) {
  if (!amountIn.gt(0)) {
    return false;
  }

  if (!reserveIn.gt(0) || !reserveOut.gt(0)) {
    return false;
  }

  const amountInWithFee = amountIn.mul(997);
  const numerator = amountInWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(amountInWithFee); // not enough liquidity

  if (denominator.eq(0) || numerator.eq(0)) {
    return false;
  }

  return numerator.div(denominator);
}

const calcMidPrice = function (reserve, amount) {
  if (amount === void 0) {
    amount = '1';
  }

  if (amount && reserve.reserveVtoken && reserve.reserveWeth) {
    return midQuote(units.parseEther(amount), reserve.reserveVtoken, reserve.reserveWeth);
  }

  return false;
};

const calcBuyPrice = function (reserve, amount) {
  if (amount === void 0) {
    amount = '1';
  }

  return getAmountIn(units.parseEther(amount), reserve.reserveWeth, reserve.reserveVtoken);
};

const calcSellPrice = function (reserve, amount) {
  if (amount === void 0) {
    amount = '1';
  }

  return getAmountOut(units.parseEther(amount), reserve.reserveVtoken, reserve.reserveWeth);
};

const transformVaultReserves = reserves => {
  if (!reserves || !reserves.reserveVtoken || !reserves.reserveWeth) {
    return {
      derivedETH: constants$1.Zero,
      rawPrice: constants$1.Zero,
      reserveVtoken: constants$1.Zero,
      reserveWeth: constants$1.Zero
    };
  }

  const midPrice = calcMidPrice(reserves); // use 0.25 vtoken purchase as liqudity check

  const buyPrice = calcBuyPrice(reserves, '0.25');
  const sellPrice = calcSellPrice(reserves, '0.25'); // only show price if 10% spread or less

  const enoughLiquidity = buyPrice && sellPrice ? buyPrice.sub(sellPrice).mul(constants$1.WeiPerEther).div(buyPrice).lte(units.parseEther('0.1')) : false;

  if (midPrice) {
    return {
      derivedETH: enoughLiquidity ? midPrice : constants$1.Zero,
      rawPrice: midPrice,
      reserveVtoken: reserves.reserveVtoken,
      reserveWeth: reserves.reserveWeth
    };
  }

  return {
    derivedETH: constants$1.Zero,
    rawPrice: constants$1.Zero,
    reserveVtoken: constants$1.Zero,
    reserveWeth: constants$1.Zero
  };
};

var transformVaultReserves$1 = transformVaultReserves;

const transformVault = _ref => {
  let {
    reserves,
    vault: x,
    globalFees
  } = _ref;
  const reserve = reserves == null ? void 0 : reserves.find(_ref2 => {
    let {
      tokenId
    } = _ref2;
    return tokenId === x.id;
  });
  const holdings = x.holdings.map(holding => ({ ...holding,
    amount: bignumber.BigNumber.from(holding.amount),
    dateAdded: Number(holding.dateAdded)
  }));
  const rawFees = (x.usesFactoryFees && globalFees ? globalFees : x.fees) ?? {};
  const fees = mapObj(rawFees, (key, value) => {
    return [key, bignumber.BigNumber.from(value)];
  });
  const {
    derivedETH,
    rawPrice,
    reserveVtoken,
    reserveWeth
  } = transformVaultReserves$1(reserve);
  const vault = { ...x,
    createdAt: Number(x.createdAt),
    totalHoldings: Number(x.totalHoldings),
    totalMints: Number(x.totalMints),
    totalRedeems: Number(x.totalRedeems),
    holdings,
    fees,
    derivedETH,
    rawPrice,
    reserveVtoken,
    reserveWeth
  };
  return vault;
};

var transformVault$1 = transformVault;

const isVaultEnabled = vault => {
  var _vault$eligibilityMod;

  // finalized or DAO vaults only
  if (!vault.isFinalized) {
    return false;
  } // otherwise has to have following features enabled


  if (!vault.features.enableMint || !vault.features.enableRandomRedeem && !vault.features.enableTargetRedeem) {
    return false;
  } // if we have a finalised vault, make sure that if it's using OpenSea Collection it has some form of eligibilities set


  if (addressEqual$1(vault.asset.id, constants.OPENSEA_COLLECTION) && !((_vault$eligibilityMod = vault.eligibilityModule) != null && _vault$eligibilityMod.id)) {
    return false;
  }

  return true;
};

const fetchVaults = async _ref => {
  var _data$vaults, _data$globals, _data$globals$, _data$vaults2;

  let {
    network,
    vaultAddresses,
    vaultIds,
    manager,
    finalised,
    enabled,
    minimumHoldings,
    lastId = 0,
    retryCount = 0
  } = _ref;
  const data = await fetch$2({
    network,
    finalised,
    lastId,
    manager,
    minimumHoldings,
    retryCount,
    vaultAddresses,
    vaultIds
  });
  const reserves = await fetchReservesForTokens$1({
    network,
    tokenAddresses: (data == null ? void 0 : (_data$vaults = data.vaults) == null ? void 0 : _data$vaults.map(_ref2 => {
      let {
        id
      } = _ref2;
      return id;
    })) ?? []
  });
  const globalFees = data == null ? void 0 : (_data$globals = data.globals) == null ? void 0 : (_data$globals$ = _data$globals[0]) == null ? void 0 : _data$globals$.fees;
  let vaults = (data == null ? void 0 : (_data$vaults2 = data.vaults) == null ? void 0 : _data$vaults2.map(x => {
    return transformVault$1({
      globalFees,
      reserves,
      vault: x
    });
  })) ?? [];

  if (vaults.length === 1000) {
    const moreVaults = await fetchVaults({
      network,
      finalised,
      manager,
      vaultAddresses,
      vaultIds,
      retryCount: 0,
      lastId: Number(vaults[vaults.length - 1].vaultId) + 1
    });
    vaults = [...vaults, ...moreVaults];
  } // We only want to filter/sort once we've got all the vaults fetched
  // if lastId > 0 that means we're recursively fetching _more_ vaults


  if (lastId > 0) {
    return vaults;
  } // Filter out any vaults that aren't set up for use


  if (enabled) {
    vaults = vaults.filter(isVaultEnabled);
  }

  vaults.sort((a, b) => {
    const tvlB = b.derivedETH.toNumber() * b.totalHoldings;
    const tvlA = a.derivedETH.toNumber() * a.totalHoldings;
    return tvlB - tvlA;
  });
  return vaults;
};

var fetchVaults$1 = fetchVaults;

async function fetchVault(_ref) {
  let {
    network,
    vaultAddress,
    vaultId
  } = _ref;
  const vaults = await fetchVaults$1({
    network,
    vaultIds: vaultId == null ? null : [vaultId],
    vaultAddresses: vaultAddress == null ? null : [vaultAddress]
  });
  return vaults == null ? void 0 : vaults[0];
}

const fetchSingleVaultFees = async _ref => {
  let {
    vaultAddress,
    fromTimestamp,
    network,
    retryCount = 0
  } = _ref;
  const query = gql`{
      vault(id: ${vaultAddress}) {
        feeReceipts(
          first: 1000,
          where: {
            date_gt: ${fromTimestamp}
          },
          orderBy: date,
          orderDirection: asc
        ) {
          amount
          date
        }
      }
    }`;

  try {
    var _data$vault, _data$vault$feeReceip;

    const data = await querySubgraph({
      url: getChainConstant(constants.NFTX_SUBGRAPH, network),
      query
    });
    let receipts = data == null ? void 0 : (_data$vault = data.vault) == null ? void 0 : (_data$vault$feeReceip = _data$vault.feeReceipts) == null ? void 0 : _data$vault$feeReceip.map(receipt => {
      return transformFeeReceipt(receipt, vaultAddress, network);
    });

    if (receipts.length === 1000) {
      const moreReceipts = await fetchVaultFees({
        network,
        vaultAddress,
        retryCount: 0,
        fromTimestamp: receipts[receipts.length - 1].date
      });
      receipts = [...receipts, ...moreReceipts];
    }

    return receipts;
  } catch (e) {
    if (retryCount < 3) {
      return fetchSingleVaultFees({
        fromTimestamp,
        network,
        vaultAddress,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }
};

const fetchMultiVaultFees = async _ref2 => {
  let {
    network,
    vaultAddresses,
    fromTimestamp,
    lastId = 0,
    retryCount = 0
  } = _ref2;
  const query = gql`{
    vaults(
      first: 1000,
      where: {
        id_in: ${vaultAddresses.map(x => x.toLowerCase())}
        vaultId_gte: ${lastId}
      }
    ) {
      id
      vaultId
      feeReceipts(
        first: 1000
        where: {
          date_gt: ${fromTimestamp}
        }
        orderBy: date
        orderDirection: asc
      ) {
        amount
        date
      }
    }
  }`;

  try {
    var _data$vaults;

    const data = await querySubgraph({
      url: getChainConstant(constants.NFTX_SUBGRAPH, network),
      query
    });
    const feeReceipts = await Promise.all((data == null ? void 0 : (_data$vaults = data.vaults) == null ? void 0 : _data$vaults.map(async vault => {
      let receipts = vault.feeReceipts.map(receipt => {
        return transformFeeReceipt(receipt, vault.id, network);
      });

      if (receipts.length === 1000) {
        const moreReceipts = await fetchSingleVaultFees({
          network,
          vaultAddress: vault.id,
          fromTimestamp: receipts[receipts.length - 1].date
        });
        receipts = [...receipts, ...moreReceipts];
      }

      return receipts;
    })) ?? []).then(x => x.flat());
    return feeReceipts;
  } catch (e) {
    if (retryCount < 3) {
      return fetchMultiVaultFees({
        fromTimestamp,
        network,
        vaultAddresses,
        lastId,
        retryCount: retryCount + 1
      });
    }

    throw e;
  }
};

async function fetchVaultFees(_ref3) {
  let {
    network,
    vaultAddress,
    vaultAddresses,
    fromTimestamp = 0
  } = _ref3;

  if (vaultAddress) {
    return fetchSingleVaultFees({
      vaultAddress,
      fromTimestamp,
      network
    });
  }

  if (vaultAddresses != null && vaultAddresses.length) {
    return fetchMultiVaultFees({
      vaultAddresses,
      fromTimestamp,
      network
    });
  }

  return [];
}

const fetchXTokenShare = async _ref => {
  let {
    network,
    provider,
    vaultId
  } = _ref;
  const address = getChainConstant(constants.NFTX_INVENTORY_STAKING, network);
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$3["default"],
    address
  });
  const share = await contract.xTokenShareValue(vaultId);
  return share;
};

var fetchXTokenShare$1 = fetchXTokenShare;

const fetchXTokenShares = async _ref => {
  let {
    network,
    provider,
    vaultIds
  } = _ref;
  const shares = await Promise.all(vaultIds.map(async vaultId => {
    const share = await fetchXTokenShare$1({
      network,
      provider,
      vaultId
    });
    return {
      vaultId,
      share
    };
  }));
  return shares;
};

var fetchXTokenShares$1 = fetchXTokenShares;

const isVaultSwappable = vault => {
  var _vault$features, _vault$features2;

  return (vault == null ? void 0 : (_vault$features = vault.features) == null ? void 0 : _vault$features.enableTargetSwap) || (vault == null ? void 0 : (_vault$features2 = vault.features) == null ? void 0 : _vault$features2.enableRandomSwap) || false;
};
const doesVaultHaveTargetSwapFee = vault => {
  var _vault$fees;

  return ((vault == null ? void 0 : (_vault$fees = vault.fees) == null ? void 0 : _vault$fees.targetSwapFee) ?? constants$1.Zero).isZero() === false;
};
const doesVaultHaveRandomSwapFee = vault => {
  var _vault$fees2;

  return ((vault == null ? void 0 : (_vault$fees2 = vault.fees) == null ? void 0 : _vault$fees2.randomSwapFee) ?? constants$1.Zero).isZero() === false;
};

const fetchVaultSwapPrice = async _ref => {
  let {
    network,
    provider,
    vault,
    targetSwaps,
    randomSwaps
  } = _ref;

  /** For waps the price is purely for the swap fee
   * so we just have to work out the total fees for the intended target/random counts
   */
  let amount = constants$1.Zero;

  if (targetSwaps != null || randomSwaps != null) {
    if (targetSwaps) {
      amount = amount.add(vault.fees.targetSwapFee.mul(targetSwaps));
    }

    if (randomSwaps) {
      amount = amount.add(vault.fees.randomSwapFee.mul(randomSwaps));
    }
    /** If you don't specificy a number of swaps, we assume you want to know the price of
     * 1 random or 1 target swap (dependent on the vault)
     */

  } else if (doesVaultHaveRandomSwapFee(vault) && !doesVaultHaveTargetSwapFee(vault)) {
    amount = amount.add(vault.fees.randomSwapFee);
  } else if (doesVaultHaveTargetSwapFee(vault)) {
    amount = amount.add(vault.fees.targetSwapFee);
  }

  if (amount.isZero()) {
    return amount;
  }

  return fetchBuyPrice$1({
    network,
    provider,
    tokenAddress: vault.id,
    quote: 'ETH',
    amount
  });
};

var fetchVaultSwapPrice$1 = fetchVaultSwapPrice;

const isApproved = async _ref => {
  let {
    network,
    provider,
    spenderAddress,
    tokenAddress,
    userAddress,
    amount,
    standard,
    tokenId,
    tokenIds
  } = _ref;

  if (standard === 'ERC721' || standard === 'ERC1155') {
    if (isCryptoPunk(tokenAddress)) {
      const contract = getContract$1({
        network,
        provider,
        address: tokenAddress,
        abi: punkAbi__default["default"]
      });
      const results = await Promise.all((tokenIds ?? [tokenId]).map(async tokenId => {
        try {
          const punk = await contract.punksOfferedForSale(tokenId);
          return [punk.isForSale, addressEqual$1(punk.seller, userAddress), punk.minValue.isZero(), addressEqual$1(punk.onlySellTo, spenderAddress)].every(Boolean);
        } catch {
          return false;
        }
      }));
      return results.every(Boolean);
    }

    const contract = getContract$1({
      network,
      abi: erc721Abi__default["default"],
      provider,
      address: tokenAddress
    });
    return contract.isApprovedForAll(userAddress, spenderAddress);
  }

  if (standard === 'ERC20') {
    try {
      const contract = getContract$1({
        network,
        provider,
        abi: abi__default["default"],
        address: tokenAddress
      });
      const allowance = await contract.allowance(userAddress, spenderAddress);
      return allowance.gt(0) && allowance.gte(amount ?? constants$1.MaxUint256);
    } catch {
      return false;
    }
  }

  return false;
};

var isApproved$1 = isApproved;

const mintIntoVault = async _ref => {
  let {
    network,
    provider,
    tokenIds,
    vaultAddress
  } = _ref;
  const ids = getUniqueTokenIds(tokenIds);
  const amounts = getTokenIdAmounts(tokenIds);
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$4["default"],
    address: vaultAddress,
    type: 'write'
  });
  return contract.mint(ids, amounts);
};

var mintIntoVault$1 = mintIntoVault;

/** Redeems an item from the vault
 * Exchanges, for example, 1.05 PUNK for a punk nft
 */

const redeemFromVault = async _ref => {
  let {
    network,
    provider,
    targetIds,
    vaultAddress,
    randomRedeems
  } = _ref;
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$4["default"],
    address: vaultAddress,
    type: 'write'
  });
  const specificIds = getExactTokenIds(targetIds); // the total amount to redeem, if you try to redeem more than the total specific ids
  // it will fill out the rest with randoms

  const amount = specificIds.length + (randomRedeems ?? 0); // Add gas buffer to redeems ti account for calculation weirdness

  let gas;

  try {
    gas = await contract.estimateGas.redeem(amount, specificIds);
    gas = gas.add(300000);
  } catch (e) {
    console.error(e);
  }

  return contract.redeem(amount, specificIds, amount > 1 && gas ? {
    gasLimit: gas
  } : null);
};

var redeemFromVault$1 = redeemFromVault;

const erc721 = async _ref => {
  let {
    vaultId,
    tokenIds,
    minPrice,
    path,
    userAddress,
    contract
  } = _ref;
  const ids = getUniqueTokenIds(tokenIds);
  const args = [vaultId, ids, minPrice, path, userAddress];
  const {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await estimateGasAndFees$1({
    contract,
    method: 'mintAndSell721',
    args
  });
  const gasLimit = increaseGasLimit$1({
    estimate: gasEstimate,
    amount: 7
  });

  try {
    // Attempt an EIP1559 transaction
    return contract.mintAndSell721(...args, omitNil({
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    }));
  } catch {
    // Fallback to a legacy tx
    return contract.mintAndSell721(vaultId, ids, minPrice, userAddress, omitNil({
      gasLimit
    }));
  }
};

const erc1155 = async _ref2 => {
  let {
    vaultId,
    tokenIds,
    minPrice,
    path,
    userAddress,
    contract
  } = _ref2;
  const ids = getUniqueTokenIds(tokenIds);
  const amounts = getTokenIdAmounts(tokenIds);
  const args = [vaultId, ids, amounts, minPrice, path, userAddress];
  const {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await estimateGasAndFees$1({
    contract,
    method: 'mintAndSell1155',
    args
  });
  const gasLimit = increaseGasLimit$1({
    estimate: gasEstimate,
    amount: 7
  });
  return contract.mintAndSell1155(...args, omitNil({
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas
  }));
};

const sellIntoVault = async _ref3 => {
  let {
    minPrice,
    network,
    provider,
    tokenIds,
    userAddress,
    vaultAddress,
    vaultId,
    quote,
    standard
  } = _ref3;
  const path = [vaultAddress, getChainConstant(constants.WETH_TOKEN, network)];
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$1["default"],
    address: getChainConstant(constants.NFTX_MARKETPLACE_ZAP, network),
    type: 'write'
  });

  if (quote === 'ETH') {
    if (standard === 'ERC721') {
      return erc721({
        contract,
        minPrice,
        path,
        tokenIds,
        userAddress,
        vaultId
      });
    }

    if (standard === 'ERC1155') {
      return erc1155({
        contract,
        minPrice,
        path,
        tokenIds,
        userAddress,
        vaultId
      });
    }
  }

  throw new Error(`sellIntoVault is not supported for ${standard} / ${quote}`);
};

var sellIntoVault$1 = sellIntoVault;

const erc721EthFee = async _ref => {
  let {
    network,
    provider,
    vaultId,
    userAddress,
    vaultAddress,
    maxPrice,
    mintTokenIds,
    redeemTokenIds
  } = _ref;
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const redeemIds = getUniqueTokenIds(redeemTokenIds);
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$1["default"],
    address: getChainConstant(constants.NFTX_MARKETPLACE_ZAP, network),
    type: 'write'
  });
  const path = [getChainConstant(constants.WETH_TOKEN, network), vaultAddress];
  const args = [vaultId, mintIds, redeemIds, path, userAddress];
  const {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await estimateGasAndFees$1({
    contract,
    method: 'buyAndSwap721',
    args,
    overrides: omitNil({
      value: maxPrice
    })
  });
  const gasLimit = increaseGasLimit$1({
    estimate: gasEstimate,
    amount: 7
  });

  try {
    return contract.buyAndSwap721(...args, omitNil({
      value: maxPrice,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    }));
  } catch {
    return contract.buyAndSwap721(...args, omitNil({
      value: maxPrice,
      gasLimit
    }));
  }
};

const erc721EthNoFee = async _ref2 => {
  let {
    network,
    provider,
    vaultAddress,
    mintTokenIds,
    redeemTokenIds
  } = _ref2;
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const redeemIds = getUniqueTokenIds(redeemTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);
  const contract = getContract$1({
    network,
    provider,
    address: vaultAddress,
    type: 'write',
    abi: abi__default$4["default"]
  });
  return contract.swap(mintIds, amounts, redeemIds);
};

const erc1155Fee = async _ref3 => {
  let {
    network,
    provider,
    vaultId,
    userAddress,
    vaultAddress,
    maxPrice,
    mintTokenIds,
    redeemTokenIds
  } = _ref3;
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);
  const redeemIds = getExactTokenIds(redeemTokenIds);
  const contract = getContract$1({
    network,
    provider,
    abi: abi__default$1["default"],
    address: getChainConstant(constants.NFTX_MARKETPLACE_ZAP, network),
    type: 'write'
  });
  const path = [getChainConstant(constants.WETH_TOKEN, network), vaultAddress];
  const args = [vaultId, mintIds, amounts, redeemIds, path, userAddress];
  const {
    gasEstimate,
    maxFeePerGas,
    maxPriorityFeePerGas
  } = await estimateGasAndFees$1({
    args,
    contract,
    method: 'buyAndSwap1155',
    overrides: omitNil({
      value: maxPrice
    })
  });
  const gasLimit = increaseGasLimit$1({
    estimate: gasEstimate,
    amount: 7
  });

  try {
    return contract.buyAndSwap1155(...args, omitNil({
      value: maxPrice,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas
    }));
  } catch {
    return contract.buyAndSwap1155(...args, omitNil({
      value: maxPrice,
      gasLimit
    }));
  }
};

const erc1155NoFee = async _ref4 => {
  let {
    network,
    provider,
    vaultAddress,
    mintTokenIds,
    redeemTokenIds
  } = _ref4;
  const mintIds = getUniqueTokenIds(mintTokenIds);
  const amounts = getTokenIdAmounts(mintTokenIds);
  const redeemIds = getExactTokenIds(redeemTokenIds);
  const contract = getContract$1({
    network,
    provider,
    address: vaultAddress,
    type: 'write',
    abi: abi__default$4["default"]
  });
  return contract.swap(mintIds, amounts, redeemIds);
};

const swapWithVault = async _ref5 => {
  let {
    vault,
    mintTokenIds,
    network,
    provider,
    redeemTokenIds,
    userAddress,
    vaultAddress,
    vaultId,
    maxPrice,
    quote,
    standard
  } = _ref5;
  const totalCount = getTotalTokenIds(mintTokenIds);
  const targetCount = getTotalTokenIds(redeemTokenIds);
  const randomCount = totalCount - targetCount;
  const hasFee = targetCount > 0 && vault.fees.targetSwapFee.gt(0) || randomCount > 0 && vault.fees.randomSwapFee.gt(0);

  if (quote === 'ETH') {
    if (standard === 'ERC721') {
      if (hasFee) {
        return erc721EthFee({
          maxPrice,
          mintTokenIds,
          network,
          provider,
          redeemTokenIds,
          userAddress,
          vaultAddress,
          vaultId
        });
      }

      return erc721EthNoFee({
        mintTokenIds,
        network,
        provider,
        redeemTokenIds,
        vaultAddress
      });
    }

    if (standard === 'ERC1155') {
      if (hasFee) {
        return erc1155Fee({
          maxPrice,
          mintTokenIds,
          network,
          provider,
          redeemTokenIds,
          userAddress,
          vaultAddress,
          vaultId
        });
      }

      return erc1155NoFee({
        mintTokenIds,
        network,
        provider,
        redeemTokenIds,
        vaultAddress
      });
    }
  }

  throw new Error(`swapWithVault is not supported for ${standard} / ${quote}`);
};

var swapWithVault$1 = swapWithVault;

exports.MulticallContract = MulticallContract$1;
exports.addressEqual = addressEqual$1;
exports.approve = approve;
exports.buildWhere = buildWhere;
exports.buyFromVault = buyFromVault$1;
exports.doesVaultHaveRandomSwapFee = doesVaultHaveRandomSwapFee;
exports.doesVaultHaveTargetSwapFee = doesVaultHaveTargetSwapFee;
exports.estimateGasAndFees = estimateGasAndFees$1;
exports.fetchAssetMetadata = fetchAssetMetadata$1;
exports.fetchBuyPrice = fetchBuyPrice$1;
exports.fetchEthPrice = fetchEthPrice$1;
exports.fetchPool = fetchPool$1;
exports.fetchPools = fetchPools$1;
exports.fetchReservesForToken = fetchReservesForToken$1;
exports.fetchReservesForTokens = fetchReservesForTokens$1;
exports.fetchSellPrice = fetchSellPrice$3;
exports.fetchTokenBalance = fetchTokenBalance$1;
exports.fetchTotalSupply = fetchTotalSupply$1;
exports.fetchUserAssets = fetchUserAssets$1;
exports.fetchVault = fetchVault;
exports.fetchVaultActivity = fetchVaultActivity;
exports.fetchVaultBuyPrice = fetchVaultBuyPrice$1;
exports.fetchVaultFees = fetchVaultFees;
exports.fetchVaultSellPrice = fetchVaultSellPrice$1;
exports.fetchVaultSwapPrice = fetchVaultSwapPrice$1;
exports.fetchVaults = fetchVaults$1;
exports.fetchXTokenShare = fetchXTokenShare$1;
exports.fetchXTokenShares = fetchXTokenShares$1;
exports.getContract = getContract$1;
exports.gql = gql;
exports.increaseGasLimit = increaseGasLimit$1;
exports.isApproved = isApproved$1;
exports.isCryptoKitty = isCryptoKitty;
exports.isCryptoPunk = isCryptoPunk;
exports.isNonstandard721 = isNonstandard721;
exports.isVaultSwappable = isVaultSwappable;
exports.mintIntoVault = mintIntoVault$1;
exports.parseLogEvent = parseLogEvent$1;
exports.querySubgraph = querySubgraph;
exports.redeemFromVault = redeemFromVault$1;
exports.sellIntoVault = sellIntoVault$1;
exports.swapWithVault = swapWithVault$1;
