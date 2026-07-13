import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Heading, Text, Button, HStack, VStack,
    Divider, Flex, Spinner, Center, Alert, AlertIcon,
    Badge, Link
} from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

function Cart() {

    const { user } = useAuth();
    const {
        cartItems, loading, cartCount,
        subtotal, totalDiscount, total,
        updateQuantity, removeItem, clearCart
    } = useCart();

    const navigate = useNavigate();

    if (loading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (cartItems.length === 0) {
        return (
            <EmptyState
                icon="🛒"
                title="Sepetiniz boş"
                description="Sepetinize ürün eklemek için ürünleri inceleyin."
                buttonText="Alışverişe Başla"
                onButtonClick={() => navigate('/products')}
            />
        );
    }

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        try {
            await updateQuantity(cartItemId, newQuantity);
        } catch (err) {
            alert(err.response?.data?.message || 'Güncelleme başarısız');
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await removeItem(cartItemId);
        } catch (err) {
            alert('Ürün silinemedi');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
            try {
                await clearCart();
            } catch (err) {
                alert('Sepet temizlenemedi');
            }
        }
    };

    return (
        <Box>
            <Heading size="lg" mb={6}>
                Sepetim
                <Badge ml={2} colorScheme="blue" fontSize="md">
                    {cartCount} ürün
                </Badge>
            </Heading>

            {/* Giriş yapılmamış kullanıcıya uyarı */}
            {!user && cartItems.length > 0 && (
                <Alert status="info" mb={4} borderRadius="md">
                    <AlertIcon />
                    Sepetiniz geçici olarak kaydedildi.{' '}
                    <Link as={RouterLink} to="/login" color="blue.600" ml={1} fontWeight="bold">
                        Giriş yapın
                    </Link>
                    {' '}ve alışverişinizi tamamlayın.
                </Alert>
            )}

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>

                {/* Sol — Ürün listesi */}
                <Box flex={1}>

                    {/* Sepeti temizle butonu */}
                    <Flex justify="flex-end" mb={4}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={handleClearCart}
                        >
                            🗑️ Sepeti Temizle
                        </Button>
                    </Flex>

                    <VStack spacing={4} align="stretch">
                        {cartItems.map((item, index) => (
                            <Box
                                key={item.id || item.productId || index}
                                bg="white"
                                borderRadius="xl"
                                boxShadow="sm"
                                p={4}
                            >
                                <Flex gap={4} align="center" flexWrap={{ base: 'wrap', md: 'nowrap' }}>

                                    {/* Ürün resmi */}
                                    <Box
                                        w="80px"
                                        h="80px"
                                        bg="gray.50"
                                        borderRadius="md"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                        fontSize="30px"
                                    >
                                        🛍️
                                    </Box>

                                    {/* Ürün bilgileri */}
                                    <Box flex={1}>
                                        <Text fontWeight="bold" fontSize="md" mb={1}>
                                            {item.productName || `Ürün #${item.productId}`}
                                        </Text>
                                        <Text fontSize="lg" fontWeight="bold" color="red.500">
                                            {(item.productPrice || 0).toLocaleString('tr-TR')} ₺
                                        </Text>
                                    </Box>

                                    {/* Adet kontrolü */}
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateQuantity(
                                                item.id || item.productId,
                                                item.quantity - 1
                                            )}
                                            isDisabled={item.quantity <= 1}
                                            w="32px"
                                            h="32px"
                                            p={0}
                                        >
                                            −
                                        </Button>
                                        <Text
                                            fontWeight="bold"
                                            minW="30px"
                                            textAlign="center"
                                        >
                                            {item.quantity}
                                        </Text>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateQuantity(
                                                item.id || item.productId,
                                                item.quantity + 1
                                            )}
                                            w="32px"
                                            h="32px"
                                            p={0}
                                        >
                                            +
                                        </Button>
                                    </HStack>

                                    {/* Satır toplam */}
                                    <Text
                                        fontWeight="bold"
                                        fontSize="md"
                                        minW="80px"
                                        textAlign="right"
                                    >
                                        {((item.productPrice || 0) * item.quantity).toLocaleString('tr-TR')} ₺
                                    </Text>

                                    {/* Sil butonu */}
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(item.id || item.productId)}
                                        p={1}
                                    >
                                        🗑️
                                    </Button>
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                </Box>

                {/* Sağ — Sipariş özeti */}
                <Box
                    w={{ base: '100%', lg: '320px' }}
                    flexShrink={0}
                >
                    <Box
                        bg="white"
                        borderRadius="xl"
                        boxShadow="sm"
                        p={6}
                        position="sticky"
                        top="80px"
                    >
                        <Heading size="md" mb={4}>Sipariş Özeti</Heading>

                        <VStack spacing={3} align="stretch">

                            {/* Ara toplam */}
                            <Flex justify="space-between">
                                <Text color="gray.600">Ara Toplam</Text>
                                <Text fontWeight="medium">
                                    {subtotal?.toLocaleString('tr-TR')} ₺
                                </Text>
                            </Flex>

                            {/* İndirim */}
                            {totalDiscount > 0 && (
                                <Flex justify="space-between">
                                    <Text color="green.600">İndirim</Text>
                                    <Text fontWeight="medium" color="green.600">
                                        -{totalDiscount?.toLocaleString('tr-TR')} ₺
                                    </Text>
                                </Flex>
                            )}

                            {/* Kargo */}
                            <Flex justify="space-between">
                                <Text color="gray.600">Kargo</Text>
                                <Text fontWeight="medium" color="green.600">
                                    Ücretsiz
                                </Text>
                            </Flex>

                            <Divider />

                            {/* Genel toplam */}
                            <Flex justify="space-between">
                                <Text fontWeight="bold" fontSize="lg">Genel Toplam</Text>
                                <Text fontWeight="bold" fontSize="lg" color="red.500">
                                    {total?.toLocaleString('tr-TR')} ₺
                                </Text>
                            </Flex>
                        </VStack>

                        {/* Sipariş ver butonu */}
                        <Button
                            bg="#0d47a1"
                            color="white"
                            width="100%"
                            size="lg"
                            mt={6}
                            _hover={{ bg: '#1565c0' }}
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    navigate('/checkout');
                                }
                            }}
                        >
                            {user ? 'Siparişi Tamamla →' : 'Giriş Yap ve Devam Et →'}
                        </Button>

                        {/* Alışverişe devam et */}
                        <Button
                            as={RouterLink}
                            to="/products"
                            variant="outline"
                            width="100%"
                            size="md"
                            mt={3}
                        >
                            Alışverişe Devam Et
                        </Button>

                        {/* Güvenli ödeme notu */}
                        <Text
                            textAlign="center"
                            fontSize="xs"
                            color="gray.500"
                            mt={4}
                        >
                            🔒 Güvenli ödeme altyapısı
                        </Text>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
}

export default Cart;