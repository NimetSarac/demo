import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <AuthProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </AuthProvider>
        </ChakraProvider>
    </React.StrictMode>
);