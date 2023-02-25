import React, {
    ChangeEvent,
    KeyboardEventHandler,
    useContext,
    useState,
} from 'react';

import { fadeInRight } from 'react-animations';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import SendIcon from '@mui/icons-material/Send';

import { MessageService } from '../../api/generated/services/MessageService';
import { ActiveChatContext } from '../../context/active-chat';
import { useCurrentUser } from '../../state/current-user/slice';

const ChatMessageInput = () => {
    const { activeChat } = useContext(ActiveChatContext);
    const currentUser = useCurrentUser();
    const [messageValue, setMessageValue] = useState('');
    const qc = useQueryClient();

    const changeMessageValue = (e: ChangeEvent) => {
        const target = e.target as HTMLInputElement;

        setMessageValue(target.value);
    };

    const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key !== 'Enter') return;

        sendMessage();
    };

    const sendMessage = async () => {
        if (!messageValue || !activeChat) return;

        try {
            await MessageService.addMessageInChat(activeChat.id, {
                content: messageValue,
                fromId: currentUser.id,
                toId: activeChat.id,
            });

            qc.invalidateQueries(activeChat.id.toString());

            setMessageValue('');
        } catch (err) {
            toast.error(`${err}`);
        }
    };

    return (
        <Container>
            <MessageInput
                placeholder="Write a message..."
                value={messageValue}
                onChange={changeMessageValue}
                onKeyUp={handleKeyPress}
            />
            {messageValue && <StyledSendIcon onClick={sendMessage} />}
        </Container>
    );
};

const fadeInRightAnimation = keyframes`${fadeInRight}`;

const Container = styled.div`
    display: flex;
    padding: 10px;
    background: white;
    overflow: hidden;
`;

const MessageInput = styled.input`
    width: 100%;
    padding: 5px;
    border: none;
    outline: none;
`;

const StyledSendIcon = styled(SendIcon)`
    cursor: pointer;
    color: blue;
    animation: 0.3s ${fadeInRightAnimation};
`;

export default ChatMessageInput;
