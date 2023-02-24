import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMessage } from '../models/CreateMessage';
import type { Message } from '../models/Message';

export class MessageService {
    /**
     * get messages for chat
     * @param chatId chat id
     * @returns Message successful operation
     * @throws ApiError
     */
    public static getMessagesByChat(
        chatId: number
    ): CancelablePromise<Array<Message>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chat/{chatId}/message',
            path: {
                chatId: chatId,
            },
        });
    }

    /**
     * post messages for chat
     * @param chatId chat id
     * @param requestBody Create a new message
     * @returns any successful operation
     * @throws ApiError
     */
    public static addMessageInChat(
        chatId: number,
        requestBody: CreateMessage
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/chat/{chatId}/message',
            path: {
                chatId: chatId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
