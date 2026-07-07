import { Box, Text, HStack, Link } from '@chakra-ui/react';

function Footer() {
    return (
        <Box bg="brand.700" color="gray.400" textAlign="center" py={5} mt="auto">
            <Text fontSize="sm">© 2026 E-Ticaret — Tüm hakları saklıdır.</Text>
            <HStack justify="center" spacing={5} mt={2} fontSize="sm">
                <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                    Gizlilik Politikası
                </Link>
                <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                    Kullanım Koşulları
                </Link>
                <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                    İletişim
                </Link>
            </HStack>
        </Box>
    );
}

export default Footer;