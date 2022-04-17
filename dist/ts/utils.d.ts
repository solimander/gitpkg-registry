export declare const getChainConstant: <T>(obj: Record<number, T>, network: number, fallback?: T) => T;
export declare const reduceObj: <T extends Record<string, any>>(obj: T, fn: (acc: Array<[string, any]>, key: string, value: T[keyof T]) => Array<[string, any]>) => any;
export declare const mapObj: <T extends Record<string, any>>(obj: T, fn: (key: string, value: T[keyof T]) => [string, any]) => any;
export declare const filterObj: <T extends Record<string, any>>(obj: T, fn: (key: string, value: T[keyof T]) => boolean) => T;
export declare const omitNil: <T extends Record<string, any>>(obj: T) => T;
