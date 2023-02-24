import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';

import Root from './components/common/Root';
import ActiveChatProvider from './context/active-chat';
import store from './state/store';

const queryClient = new QueryClient();

function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ActiveChatProvider>
                    <Root />
                </ActiveChatProvider>
            </QueryClientProvider>
        </Provider>
    );
}

export default App;
