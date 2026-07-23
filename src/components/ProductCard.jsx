import {
    Box, Text, Badge, Button, HStack,
    VStack, Image, Tooltip
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../services/toastHelper';
import { useFavorite } from '../context/FavoriteContext';

function ProductCard({ product }) {

    const { addToCart } = useCart();
    const { user } = useAuth();
    const { isFavorite, addFavorite, removeFavorite } = useFavorite();
    const navigate = useNavigate();
    const toast = useToast();

    const discountedPrice = product.discount > 0
        ? product.price - (product.price * product.discount / 100)
        : null;

    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle

        try {
            await addToCart(product.id, 1, product.name, product.price);
            showToast(toast, {
                title: 'Sepete Eklendi',
                description: `${product.name} sepetinize eklendi.`,
                status: 'success'
            });
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Sepete eklenemedi.',
                status: 'error'
            });
        }
    };

    const handleFavorite = async (e) => {
        e.stopPropagation(); // Kart tıklamasını engelle
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            if (isFavorite(product.id)) {
                await removeFavorite(product.id);
                showToast(toast, { title: 'Favorilerden çıkarıldı', status: 'info' });
            } else {
                await addFavorite(product.id);
                showToast(toast, { title: 'Favorilere eklendi', status: 'success' });
            }
        } catch (err) {
            showToast(toast, { title: 'Hata', status: 'error' });
        }
    };

    return (
        <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-3px)' }}
            display="flex"
            flexDirection="column"
            h="100%"
            position="relative"
            role="group"
            cursor="pointer"
            onClick={() => navigate(`/products/${product.id}`)}
        >
            {/* Ürün Resmi */}
            <Box
                position="relative"
                bg="gray.50"
                h="200px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderBottom="1px solid"
                borderColor="gray.100"
                overflow="hidden"
            >
                {(() => {
                    const imageSrc = product.image?.startsWith('http')
                        ? product.image
                        : product.image?.startsWith('/images')
                            ? `http://localhost:8080${product.image}`
                            : null;

                    return imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={product.name}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                            fallback={<Text fontSize="60px">🛍️</Text>}
                        />
                    ) : (
                        <Text fontSize="60px">🛍️</Text>
                    );
                })()}

                {/* İndirim rozeti — sol üst */}
                {product.discount > 0 && (
                    <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        bg="red.500"
                        color="white"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontWeight="bold"
                    >
                        %{product.discount} İNDİRİM
                    </Badge>
                )}

                {/* Favori butonu — sağ üst */}
                <Box
                    position="absolute"
                    top={2}
                    right={2}
                    zIndex={1}
                    onClick={handleFavorite}
                    cursor="pointer"
                    bg="white"
                    borderRadius="full"
                    w="32px"
                    h="32px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="md"
                    opacity={isFavorite(product.id) ? 1 : 0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                >
                    <Text fontSize="16px">
                        {isFavorite(product.id) ? '❤️' : '🤍'}
                    </Text>
                </Box>

                {/* Stokta yok overlay */}
                {product.stock === 0 && (
                    <Box
                        position="absolute"
                        top={0} left={0} right={0} bottom={0}
                        bg="blackAlpha.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            color="white"
                            fontWeight="bold"
                            fontSize="lg"
                            bg="blackAlpha.700"
                            px={3} py={1}
                            borderRadius="md"
                        >
                            Stokta Yok
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Ürün Bilgileri */}
            <VStack p={4} align="start" spacing={2} flex={1}>

                {/* Kategori */}
                {product.category && (
                    <Badge colorScheme="blue" fontSize="xs">
                        {product.category.name}
                    </Badge>
                )}

                {/* Ürün Adı */}
                <Tooltip label={product.name} hasArrow placement="top">
                    <Text
                        fontWeight="bold"
                        fontSize="md"
                        noOfLines={2}
                        color="gray.800"
                        lineHeight="tight"
                    >
                        {product.name}
                    </Text>
                </Tooltip>

                {/* Fiyat */}
                <Box mt="auto" width="100%">
                    {discountedPrice ? (
                        <VStack align="start" spacing={0}>
                            <Text
                                fontSize="sm"
                                color="gray.400"
                                textDecoration="line-through"
                            >
                                {product.price?.toLocaleString('tr-TR')} ₺
                            </Text>
                            <HStack spacing={2} align="center">
                                <Text fontSize="xl" fontWeight="bold" color="red.500">
                                    {discountedPrice.toLocaleString('tr-TR', {
                                        maximumFractionDigits: 2
                                    })} ₺
                                </Text>
                            </HStack>
                        </VStack>
                    ) : (
                        <Text fontSize="xl" fontWeight="bold" color="red.500">
                            {product.price?.toLocaleString('tr-TR')} ₺
                        </Text>
                    )}
                </Box>

                {/* Stok durumu */}
                <HStack spacing={1}>
                    <Box
                        w={2} h={2}
                        borderRadius="full"
                        bg={
                            product.stock > 5 ? 'green.400'
                                : product.stock > 0 ? 'orange.400'
                                    : 'red.400'
                        }
                    />
                    <Text
                        fontSize="xs"
                        color={
                            product.stock > 5 ? 'green.600'
                                : product.stock > 0 ? 'orange.600'
                                    : 'red.600'
                        }
                    >
                        {product.stock > 5
                            ? `Stokta var (${product.stock})`
                            : product.stock > 0
                                ? `Son ${product.stock} ürün!`
                                : 'Stokta yok'}
                    </Text>
                </HStack>

                {/* Sepete Ekle Butonu */}
                <Button
                    bg={product.stock > 0 ? '#0d47a1' : 'gray.300'}
                    color="white"
                    width="100%"
                    size="sm"
                    isDisabled={product.stock === 0}
                    onClick={handleAddToCart}
                    mt={2}
                    _hover={{ bg: product.stock > 0 ? '#1565c0' : 'gray.300' }}
                >
                    {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                </Button>
            </VStack>
        </Box>
    );
}

export default ProductCard;