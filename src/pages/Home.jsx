import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Grid, Heading, Text,
    Button, Skeleton
} from '@chakra-ui/react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

const categoryIcons = {
    'Elektronik': '📱',
    'Giyim': '👕',
    'Kitap': '📚',
    'Spor': '⚽',
    'Ev & Yaşam': '🏠',
    'Kozmetik': '💄',
    'Oyuncak': '🧸',
    'Otomotiv': '🚗',
};

function Home() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/categories')
            .then(res => {
                setCategories(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    return (
        <Box>
            {/* Hero Banner */}
            <Box
                bg="#0d47a1"
                color="white"
                py={16}
                px={8}
                textAlign="center"
                borderRadius="lg"
                mb={10}
            >
                <Heading size="2xl" mb={4}>E-Ticaret'e Hoşgeldiniz</Heading>
                <Text fontSize="lg" mb={6}>
                    En iyi ürünleri en uygun fiyatlarla keşfedin.
                </Text>
                <Button
                    as={RouterLink}
                    to="/products"
                    size="lg"
                    bg="white"
                    color="#0d47a1"
                    _hover={{ bg: 'gray.100' }}
                >
                    Tüm Ürünleri Gör
                </Button>
            </Box>

            {/* Kategoriler */}
            <Heading size="lg" mb={6}>Kategoriler</Heading>

            {loading ? (
                <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4} mb={12}>
                    {[...Array(6)].map((_, i) => (
                        <Box key={i} bg="white" borderRadius="xl" p={5} textAlign="center">
                            <Skeleton height="50px" width="50px" mx="auto" mb={3} borderRadius="full" />
                            <Skeleton height="16px" width="80px" mx="auto" />
                        </Box>
                    ))}
                </Grid>
            ) : categories.length === 0 ? (
                <EmptyState
                    icon="📦"
                    title="Kategori bulunamadı"
                    description="Henüz kategori eklenmemiş."
                />
            ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4} mb={12}>
                    {categories.map(category => (
                        <Box
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            cursor="pointer"
                            bg="white"
                            borderRadius="xl"
                            boxShadow="sm"
                            p={5}
                            textAlign="center"
                            border="2px solid transparent"
                            transition="all 0.2s"
                            _hover={{
                                boxShadow: 'md',
                                border: '2px solid #0d47a1',
                                transform: 'translateY(-3px)'
                            }}
                        >
                            <Text fontSize="40px" mb={2}>
                                {categoryIcons[category.name] || '🏷️'}
                            </Text>
                            <Text fontWeight="semibold" fontSize="sm" color="#1a1a2e">
                                {category.name}
                            </Text>
                        </Box>
                    ))}
                </Grid>
            )}

            {/* Öne Çıkan Ürünler */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="lg">Öne Çıkan Ürünler</Heading>
                <Button
                    as={RouterLink}
                    to="/products"
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                >
                    Tümünü Gör →
                </Button>
            </Box>
        </Box>
    );
}

export default Home;