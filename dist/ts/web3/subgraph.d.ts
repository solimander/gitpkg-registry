export declare const gql: (s: TemplateStringsArray, ...variables: any[]) => string;
export declare const buildWhere: <T extends Record<string, any>>(obj: T) => T;
export declare const querySubgraph: <T>({ url, query, }: {
    url: string;
    query: string;
}) => Promise<T>;
