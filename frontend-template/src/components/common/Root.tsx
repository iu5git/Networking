import React, { useEffect } from 'react';

import styled from '@emotion/styled';
import { ToastContainer } from 'react-toastify';

import { useAppDispatch } from '../../hooks';
import {
    setUserCurrentAction,
    useCurrentUser,
} from '../../state/current-user/slice';
import ChatNav from '../chat/ChatNav';
import ChatSpace from '../chat/ChatSpace';

const Root = () => {
    const dispatch = useAppDispatch();
    const currentUser = useCurrentUser();

    useEffect(() => {
        dispatch(
            setUserCurrentAction({
                id: 4,
                username: 'Alex',
                avatar: '',
            })
        );
    }, []);

    return currentUser.username ? (
        <StyledRoot>
            <ChatNav />
            <ChatSpace />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </StyledRoot>
    ) : null;
};

const StyledRoot = styled.div`
    display: flex;
    text-align: center;
    height: 100%;
`;

export default Root;
