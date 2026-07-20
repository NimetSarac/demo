import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Grid, Heading, Text, Button, Input,
    Select, HStack, Flex,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';
import api from '../services/api';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import { useSearchHistory } from '../hooks/useSearchHistory';

function Products() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const pageSize = 6;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';
    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

    useEffect(() => {
        api.get('/api/categories')
            .then(res => {
                const cats = res.data.data || [];
                setCategories(cats);
                if (selectedCategory) {
                    const cat = cats.find(c => c.id === Number(selectedCategory));
                    setSelectedCategoryName(cat ? cat.name : '');
                } else {
                    setSelectedCategoryName('');
                }
            })
            .catch(err => console.error(err));
    }, [selectedCategory]);

    useEffect(() => {
        setLoading(true);

        if (minPrice || maxPrice) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : 999999;
            let url = `/api/products/filter?minPrice=${min}&maxPrice=${max}`;
            if (selectedCategory) url += `&categoryId=${Number(selectedCategory)}`;

            api.get(url)
                .then(res => {
                    const data = res.data.data || res.data || [];
                    setProducts(Array.isArray(data) ? data : []);
                    setTotalPages(1);
                    setTotalElements(Array.isArray(data) ? data.length : 0);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

        } else if (searchKeyword) {
            api.get(`/api/products/search?keyword=${searchKeyword}`)
                .then(res => {
                    const data = res.data.data || res.data || [];
                    setProducts(Array.isArray(data) ? data : []);
                    setTotalPages(1);
                    setTotalElements(Array.isArray(data) ? data.length : 0);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

        } else if (selectedCategory) {
            api.get(`/api/products/category/${Number(selectedCategory)}`)
                .then(res => {
                    const data = res.data.data || res.data || [];
                    setProducts(Array.isArray(data) ? data : []);
                    setTotalPages(1);
                    setTotalElements(Array.isArray(data) ? data.length : 0);
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

    }, [currentPage, selectedCategory, searchKeyword, minPrice, maxPrice]);

    useEffect(() => {
        if (searchKeyword.length >= 1) {
            const matched = products
                .filter(p => p.name?.toLowerCase().includes(searchKeyword.toLowerCase()))
                .map(p => p.name)
                .slice(0, 5);
            setSuggestions(matched);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(history.length > 0);
        }
    }, [searchKeyword, products, history]);

    const handleCategoryChange = (categoryId) => {
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
        setCurrentPage(0);
        setSearchKeyword('');
        setMinPrice('');
        setMaxPrice('');
    };

    const handleSearchSelect = (keyword) => {
        setSearchKeyword(keyword);
        addToHistory(keyword);
        setShowSuggestions(false);
        setCurrentPage(0);
    };

    const handleSearchSubmit = () => {
        if (searchKeyword.trim()) {
            addToHistory(searchKeyword);
            setShowSuggestions(false);
        }
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
            <HStack mb={6} spacing={4} flexWrap="wrap" align="flex-start">

                {/* Arama */}
                <Box position="relative">
                    <Input
                        placeholder="Ürün ara..."
                        value={searchKeyword}
                        onChange={e => {
                            setSearchKeyword(e.target.value);
                            setCurrentPage(0);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                        w="250px"
                        bg="white"
                    />

                    {/* Dropdown */}
                    {showSuggestions && (history.length > 0 || suggestions.length > 0) && (
                        <Box
                            position="absolute"
                            top="40px"
                            left={0}
                            bg="white"
                            borderRadius="md"
                            boxShadow="lg"
                            zIndex={999}
                            border="1px solid"
                            borderColor="gray.200"
                            w="250px"
                        >
                            {/* Geçmiş */}
                            {searchKeyword === '' && history.length > 0 && (
                                <Box>
                                    <Flex justify="space-between" align="center" px={3} py={2}>
                                        <Text fontSize="xs" color="gray.500" fontWeight="bold">
                                            SON ARAMALAR
                                        </Text>
                                        <Button size="xs" variant="ghost" color="gray.400" onClick={clearHistory}>
                                            Temizle
                                        </Button>
                                    </Flex>
                                    {history.map((keyword, index) => (
                                        <Flex
                                            key={index}
                                            px={3} py={2}
                                            cursor="pointer"
                                            align="center"
                                            justify="space-between"
                                            _hover={{ bg: 'gray.50' }}
                                            onClick={() => handleSearchSelect(keyword)}
                                        >
                                            <HStack>
                                                <Text fontSize="sm" color="gray.500">🕐</Text>
                                                <Text fontSize="sm">{keyword}</Text>
                                            </HStack>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                color="gray.300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(keyword);
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        </Flex>
                                    ))}
                                </Box>
                            )}

                            {/* Öneriler */}
                            {searchKeyword !== '' && suggestions.length > 0 && (
                                <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="bold" px={3} py={2}>
                                        ÖNERİLER
                                    </Text>
                                    {suggestions.map((suggestion, index) => (
                                        <Flex
                                            key={index}
                                            px={3} py={2}
                                            cursor="pointer"
                                            _hover={{ bg: 'gray.50' }}
                                            onClick={() => handleSearchSelect(suggestion)}
                                        >
                                            <HStack>
                                                <Text fontSize="sm" color="gray.400">🔍</Text>
                                                <Text fontSize="sm">{suggestion}</Text>
                                            </HStack>
                                        </Flex>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Kategori */}
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

                {/* Fiyat filtresi */}
                <HStack spacing={2}>
                    <Input
                        placeholder="Min ₺"
                        value={minPrice}
                        onChange={e => { setMinPrice(e.target.value); setCurrentPage(0); }}
                        w="100px"
                        bg="white"
                        type="number"
                        min={0}
                    />
                    <Text color="gray.500">—</Text>
                    <Input
                        placeholder="Max ₺"
                        value={maxPrice}
                        onChange={e => { setMaxPrice(e.target.value); setCurrentPage(0); }}
                        w="100px"
                        bg="white"
                        type="number"
                        min={0}
                    />
                </HStack>

                {/* Temizle */}
                {(searchKeyword || selectedCategory || minPrice || maxPrice) && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setSearchKeyword('');
                            setSearchParams({});
                            setMinPrice('');
                            setMaxPrice('');
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
                    icon={searchKeyword ? '🔍' : selectedCategory ? '📦' : minPrice || maxPrice ? '💰' : '🛍️'}
                    title={
                        searchKeyword
                            ? `"${searchKeyword}" için sonuç bulunamadı`
                            : selectedCategory
                            ? 'Bu kategoride ürün bulunamadı'
                            : minPrice || maxPrice
                            ? 'Bu fiyat aralığında ürün bulunamadı'
                            : 'Henüz ürün eklenmemiş'
                    }
                    description="Farklı filtreler deneyin."
                    buttonText={searchKeyword || selectedCategory || minPrice || maxPrice ? 'Filtreleri Temizle' : null}
                    onButtonClick={() => {
                        setSearchKeyword('');
                        setSearchParams({});
                        setMinPrice('');
                        setMaxPrice('');
                        setCurrentPage(0);
                    }}
                />

            ) : (
                <Grid
                    templateColumns={{
                        base: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    }}
                    gap={6}
                >
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchKeyword && !selectedCategory && !minPrice && !maxPrice && (
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