import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Home() {
    return (
        <Box>
           <Box
    bg="#0d47a1"
    color="white"
    py={16}
    px={8}
    textAlign="center"
    borderRadius="lg"
    mb={8}
>
                <Heading size="2xl" mb={4}>NİMET SARAÇ</Heading>
                <Text fontSize="lg" mb={6}>
                    
                </Text>
                <Button
                    as={RouterLink}
                    to="/products"
                    colorScheme="white"
                    variant="outline"
                    size="lg"
                    _hover={{ bg: 'white', color: 'brand.700' }}
                >
                    Ürünleri Keşfet
                </Button>
            </Box>
            <Heading size="mb" mb={3}>ÜRÜNLER</Heading>
        </Box>
    );
}

export default Home;