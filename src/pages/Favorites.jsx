import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Heading, Grid, Text, Button
} from '@chakra-ui/react';
import { useFavorite } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

function Favorites() {

    const { favorites } = useFavorite();
    const navigate = useNavigate();

    return (
        <Box>
            <Heading size="lg" mb={6}>
                Favori Ürünlerim ❤️
            </Heading>

            {favorites.length === 0 ? (
                <EmptyState
                    icon="🤍"
                    title="Henüz favori ürününüz yok"
                    description="Beğendiğiniz ürünleri favorilere ekleyin."
                    buttonText="Ürünlere Git"
                    onButtonClick={() => navigate('/products')}
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
                    {favorites.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default Favorites;