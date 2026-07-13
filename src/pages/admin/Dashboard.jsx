import { Box, Grid, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

function Dashboard() {

    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0
    });

    useEffect(() => {
        Promise.all([
            api.get('/api/products'),
            api.get('/api/categories'),
            api.get('/api/users'),
        ]).then(([products, categories, users]) => {
            setStats({
                products: products.data.data?.length || 0,
                categories: categories.data.data?.length || 0,
                users: users.data.data?.length || 0,
                orders: 0
            });
        }).catch(err => console.error(err));
    }, []);

    const statCards = [
        { label: 'Toplam Ürün', value: stats.products, icon: '🛍️', color: 'blue.50' },
        { label: 'Kategori', value: stats.categories, icon: '📦', color: 'green.50' },
        { label: 'Kullanıcı', value: stats.users, icon: '👥', color: 'purple.50' },
        { label: 'Sipariş', value: stats.orders, icon: '📋', color: 'orange.50' },
    ];

    return (
        <Box>
            <Heading size="lg" mb={8}>Dashboard</Heading>

            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
                {statCards.map(card => (
                    <Box
                        key={card.label}
                        bg="white"
                        borderRadius="xl"
                        boxShadow="sm"
                        p={6}
                        borderTop="4px solid"
                        borderColor="blue.400"
                    >
                        <Stat>
                            <StatLabel color="gray.500" fontSize="sm">{card.label}</StatLabel>
                            <StatNumber fontSize="3xl" fontWeight="bold" mt={1}>
                                {card.value}
                            </StatNumber>
                            <StatHelpText fontSize="2xl">{card.icon}</StatHelpText>
                        </Stat>
                    </Box>
                ))}
            </Grid>
        </Box>
    );
}

export default Dashboard;