import { omitNil } from '../utils';

export const gql = (s: TemplateStringsArray, ...variables: any[]) => {
  return s
    .map((s, i) => {
      if (i === 0) {
        return s;
      }
      return JSON.stringify(variables[i - 1]) + s;
    })
    .join('')
    .replace(/\n +/g, ' ');
};

export const buildWhere = <T extends Record<string, any>>(obj: T) => {
  return omitNil(obj);
};

export const querySubgraph = async <T>({
  url,
  query,
}: {
  url: string;
  query: string;
}) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }).replace(/\\"/g, ''), // Strip escaped double quotes
    });

    if (response.ok) {
      const { data } = await response.json();

      return data as T;
    } else {
      throw new Error(`Failed to fetch ${url} with query ${query}`);
    }
  } catch (err) {
    throw new Error(err);
  }
};
