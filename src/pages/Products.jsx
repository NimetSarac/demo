import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Grid, Heading, Text, Button, Input,
    Select, Badge, HStack, VStack, Flex,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';
import api from '../services/api';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';

function Products() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 6;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';

    useEffect(() => {
        api.get('/api/categories')
            .then(res => {
                setCategories(res.data.data || []);
                if (selectedCategory) {
                    const cat = (res.data.data || []).find(
                        c => c.id.toString() === selectedCategory
                    );
                    if (cat) setSelectedCategoryName(cat.name);
                    else setSelectedCategoryName('');
                } else {
                    setSelectedCategoryName('');
                }
            })
            .catch(err => console.error(err));
    }, [selectedCategory]);

    useEffect(() => {
        setLoading(true);

        if (searchKeyword) {
            api.get(`/api/products/search?keyword=${searchKeyword}`)
                .then(res => {
                    setProducts(res.data.data || []);
                    setTotalPages(1);
                    setTotalElements((res.data.data || []).length);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

        } else if (selectedCategory) {
            api.get(`/api/products/category/${selectedCategory}`)
                .then(res => {
                    setProducts(res.data.data || []);
                    setTotalPages(1);
                    setTotalElements((res.data.data || []).length);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

        } else {
            api.get(`/api/products/paged?page=${currentPage}&size=${pageSize}&sort=id,desc`)
                .then(res => {
                    setProducts(res.data.data?.content || []);
                    setTotalPages(res.data.data?.totalPages || 0);
                    setTotalElements(res.data.data?.totalElements || 0);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }

    }, [currentPage, selectedCategory, searchKeyword]);

    const handleCategoryChange = (categoryId) => {
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
        setCurrentPage(0);
        setSearchKeyword('');
    };

    const handleAddToCart = (product) => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { navigate('/login'); return; }
        const user = JSON.parse(storedUser);
        api.post(`/api/cart/${user.id}/items?productId=${product.id}&quantity=1`)
            .then(() => alert(`${product.name} sepete eklendi!`))
            .catch(err => alert('Hata: ' + err.response?.data?.message));
    };

    return (
        <Box>
            {/* Breadcrumb */}
            <Breadcrumb mb={4} fontSize="sm" color="gray.500">
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/">Ana Sayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/products">Ürünler</BreadcrumbLink>
                </BreadcrumbItem>
                {selectedCategoryName && (
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{selectedCategoryName}</BreadcrumbLink>
                    </BreadcrumbItem>
                )}
            </Breadcrumb>

            {/* Başlık */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg">
                    {selectedCategoryName || 'Tüm Ürünler'}
                    <Text as="span" fontSize="md" fontWeight="normal" color="gray.500" ml={2}>
                        ({totalElements} ürün)
                    </Text>
                </Heading>
            </Flex>

            {/* Filtreler */}
            <HStack mb={6} spacing={4} flexWrap="wrap">
                <Input
                    placeholder="Ürün ara..."
                    value={searchKeyword}
                    onChange={e => {
                        setSearchKeyword(e.target.value);
                        setCurrentPage(0);
                    }}
                    maxW="200px"
                    bg="white"
                />
                <Select
                    value={selectedCategory}
                    onChange={e => handleCategoryChange(e.target.value)}
                    maxW="200px"
                    bg="white"
                >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </Select>
                {(searchKeyword || selectedCategory) && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setSearchKeyword('');
                            setSearchParams({});
                            setCurrentPage(0);
                        }}
                    >
                        ✕ Filtreleri Temizle
                    </Button>
                )}
            </HStack>

            {/* Ürün Grid */}
            {loading ? (
                <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={6}>
                    {[...Array(6)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </Grid>

            ) : products.length === 0 ? (
                <EmptyState
                    icon={searchKeyword ? '🔍' : selectedCategory ? '📦' : '🛍️'}
                    title={
                        searchKeyword
                            ? `"${searchKeyword}" için sonuç bulunamadı`
                            : selectedCategory
                            ? 'Bu kategoride ürün bulunamadı'
                            : 'Henüz ürün eklenmemiş'
                    }
                    description={
                        searchKeyword
                            ? 'Farklı bir arama terimi deneyin veya filtreleri temizleyin.'
                            : 'Daha sonra tekrar kontrol edin.'
                    }
                    buttonText={searchKeyword || selectedCategory ? 'Tüm Ürünlere Dön' : null}
                    onButtonClick={() => {
                        setSearchKeyword('');
                        setSearchParams({});
                        setCurrentPage(0);
                    }}
                />

            ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={6}>
                    {products.map(product => (
                        <Box
                            key={product.id}
                            bg="white"
                            borderRadius="xl"
                            boxShadow="sm"
                            overflow="hidden"
                            transition="all 0.2s"
                            _hover={{ boxShadow: 'lg', transform: 'translateY(-3px)' }}
                        >
                            <Box
                                bg="gray.50"
                                h="180px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="60px"
                                borderBottom="1px solid"
                                borderColor="gray.100"
                            >
                                🛍️
                            </Box>

                            <VStack p={4} align="start" spacing={2}>
                                {product.category && (
                                    <Badge
                                        colorScheme="blue"
                                        cursor="pointer"
                                        onClick={() => handleCategoryChange(product.category.id)}
                                    >
                                        {product.category.name}
                                    </Badge>
                                )}

                                <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                    {product.name}
                                </Text>

                                <HStack>
                                    <Text fontSize="xl" fontWeight="bold" color="red.500">
                                        {product.price?.toLocaleString('tr-TR')} ₺
                                    </Text>
                                    {product.discount > 0 && (
                                        <Badge colorScheme="green">
                                            %{product.discount} indirim
                                        </Badge>
                                    )}
                                </HStack>

                                <Text fontSize="xs" color={product.stock > 0 ? 'green.500' : 'red.500'}>
                                    {product.stock > 0
                                        ? `✓ Stokta var (${product.stock})`
                                        : '✗ Stokta yok'}
                                </Text>

                                <Button
                                    colorScheme="blue"
                                    width="100%"
                                    size="sm"
                                    isDisabled={product.stock === 0}
                                    onClick={() => handleAddToCart(product)}
                                    mt={1}
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
                <HStack justify="center" mt={10} spacing={2}>
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
                            bg={currentPage === i ? '#0d47a1' : 'white'}
                            color={currentPage === i ? 'white' : 'black'}
                            border="1px solid"
                            borderColor="gray.200"
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