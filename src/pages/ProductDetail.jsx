import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Grid, Heading, Text, Button, Badge,
    HStack, VStack, Image, Divider, Breadcrumb,
    BreadcrumbItem, BreadcrumbLink, Spinner, Center,
    Input, Flex
} from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import { useFavorite } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@chakra-ui/react';
import { showToast } from '../services/toastHelper';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import ShareProduct from '../components/ShareProduct';

function ProductDetail() {

    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isFavorite, addFavorite, removeFavorite } = useFavorite();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [productImages, setProductImages] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        const imgRes = await api.get(`/api/products/${id}/images`);
        setProductImages(imgRes.data.data || []);
        try {
            const res = await api.get(`/api/products/${id}`);
            const productData = res.data.data || res.data;
            setProduct(productData);

            // Benzer ürünleri çek (aynı kategori)
            if (productData?.category?.id) {
                const similarRes = await api.get(
                    `/api/products/category/${productData.category.id}`
                );
                const similar = (similarRes.data.data || similarRes.data || [])
                    .filter(p => p.id !== productData.id)
                    .slice(0, 4);
                setSimilarProducts(similar);
            }
            const reviewRes = await api.get(`/api/reviews/product/${id}`);
            setReviews(reviewRes.data.data || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity, product.name, product.price);
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
        } finally {
            setAddingToCart(false);
        }
    };

    const handleFavorite = async () => {
        if (!user) { navigate('/login'); return; }
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
    const handleAddReview = async () => {
        if (!user) { navigate('/login'); return; }
        if (!reviewForm.comment.trim()) {
            showToast(toast, { title: 'Hata', description: 'Yorum yazınız.', status: 'error' });
            return;
        }
        setReviewLoading(true);
        try {
            await api.post(
                `/api/reviews?userId=${user.id}&productId=${id}&rating=${reviewForm.rating}&comment=${reviewForm.comment}`
            );
            showToast(toast, { title: 'Yorum eklendi', status: 'success' });
            setReviewForm({ rating: 5, comment: '' });
            // Yorumları yenile
            const res = await api.get(`/api/reviews/product/${id}`);
            setReviews(res.data.data || []);
        } catch (err) {
            showToast(toast, { title: 'Hata', description: 'Yorum eklenemedi.', status: 'error' });
        } finally {
            setReviewLoading(false);
        }
    };

    const discountedPrice = product?.discount > 0
        ? product.price - (product.price * product.discount / 100)
        : null;

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    if (!product) return (
        <EmptyState
            icon="🔍"
            title="Ürün bulunamadı"
            description="Aradığınız ürün mevcut değil."
            buttonText="Ürünlere Dön"
            onButtonClick={() => navigate('/products')}
        />
    );

    return (
        <Box>
            {/* Breadcrumb */}
            <Breadcrumb mb={6} fontSize="sm" color="gray.500">
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/">Ana Sayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/products">Ürünler</BreadcrumbLink>
                </BreadcrumbItem>
                {product.category && (
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            as={RouterLink}
                            to={`/products?category=${product.category.id}`}
                        >
                            {product.category.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                )}
                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>{product.name}</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            {/* Ürün Detay */}
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10} mb={12}>

                {/* Sol — Büyük Görsel */}
                <Box>
                    {/* Ana resim */}
                    <Box
                        bg="white"
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="md"
                        h="400px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        mb={3}
                    >
                        {productImages.length > 0 ? (
                            <Image
                                src={`http://localhost:8080${productImages[activeImage]?.imageUrl}`}
                                alt={product.name}
                                objectFit="contain"
                                maxH="380px"
                                maxW="100%"
                            />
                        ) : product.image && product.image.startsWith('http') ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                objectFit="contain"
                                maxH="380px"
                                maxW="100%"
                            />
                        ) : (
                            <Text fontSize="100px">🛍️</Text>
                        )}

                        {/* İndirim rozeti */}
                        {product.discount > 0 && (
                            <Badge
                                position="absolute"
                                top={4} left={4}
                                bg="red.500"
                                color="white"
                                fontSize="md"
                                px={3} py={1}
                                borderRadius="md"
                            >
                                %{product.discount} İNDİRİM
                            </Badge>
                        )}

                        {/* Ok butonları */}
                        {productImages.length > 1 && (
                            <>
                                <Button
                                    position="absolute"
                                    left={2}
                                    size="sm"
                                    borderRadius="full"
                                    bg="whiteAlpha.800"
                                    onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                                    isDisabled={activeImage === 0}
                                >
                                    ←
                                </Button>
                                <Button
                                    position="absolute"
                                    right={2}
                                    size="sm"
                                    borderRadius="full"
                                    bg="whiteAlpha.800"
                                    onClick={() => setActiveImage(i => Math.min(productImages.length - 1, i + 1))}
                                    isDisabled={activeImage === productImages.length - 1}
                                >
                                    →
                                </Button>
                            </>
                        )}
                    </Box>

                    {/* Küçük resimler */}
                    {productImages.length > 1 && (
                        <HStack spacing={2} justify="center">
                            {productImages.map((img, i) => (
                                <Box
                                    key={img.id}
                                    w="60px"
                                    h="60px"
                                    borderRadius="md"
                                    overflow="hidden"
                                    cursor="pointer"
                                    border="2px solid"
                                    borderColor={activeImage === i ? '#0d47a1' : 'transparent'}
                                    onClick={() => setActiveImage(i)}
                                    transition="border-color 0.2s"
                                >
                                    <Image
                                        src={`http://localhost:8080${img.imageUrl}`}
                                        alt=""
                                        objectFit="cover"
                                        w="100%"
                                        h="100%"
                                    />
                                </Box>
                            ))}
                        </HStack>
                    )}
                </Box>


                {/* Sağ — Ürün Bilgileri */}
                <VStack align="start" spacing={4}>

                    {/* Kategori */}
                    {product.category && (
                        <Badge colorScheme="blue" fontSize="sm">
                            {product.category.name}
                        </Badge>
                    )}

                    {/* Ürün adı */}
                    <Heading size="xl">{product.name}</Heading>

                    {/* Fiyat */}
                    <Box>
                        {discountedPrice ? (
                            <VStack align="start" spacing={0}>
                                <Text
                                    fontSize="lg"
                                    color="gray.400"
                                    textDecoration="line-through"
                                >
                                    {product.price?.toLocaleString('tr-TR')} ₺
                                </Text>
                                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                                    {discountedPrice.toLocaleString('tr-TR', {
                                        maximumFractionDigits: 2
                                    })} ₺
                                </Text>
                            </VStack>
                        ) : (
                            <Text fontSize="3xl" fontWeight="bold" color="red.500">
                                {product.price?.toLocaleString('tr-TR')} ₺
                            </Text>
                        )}
                    </Box>

                    {/* Stok durumu */}
                    <HStack>
                        <Box
                            w={3} h={3}
                            borderRadius="full"
                            bg={product.stock > 5 ? 'green.400' : product.stock > 0 ? 'orange.400' : 'red.400'}
                        />
                        <Text
                            color={product.stock > 5 ? 'green.600' : product.stock > 0 ? 'orange.600' : 'red.600'}
                            fontWeight="medium"
                        >
                            {product.stock > 5
                                ? `Stokta var (${product.stock} adet)`
                                : product.stock > 0
                                    ? `Son ${product.stock} ürün!`
                                    : 'Stokta yok'}
                        </Text>
                    </HStack>

                    <Divider />

                    {/* Açıklama */}
                    {product.description && (
                        <Box>
                            <Text fontWeight="bold" mb={2}>Ürün Açıklaması</Text>
                            <Text color="gray.600" lineHeight="tall">
                                {product.description}
                            </Text>
                        </Box>
                    )}

                    <Divider />

                    {/* Adet seçimi */}
                    {product.stock > 0 && (
                        <HStack>
                            <Text fontWeight="medium">Adet:</Text>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                isDisabled={quantity <= 1}
                            >
                                −
                            </Button>
                            <Text fontWeight="bold" minW="30px" textAlign="center">
                                {quantity}
                            </Text>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                isDisabled={quantity >= product.stock}
                            >
                                +
                            </Button>
                        </HStack>
                    )}

                    {/* Butonlar */}
                    <HStack spacing={3} width="100%">
                        <Button
                            bg="#0d47a1"
                            color="white"
                            size="lg"
                            flex={1}
                            isDisabled={product.stock === 0}
                            isLoading={addingToCart}
                            loadingText="Ekleniyor..."
                            onClick={handleAddToCart}
                            _hover={{ bg: '#1565c0' }}
                        >
                            🛒 Sepete Ekle
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleFavorite}
                            colorScheme={isFavorite(product.id) ? 'red' : 'gray'}
                        >
                            {isFavorite(product.id) ? '❤️' : '🤍'}
                        </Button>
                         <ShareProduct product={product} />
                    </HStack>

                    {/* Hızlı satın al */}
                    {product.stock > 0 && (
                        <Button
                            width="100%"
                            size="lg"
                            variant="outline"
                            colorScheme="blue"
                            onClick={async () => {
                                await handleAddToCart();
                                navigate('/cart');
                            }}
                        >
                            ⚡ Hızlı Satın Al
                        </Button>
                    )}
                </VStack>
            </Grid>
            {/* Yorumlar */}
            <Box mb={12}>
                <Heading size="lg" mb={6}>
                    Yorumlar ({reviews.length})
                </Heading>

                {/* Yorum yaz */}
                {user ? (
                    <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mb={6}>
                        <Heading size="sm" mb={4}>Yorum Yaz</Heading>

                        {/* Yıldız seçimi */}
                        <HStack mb={3}>
                            <Text fontWeight="medium" fontSize="sm">Puan:</Text>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Text
                                    key={star}
                                    fontSize="24px"
                                    cursor="pointer"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    opacity={star <= reviewForm.rating ? 1 : 0.3}
                                >
                                    ⭐
                                </Text>
                            ))}
                            <Text fontSize="sm" color="gray.500">
                                {reviewForm.rating}/5
                            </Text>
                        </HStack>

                        {/* Yorum kutusu */}
                        <Box mb={3}>
                            <Input
                                placeholder="Ürün hakkında yorumunuzu yazın..."
                                value={reviewForm.comment}
                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            />
                        </Box>

                        <Button
                            bg="#0d47a1"
                            color="white"
                            _hover={{ bg: '#1565c0' }}
                            onClick={handleAddReview}
                            isLoading={reviewLoading}
                            loadingText="Gönderiliyor..."
                        >
                            Yorum Gönder
                        </Button>
                    </Box>
                ) : (
                    <Box bg="blue.50" borderRadius="xl" p={4} mb={6} border="1px solid" borderColor="blue.200">
                        <Text color="blue.700">
                            Yorum yapmak için{' '}
                            <Button
                                variant="link"
                                color="blue.600"
                                onClick={() => navigate('/login')}
                            >
                                giriş yapın
                            </Button>
                        </Text>
                    </Box>
                )}

                {/* Yorum listesi */}
                {reviews.length === 0 ? (
                    <Box textAlign="center" py={8} color="gray.500">
                        <Text fontSize="40px" mb={2}>💬</Text>
                        <Text>Henüz yorum yapılmamış. İlk yorumu siz yapın!</Text>
                    </Box>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {reviews.map(review => (
                            <Box
                                key={review.id}
                                bg="white"
                                borderRadius="xl"
                                boxShadow="sm"
                                p={5}
                            >
                                <Flex justify="space-between" align="center" mb={2}>
                                    <HStack>
                                        <Text fontWeight="bold">{review.user?.username}</Text>
                                        <HStack spacing={0}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Text
                                                    key={star}
                                                    fontSize="14px"
                                                    opacity={star <= review.rating ? 1 : 0.3}
                                                >
                                                    ⭐
                                                </Text>
                                            ))}
                                        </HStack>
                                        <Badge colorScheme="yellow">{review.rating}/5</Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.400">
                                        {review.createdAt
                                            ? new Date(review.createdAt).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Text>
                                </Flex>
                                <Text color="gray.600">{review.comment}</Text>

                                {/* Admin veya yorum sahibi silebilir */}
                                {user && (user.role === 'ADMIN' || user.id === review.user?.id) && (
                                    <Button
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        mt={2}
                                        onClick={async () => {
                                            await api.delete(`/api/reviews/${review.id}`);
                                            const res = await api.get(`/api/reviews/product/${id}`);
                                            setReviews(res.data.data || []);
                                        }}
                                    >
                                        🗑️ Sil
                                    </Button>
                                )}
                            </Box>
                        ))}
                    </VStack>
                )}
            </Box>

            {/* Benzer Ürünler */}
            {similarProducts.length > 0 && (
                <Box>
                    <Heading size="lg" mb={6}>Benzer Ürünler</Heading>
                    <Grid
                        templateColumns={{
                            base: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        }}
                        gap={6}
                    >
                        {similarProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default ProductDetail;