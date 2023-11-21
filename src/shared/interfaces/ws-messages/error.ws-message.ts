import { BaseWSMessageType } from '../../types';

export interface ErrorMessage extends BaseWSMessageType {
    type: 'error',
    code: number,
    message: string,
}