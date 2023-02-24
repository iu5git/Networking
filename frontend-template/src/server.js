import { belongsTo, createServer, hasMany, Model } from 'miragejs';

export function makeServer({ environment = 'test' } = {}) {
    let server = createServer({
        environment,

        models: {
            user: Model,
            chat: Model.extend({
                messages: hasMany(),
            }),
            message: Model.extend({
                chat: belongsTo('chat'),
                from: belongsTo('user'),
                to: belongsTo('user'),
            }),
        },

        seeds(server) {
            const Bob = server.create('user', {
                id: 1,
                username: 'Bob',
                avatar: '/sass-avatar.svg',
            });

            server.create('user', {
                id: 2,
                username: 'Alice',
                avatar: '/avatar.svg',
            });

            server.create('user', {
                id: 3,
                username: 'Stive',
                avatar: '/google-meet.svg',
            });

            const Alex = server.create('user', {
                id: 4,
                username: 'Alex',
                avatar: '',
            });

            const BobChat = server.create('chat', {
                id: 1,
                name: 'Bob',
                avatar: '/sass-avatar.svg',
            });

            server.create('chat', {
                id: 2,
                name: 'Alice',
                avatar: '/avatar.svg',
            });

            server.create('chat', {
                id: 3,
                name: 'Stive',
                avatar: '/google-meet.svg',
            });

            server.create('message', {
                id: 1,
                content: 'Hi!',
                chat: BobChat,
                from: Alex,
                to: Bob,
            });
            server.create('message', {
                id: 2,
                content: 'Hola!',
                chat: BobChat,
                from: Bob,
                to: Alex,
            });
            server.create('message', {
                id: 3,
                content: 'How are you?',
                chat: BobChat,
                from: Alex,
                to: Bob,
            });
            server.create('message', {
                id: 4,
                content: 'Fine',
                chat: BobChat,
                from: Bob,
                to: Alex,
            });
        },

        routes() {
            this.get('/chat', (schema) => {
                return schema.chats.all().models;
            });

            this.get('/chat/:chatId/message', (schema, req) => {
                const chat = schema.chats.find(req.params.chatId);

                const messages = chat.messages.models;

                for (const message of messages) {
                    message.attrs.from = message.from;
                    message.attrs.to = message.to;
                }

                return messages;
            });

            this.post('/chat/:chatId/message', (schema, req) => {
                const chat = schema.chats.find(req.params.chatId);

                const message = chat.createMessage(JSON.parse(req.requestBody));

                return message;
            });
        },
    });

    return server;
}
