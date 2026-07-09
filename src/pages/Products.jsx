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
import ProductCard from '../components/ProductCard';

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
                <Grid
                    templateColumns={{
                        base: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    }}
                    gap={6}
                >
                    {[...Array(8)].map((_, i) => (
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
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
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