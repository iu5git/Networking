import { configureStore } from '@reduxjs/toolkit';

import currentUser from './current-user/slice';

const store = configureStore({
    reducer: { currentUser },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
