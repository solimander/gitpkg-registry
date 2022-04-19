import { Log } from '@ethersproject/providers';
declare const parseLogEvent: <T>({ interface: iface, logs, signature, filter, }: {
    logs: Log[];
    signature: string;
    /** A string representation of the event's interface
     * i.e. event Transfer(address indexed from, address indexed to, uint value) */
    interface: string;
    filter?: (log: Log) => boolean;
}) => T;
export default parseLogEvent;
