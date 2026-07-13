import { Box, Flex, Text, VStack, Link, Divider } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '📦', label: 'Kategoriler', path: '/admin/categories' },
    { icon: '🛍️', label: 'Ürünler', path: '/admin/products' },
    { icon: '👥', label: 'Kullanıcılar', path: '/admin/users' },
    { icon: '📋', label: 'Siparişler', path: '/admin/orders' },
    { icon: '↩️', label: 'İadeler', path: '/admin/returns' },
];

function AdminLayout({ children }) {

    const location = useLocation();

    return (
        <Flex minH="calc(100vh - 60px)">

            {/* Sol Menü */}
            <Box
                w="240px"
                bg="#1a1a2e"
                color="white"
                flexShrink={0}
                py={6}
            >
                {/* Admin başlık */}
                <Box px={6} mb={6}>
                    <Text fontSize="xs" color="gray.400" fontWeight="bold" letterSpacing="wider">
                        YÖNETİM PANELİ
                    </Text>
                </Box>

                <Divider borderColor="whiteAlpha.200" mb={4} />

                {/* Menü öğeleri */}
                <VStack spacing={1} align="stretch" px={3}>
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                as={RouterLink}
                                to={item.path}
                                _hover={{ textDecoration: 'none' }}
                            >
                                <Box
                                    px={4}
                                    py={3}
                                    borderRadius="lg"
                                    bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                                    color={isActive ? 'white' : 'gray.400'}
                                    fontWeight={isActive ? 'bold' : 'normal'}
                                    borderLeft={isActive ? '3px solid #4fc3f7' : '3px solid transparent'}
                                    transition="all 0.2s"
                                    _hover={{
                                        bg: 'whiteAlpha.100',
                                        color: 'white'
                                    }}
                                    display="flex"
                                    alignItems="center"
                                    gap={3}
                                >
                                    <Text fontSize="18px">{item.icon}</Text>
                                    <Text fontSize="sm">{item.label}</Text>
                                </Box>
                            </Link>
                        );
                    })}
                </VStack>

                <Divider borderColor="whiteAlpha.200" mt={4} mb={4} />

                {/* Siteye dön */}
                <Box px={3}>
                    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                        <Box
                            px={4}
                            py={3}
                            borderRadius="lg"
                            color="gray.400"
                            transition="all 0.2s"
                            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                            display="flex"
                            alignItems="center"
                            gap={3}
                        >
                            <Text fontSize="18px">🏠</Text>
                            <Text fontSize="sm">Siteye Dön</Text>
                        </Box>
                    </Link>
                </Box>
            </Box>

            {/* Sağ içerik */}
            <Box flex={1} bg="gray.50" p={8} overflowY="auto">
                {children}
            </Box>
        </Flex>
    );
}

export default AdminLayout;