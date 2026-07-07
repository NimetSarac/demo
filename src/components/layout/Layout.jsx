import Navbar from './Navbar';
import Footer from './Footer';
import { Box, Flex } from '@chakra-ui/react';

function Layout({ children }) {
    return (
        <Flex direction="column" minH="100vh">
            <Navbar />
            <Box flex={1} p={6}>
                {children}
            </Box>
            <Footer />
        </Flex>
    );
}

export default Layout;