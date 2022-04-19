/** Extracts the ids give an array of target ids
 * if an id has multiple quantities, the id is included multiple times in the output
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '2', '3']
 */
export const getExactTokenIds = (
  tokenIds: Array<string> | Array<[string, number]>
): string[] => {
  return tokenIds
    .map((item: string | [string, number]) => {
      if (Array.isArray(item)) {
        const [id, quantity] = item;
        return Array(quantity ?? 1).fill(id);
      }
      return item;
    })
    .flat();
};

/** Returns an array of target ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '3']
 */
export const getUniqueTokenIds = (
  tokenIds: Array<string> | Array<[string, number]>
): string[] => {
  return tokenIds
    .map((item: string | [string, number]) => {
      if (Array.isArray(item)) {
        return item[0];
      }
      return item;
    })
    .filter((x) => x != null);
};

/** Returns an array of amounts ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> [1, 1, 1]
 * [['1', 1], ['2', 2], ['3', 1]] -> [1, 2, 1]
 */
export const getTokenIdAmounts = (
  tokenIds: Array<string> | Array<[string, number]>
): number[] => {
  return tokenIds.map((item: string | [string, number]) => {
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
export const getTotalTokenIds = (
  tokenIds: Array<string> | Array<[string, number]>
): number => {
  return getExactTokenIds(tokenIds).length;
};
