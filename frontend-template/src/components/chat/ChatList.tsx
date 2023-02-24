import React, { useContext, useEffect } from 'react';

import { Avatar, List, ListItemAvatar, ListItemButton } from '@mui/material';

import { Chat } from '../../api/generated';
import { ActiveChatContext } from '../../context/active-chat';

type Props = {
    chats: Chat[];
};

const ChatList = ({ chats }: Props) => {
    const { activeChat, setActiveChat } = useContext(ActiveChatContext);

    useEffect(() => {
        chats[0] && setActiveChat(chats[0]);
    }, []);

    const selectChat = (chat: Chat) => {
        setActiveChat(chat);
    };

    return (
        <List>
            {chats.map((chat) => (
                <ListItemButton
                    key={chat.id}
                    selected={activeChat?.id === chat.id}
                    onClick={() => selectChat(chat)}
                >
                    <ListItemAvatar>
                        <Avatar src={chat.avatar}>ava</Avatar>
                    </ListItemAvatar>
                    {chat.name}
                </ListItemButton>
            ))}
        </List>
    );
};

export default ChatList;
