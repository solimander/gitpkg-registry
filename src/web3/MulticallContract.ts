import {
  Contract as EthersContract,
  ContractInterface,
} from '@ethersproject/contracts';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { MULTICALL } from '@nftx/constants';
import { getChainConstant } from '../utils';

const ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
];

type Res = <T>(res: T) => void;
type Rej = (e: any) => void;

type Request = {
  res: Res;
  rej: Rej;
  method: string;
  args: any[];
  contract: EthersContract;
};
type Requests = Array<Request>;

const queue: Record<string, Requests> = {};

let queued = false;

function warnOnInvalidContractCall({
  contract: { address },
  args,
  method,
}: Pick<Request, 'args' | 'method'> & {
  contract: Pick<EthersContract, 'address'>;
}) {
  console.warn(
    `Invalid contract call: address=${address} method=${method} args=${args}`
  );
}

/** Directly run a contract method on the contract itself (bypassing multicall)
 * equivalent to contract.foo(arg1, arg2)
 */
const singlecall = ({ res, rej, args, method, contract }: Request) => {
  return contract[method](...args).then(res, rej);
};

/** Encode a request
 * Takes the method/args and creates a hex of the data
 * returns a tuple of [address, data]
 */
const encode = ({
  args,
  method,
  contract: { interface: abi, address },
}: Request) => {
  if (!address || !method) {
    warnOnInvalidContractCall({ method, args, contract: { address } });
    return undefined;
  }
  try {
    const encoded = abi.encodeFunctionData(method, args);
    return [address, encoded] as const;
  } catch (e) {
    warnOnInvalidContractCall({ method, args, contract: { address } });
    return undefined;
  }
};

/** decodes a hex string and returns the response data */
const decode = (
  { contract: { interface: abi }, method }: Request,
  data: string
) => {
  const decoded = abi.decodeFunctionResult(method, data);
  // deep breath
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
  Object.keys(queue).forEach(async (network) => {
    // grab the waiting calls and empty the queue list
    const requests = (queue[network] ?? []).splice(0);
    if (!requests.length) {
      return;
    }
    if (requests.length === 1) {
      // if we only have one call, it'd be an unecessary extra trip to go through the multicall contract
      return singlecall(requests[0]);
    }
    const multicallAddress = getChainConstant(MULTICALL, Number(network), null);
    if (multicallAddress == null) {
      // Not a supported multicall network
      return Promise.all(requests.map((request) => singlecall(request)));
    }
    // we need a provider, so just use the first request's instance
    // I can't think of a scenario where different calls would be using different providers
    // unless you used a signer for one request - but MulticallContract should really only be
    // used for reads...
    const provider = requests[0].contract.provider;
    // we use the block number to tag the request, wonder if there's a more efficient way to do this
    // as right now this will cause an additional contract call
    const blockNumber = await provider.getBlockNumber();
    const contract = new EthersContract(multicallAddress, ABI, provider);

    let results: any[];
    try {
      [, results] = await contract.aggregate(requests.map(encode), {
        blockTag: blockNumber,
      });
    } catch {
      // if the entire multicall fails just fall back to single call
      requests.forEach(singlecall);
      return;
    }

    // the requests and results should have a 1:1 match up
    requests.forEach((request, i) => {
      const { res, rej } = request;
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
const addToQueue = (
  network: number,
  contract: EthersContract,
  method: string,
  args: any[]
) => {
  return new Promise((res, rej) => {
    queue[network] = queue[network] ?? [];
    queue[network].push({ contract, args, method, res, rej });
    triggerMulticall();
  });
};

const wrapContract = (network: number, contract: EthersContract) => {
  // instead of returning the actual contract, we actually create a proxy against
  // an empty object and then defer all getters to the contract
  // if you call a contract method, we intercept it and queue it up for multicall
  const proxy = new Proxy<any>(
    {},
    {
      get(target, prop: string) {
        if (typeof contract[prop] !== 'function') {
          return contract[prop];
        }
        return function (...args: any[]) {
          return addToQueue(network, contract, prop, args);
        };
      },
    }
  );

  return proxy;
};

interface IMulticallContractClass {
  new <T extends Record<string, any>>(
    network: number,
    addressOrName: string,
    contractInterface: ContractInterface,
    signerOrProvider: JsonRpcSigner | JsonRpcProvider
  ): IMulticallContract<T>;
}
type IMulticallContract<T extends Record<string, any>> = EthersContract & T;

class MulticallContract extends EthersContract {
  constructor(
    network: number,
    addressOrName: string,
    contractInterface: ContractInterface,
    signerOrProvider: any
  ) {
    super(addressOrName, contractInterface, signerOrProvider);
    const wrappedContract = wrapContract(network, this);
    return wrappedContract;
  }
}

export default MulticallContract as IMulticallContractClass;
