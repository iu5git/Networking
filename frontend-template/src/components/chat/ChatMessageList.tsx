import React from 'react';
import styled from '@emotion/styled';

import { Message } from '../../api/generated/models/Message';
import { User } from '../../api/generated/models/User';
import { useCurrentUser } from '../../state/current-user/slice';

type Props = {
    messages: Message[];
};

const ChatMessageList = ({ messages }: Props) => {
    const currentUser = useCurrentUser();

    return (
        <StyledChatMessageList>
            {messages.map((message) =>
                isCurrentUserMessage(currentUser, message) ? (
                    <RightMessage key={message.id}>
                        {message.content}
                    </RightMessage>
                ) : (
                    <LeftMessage key={message.id}>
                        {message.content}
                    </LeftMessage>
                )
            )}
        </StyledChatMessageList>
    );
};

const isCurrentUserMessage = (currentUser: User, message: Message) => {
    return message.fromId == currentUser.id;
};

const StyledChatMessageList = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding: 15px;
`;

const LeftMessage = styled.div`
    align-self: start;
    background: white;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 5px;
`;

const RightMessage = styled.div`
    align-self: end;
    background: #91d47b;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 5px;
`;

export default ChatMessageList;
