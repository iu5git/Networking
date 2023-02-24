import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '../../api/generated/models/User';
import { useAppSelector } from '../../hooks';

const currentUser = createSlice({
    name: 'currentUser',
    initialState: {
        id: 0,
        username: '',
        avatar: '',
    },
    reducers: {
        setCurrentUser(state, { payload }: PayloadAction<User>) {
            return payload;
        },
    },
});

export const useCurrentUser = () =>
    useAppSelector((state) => state.currentUser);

export const { setCurrentUser: setUserCurrentAction } = currentUser.actions;

export default currentUser.reducer;
