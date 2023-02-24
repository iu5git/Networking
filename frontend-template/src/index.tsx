import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React from 'react';

import ReactDOM from 'react-dom/client';

import App from './App';
import { makeServer } from './server';

if (process.env.REACT_APP_STUB_SERVER) {
    makeServer({ environment: 'development' });
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
