import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Chat } from '../models/Chat';
import type { CreateChat } from '../models/CreateChat';

export class ChatService {
    /**
     * Returns a chats
     * @returns Chat successful operation
     * @throws ApiError
     */
    public static getChats(): CancelablePromise<Array<Chat>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chat',
        });
    }

    /**
     * @param requestBody Update an existent chat
     * @returns Chat Successful operation
     * @throws ApiError
     */
    public static updateChat(requestBody: CreateChat): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid ID supplied`,
                404: `Chat not found`,
                405: `Validation exception`,
            },
        });
    }

    /**
     * Add a new chat
     * @param requestBody Create a new chat
     * @returns Chat Successful operation
     * @throws ApiError
     */
    public static addChat(requestBody: CreateChat): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                405: `Invalid input`,
            },
        });
    }

    /**
     * Returns a single chat
     * @param chatId ID of chat to return
     * @returns Chat successful operation
     * @throws ApiError
     */
    public static getChatById(chatId: number): CancelablePromise<Chat> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/chat/{chatId}',
            path: {
                chatId: chatId,
            },
            errors: {
                400: `Invalid ID supplied`,
                404: `Chat not found`,
            },
        });
    }

    /**
     * delete a chat
     * @param chatId Chat id to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteChat(chatId: number): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/chat/{chatId}',
            path: {
                chatId: chatId,
            },
            errors: {
                400: `Invalid chat value`,
            },
        });
    }
}
