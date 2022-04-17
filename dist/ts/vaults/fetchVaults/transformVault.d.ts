import { TokenReserve } from '../../tokens';
import { Vault } from '../types';
import { Response } from './fetch';
declare const transformVault: ({ reserves, vault: x, globalFees, }: {
    reserves: TokenReserve[];
    vault: Response['vaults'][0];
    globalFees: Response['globals'][0]['fees'];
}) => Vault;
export default transformVault;
