import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Grid, Heading, Text, Button, Input,
    Select, Badge, HStack, VStack, Flex,
    Alert, AlertIcon
} from '@chakra-ui/react';
import api from '../services/api';

function Products() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 6;
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/categories')
            .then(res => setCategories(res.data.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        setLoading(true);

        if (searchKeyword) {
            api.get(`/api/products/search?keyword=${searchKeyword}`)
                .then(res => {
                    setProducts(res.data.data);
                    setTotalPages(1);
                    setTotalElements(res.data.data.length);
                    setLoading(false);
                })
                .catch(() => { setError('Ürünler yüklenemedi'); setLoading(false); });

        } else if (selectedCategory) {
            api.get(`/api/products/category/${selectedCategory}`)
                .then(res => {
                    setProducts(res.data.data);
                    setTotalPages(1);
                    setTotalElements(res.data.data.length);
                    setLoading(false);
                })
                .catch(() => { setError('Ürünler yüklenemedi'); setLoading(false); });

        } else {
            api.get(`/api/products/paged?page=${currentPage}&size=${pageSize}&sort=id,desc`)
                .then(res => {
                    setProducts(res.data.data.content);
                    setTotalPages(res.data.data.totalPages);
                    setTotalElements(res.data.data.totalElements);
                    setLoading(false);
                })
                .catch(() => { setError('Ürünler yüklenemedi'); setLoading(false); });
        }

    }, [currentPage, selectedCategory, searchKeyword]);

    const handleAddToCart = (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { navigate('/login'); return; }

        api.post(`/api/cart/${user.id}/items?productId=${product.id}&quantity=1`)
            .then(() => alert(`${product.name} sepete eklendi!`))
            .catch(err => alert('Hata: ' + err.response?.data?.message));
    };

    if (loading) return <Text p={6}>Yükleniyor...</Text>;

    if (error) return (
        <Alert status="error" m={6}>
            <AlertIcon />
            {error}
        </Alert>
    );

    return (
        <Box>
            <Heading mb={4}>Ürünler ({totalElements})</Heading>

            {/* Filtreler */}
            <HStack mb={6} spacing={4} flexWrap="wrap">
                <Input
                    placeholder="Ürün ara..."
                    value={searchKeyword}
                    onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(0); }}
                    maxW="200px"
                />
                <Select
                    placeholder="Tüm Kategoriler"
                    value={selectedCategory}
                    onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(0); }}
                    maxW="200px"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </Select>
                {(searchKeyword || selectedCategory) && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSearchKeyword(''); setSelectedCategory(''); setCurrentPage(0); }}
                    >
                        Temizle
                    </Button>
                )}
            </HStack>

            {/* Ürün Grid */}
            {products.length === 0 ? (
                <Text>Ürün bulunamadı.</Text>
            ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                    {products.map(product => (
                        <Box
                            key={product.id}
                            bg="white"
                            borderRadius="lg"
                            boxShadow="md"
                            overflow="hidden"
                            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                        >
                            {/* Resim alanı */}
                            <Box
                                bg="gray.100"
                                h="160px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="50px"
                            >
                                🛍️
                            </Box>

                            <VStack p={4} align="start" spacing={2}>
                                {/* Kategori */}
                                {product.category && (
                                    <Badge colorScheme="blue">{product.category.name}</Badge>
                                )}

                                {/* İsim */}
                                <Text fontWeight="bold" fontSize="md">{product.name}</Text>

                                {/* Fiyat */}
                                <HStack>
                                    <Text fontSize="xl" fontWeight="bold" color="red.500">
                                        {product.price} ₺
                                    </Text>
                                    {product.discount > 0 && (
                                        <Badge colorScheme="green">%{product.discount} indirim</Badge>
                                    )}
                                </HStack>

                                {/* Stok */}
                                <Text fontSize="sm" color={product.stock > 0 ? 'green.500' : 'red.500'}>
                                    {product.stock > 0 ? `Stok: ${product.stock}` : 'Stokta yok'}
                                </Text>

                                {/* Sepete ekle */}
                                <Button
                                    colorScheme="blue"
                                    width="100%"
                                    size="sm"
                                    isDisabled={product.stock === 0}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                                </Button>
                            </VStack>
                        </Box>
                    ))}
                </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchKeyword && !selectedCategory && (
                <HStack justify="center" mt={8} spacing={2}>
                    <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => p - 1)}
                        isDisabled={currentPage === 0}
                    >
                        ← Önceki
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                        <Button
                            key={i}
                            size="sm"
                            colorScheme={currentPage === i ? 'blue' : 'gray'}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        isDisabled={currentPage === totalPages - 1}
                    >
                        Sonraki →
                    </Button>
                </HStack>
            )}
        </Box>
    );
}

export default Products;