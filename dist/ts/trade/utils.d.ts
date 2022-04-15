/** Extracts the ids give an array of target ids
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '2', '3']
 */
export declare const getExactTokenIds: (tokenIds: Array<string> | Array<[string, number]>) => string[];
/** Returns an array of target ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> ['1', '2', '3']
 * [['1', 1], ['2', 2], ['3', 1]] -> ['1', '2', '3']
 */
export declare const getUniqueTokenIds: (tokenIds: Array<string> | Array<[string, number]>) => string[];
/** Returns an array of amounts ids (ignoring 1155 quantity)
 * ['1', '2', '3'] -> [1, 1, 1]
 * [['1', 1], ['2', 2], ['3', 1]] -> [1, 2, 1]
 */
export declare const getTokenIdAmounts: (tokenIds: Array<string> | Array<[string, number]>) => number[];
/** Returns the total amount of ids
 * ['1', '2', '3'] -> 3
 * [['1', 1], ['2', 2], ['3', 1]] -> 4
 */
export declare const getTotalTokenIds: (tokenIds: Array<string> | Array<[string, number]>) => number;
