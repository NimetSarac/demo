import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Button, Badge,
    Link, HStack
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Navbar() {

    const { user, logout, isAdmin } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            api.get(`/api/cart/${user.id}`)
                .then(res => {
                    const items = res.data.data.items;
                    setCartCount(items ? items.length : 0);
                })
                .catch(() => setCartCount(0));
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box bg="#0d47a1" px={8} py={3} color="white" position="sticky" top={0} zIndex={100}>
            <Flex align="center" justify="space-between">

                {/* Logo */}
                <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                    <Text fontSize="xl" fontWeight="bold">🛒 E-Ticaret</Text>
                </Link>

                {/* Menü */}
                <HStack spacing={6}>
                    <Link as={RouterLink} to="/" color="white" _hover={{ color: 'blue.200' }}>
                        Ana Sayfa
                    </Link>
                    <Link as={RouterLink} to="/products" color="white" _hover={{ color: 'blue.200' }}>
                        Ürünler
                    </Link>
                    {isAdmin() && (
                        <Link as={RouterLink} to="/admin" color="yellow.300" _hover={{ color: 'yellow.100' }}>
                            Admin Panel
                        </Link>
                    )}
                </HStack>

                {/* Sağ taraf */}
                <HStack spacing={4}>

                    {/* Sepet — sadece giriş yapılmışsa */}
                    {user && (
                        <Box position="relative">
                            <Link as={RouterLink} to="/cart" color="white" fontSize="xl">
                                🛒
                            </Link>
                            {cartCount > 0 && (
                                <Badge
                                    colorScheme="red"
                                    position="absolute"
                                    top="-8px"
                                    right="-8px"
                                    borderRadius="full"
                                    fontSize="10px"
                                >
                                    {cartCount}
                                </Badge>
                            )}
                        </Box>
                    )}

                    {/* Giriş/Çıkış */}
                    {user ? (
                        <HStack spacing={3}>
                            <Link as={RouterLink} to="/profile" color="white">
                                👤 {user.username}
                            </Link>
                            <Button size="sm" colorScheme="red" onClick={handleLogout}>
                                Çıkış
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing={2}>
                            <Button
                                as={RouterLink}
                                to="/login"
                                size="sm"
                                variant="outline"
                                borderColor="white"
                                color="white"
                                _hover={{ bg: 'whiteAlpha.200' }}
                            >
                                Giriş
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/register"
                                size="sm"
                                bg="white"
                                color="#0d47a1"
                                _hover={{ bg: 'gray.100' }}
                            >
                                Kayıt Ol
                            </Button>
                        </HStack>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
}

export default Navbar;