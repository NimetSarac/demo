import { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText, Spinner, Center } from '@chakra-ui/react';
import api from '../../services/api';

function Dashboard() {

    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        users: 0,
        orders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [productsRes, categoriesRes, usersRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories'),
                api.get('/api/users')
            ]);

            // Tüm kullanıcıların siparişlerini say
            const allUsers = usersRes.data.data || [];
            let totalOrders = 0;
            for (const user of allUsers) {
                try {
                    const orderRes = await api.get(`/api/orders/user/${user.id}`);
                    totalOrders += (orderRes.data.data || []).length;
                } catch (err) {}
            }

            setStats({
                products: (productsRes.data.data || []).length,
                categories: (categoriesRes.data.data || []).length,
                users: allUsers.length,
                orders: totalOrders
            });
        } catch (err) {
            console.error('Dashboard stats yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Toplam Ürün', value: stats.products, icon: '🛍️', color: 'blue.400' },
        { label: 'Kategori', value: stats.categories, icon: '📦', color: 'green.400' },
        { label: 'Kullanıcı', value: stats.users, icon: '👥', color: 'purple.400' },
        { label: 'Sipariş', value: stats.orders, icon: '📋', color: 'orange.400' },
    ];

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

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
                        borderColor={card.color}
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