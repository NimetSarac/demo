import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Heading, Text, VStack, HStack,
    Badge, Divider, Spinner, Center,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    Flex, Button
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

const CARGO_STEPS = [
    { key: 'HAZIRLANIYOR', label: 'Hazırlanıyor', icon: '📦', desc: 'Siparişiniz hazırlanıyor' },
    { key: 'KARGOYA_VERILDI', label: 'Kargoya Verildi', icon: '🚚', desc: 'Kargo firmasına teslim edildi' },
    { key: 'DAGITIMDA', label: 'Dağıtımda', icon: '🛵', desc: 'Dağıtım aracında' },
    { key: 'TESLIM_EDILDI', label: 'Teslim Edildi', icon: '✅', desc: 'Siparişiniz teslim edildi' },
];

function OrderTracking() {

    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/api/orders/user/${user.id}`);
            const orders = res.data.data || [];
            const found = orders.find(o => o.id === Number(id));
            setOrder(found || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStep = () => {
        if (!order?.cargoStatus) return -1;
        return CARGO_STEPS.findIndex(s => s.key === order.cargoStatus);
    };

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    if (!order) return (
        <EmptyState
            icon="📦"
            title="Sipariş bulunamadı"
            description="Bu siparişe erişim izniniz yok veya sipariş mevcut değil."
            buttonText="Siparişlerime Dön"
            onButtonClick={() => window.location.href = '/orders'}
        />
    );

    const currentStep = getCurrentStep();

    return (
        <Box maxW="700px" mx="auto">
            {/* Breadcrumb */}
            <Breadcrumb mb={6} fontSize="sm" color="gray.500">
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/">Ana Sayfa</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to="/orders">Siparişlerim</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>Sipariş #{id} Takip</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Heading size="lg" mb={6}>Sipariş Takip — #{order.id}</Heading>

            {/* Sipariş bilgisi */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontWeight="bold" fontSize="lg">{order.product?.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                            {order.orderDate
                                ? new Date(order.orderDate).toLocaleDateString('tr-TR', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })
                                : '-'}
                        </Text>
                    </Box>
                    <Text fontWeight="bold" fontSize="xl" color="red.500">
                        {order.priceTotal?.toLocaleString('tr-TR')} ₺
                    </Text>
                </Flex>

                {/* Kargo bilgileri */}
                {order.cargoCompany && (
                    <Box bg="gray.50" borderRadius="lg" p={4}>
                        <HStack spacing={4} flexWrap="wrap">
                            <Box>
                                <Text fontSize="xs" color="gray.500">Kargo Firması</Text>
                                <Text fontWeight="bold">{order.cargoCompany}</Text>
                            </Box>
                            {order.cargoTrackingNumber && (
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Takip No</Text>
                                    <Text fontWeight="bold" color="#0d47a1">
                                        {order.cargoTrackingNumber}
                                    </Text>
                                </Box>
                            )}
                        </HStack>
                    </Box>
                )}
            </Box>

            {/* Kargo durumu adımları */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mb={6}>
                <Heading size="md" mb={6}>Kargo Durumu</Heading>

                {currentStep === -1 ? (
                    <Box textAlign="center" py={4}>
                        <Text fontSize="40px" mb={2}>⏳</Text>
                        <Text color="gray.500">Kargo bilgisi henüz güncellenmedi.</Text>
                    </Box>
                ) : (
                    <VStack spacing={0} align="stretch">
                        {CARGO_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <Box key={step.key}>
                                    <HStack spacing={4} py={4}>
                                        {/* İkon */}
                                        <Box
                                            w="48px"
                                            h="48px"
                                            borderRadius="full"
                                            bg={isCompleted ? '#0d47a1' : 'gray.100'}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize="20px"
                                            flexShrink={0}
                                            boxShadow={isCurrent ? '0 0 0 4px rgba(13,71,161,0.2)' : 'none'}
                                        >
                                            {step.icon}
                                        </Box>

                                        {/* Bilgi */}
                                        <Box flex={1}>
                                            <Text
                                                fontWeight={isCurrent ? 'bold' : 'medium'}
                                                color={isCompleted ? '#0d47a1' : 'gray.400'}
                                                fontSize="md"
                                            >
                                                {step.label}
                                            </Text>
                                            <Text fontSize="sm" color="gray.500">
                                                {step.desc}
                                            </Text>
                                        </Box>

                                        {/* Durum */}
                                        {isCurrent && (
                                            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                                                Şu an burada
                                            </Badge>
                                        )}
                                        {isCompleted && !isCurrent && (
                                            <Text color="green.500" fontSize="xl">✓</Text>
                                        )}
                                    </HStack>

                                    {/* Çizgi */}
                                    {index < CARGO_STEPS.length - 1 && (
                                        <Box
                                            ml="22px"
                                            w="4px"
                                            h="20px"
                                            bg={index < currentStep ? '#0d47a1' : 'gray.200'}
                                            borderRadius="full"
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </VStack>
                )}
            </Box>

            <Button
                as={RouterLink}
                to="/orders"
                variant="outline"
                colorScheme="blue"
                width="100%"
            >
                ← Siparişlerime Dön
            </Button>
        </Box>
    );
}

export default OrderTracking;