import React from 'react';
import styled from '@emotion/styled';

import { Chat, ChatService } from '../../api/generated';
import FetchWrapper from '../common/FetchWrapper';
import ChatList from './ChatList';

const ChatNav = () => {
    return (
        <ChatListContainer>
            <FetchWrapper<Chat[]>
                queryKey="chats"
                fetchFn={async () => await ChatService.getChats()}
                render={({ data }) => {
                    return <ChatList chats={data} />;
                }}
            />
        </ChatListContainer>
    );
};

const ChatListContainer = styled.div`
    height: 100%;
    width: 300px;
    border-right: 1px solid black;
`;

export default ChatNav;
