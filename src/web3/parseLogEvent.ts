import { Log } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';

const parseLogEvent = <T>({
  interface: iface,
  logs,
  signature,
  filter,
}: {
  logs: Log[];
  signature: string;
  /** A string representation of the event's interface
   * i.e. event Transfer(address indexed from, address indexed to, uint value) */
  interface: string;
  filter?: (log: Log) => boolean;
}): T => {
  try {
    const parser = new Interface([iface]);
    const event = logs
      ?.slice()
      // we want the find the _last_ log that matches
      .reverse()
      .find((log) => {
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
    return parser.parseLog(event).args as unknown as T;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default parseLogEvent;
