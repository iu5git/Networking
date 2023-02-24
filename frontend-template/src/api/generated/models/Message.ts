/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type Message = {
    id: number;
    content: string;
    from: User;
    to: User;
    fromId: number;
    toId: number;
};
