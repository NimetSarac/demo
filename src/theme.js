import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50:  '#e3f2fd',
            100: '#bbdefb',
            500: '#1976d2',
            600: '#1565c0',
            700: '#0d47a1',
            900: '#072b60',
        }
    },
    fonts: {
        heading: `'Segoe UI', sans-serif`,
        body: `'Segoe UI', sans-serif`,
    },
    styles: {
        global: {
            body: {
                bg: '#f5f7fa',
                color: '#1a1a2e',
            }
        }
    }
});

export default theme;