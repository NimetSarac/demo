import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Box, Heading, Text, Badge, VStack,
    HStack, Flex, Divider, Spinner,
    Center, Button, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody,
    ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

function OrderHistory() {

    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
     const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/api/orders/user/${user.id}`);
            setOrders(res.data.data || []);
        } catch (err) {
            console.error('Siparişler yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        onOpen();
    };

    if (loading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (orders.length === 0) {
        return (
            <EmptyState
                icon="📦"
                title="Henüz siparişiniz yok"
                description="İlk siparişinizi vermek için ürünleri inceleyin."
                buttonText="Alışverişe Başla"
                onButtonClick={() => window.location.href = '/products'}
            />
        );
    }

    return (
        <Box>
            <Heading size="lg" mb={6}>Sipariş Geçmişim</Heading>

            <VStack spacing={4} align="stretch">
                {orders.map(order => (
                    <Box
                        key={order.id}
                        bg="white"
                        borderRadius="xl"
                        boxShadow="sm"
                        p={5}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
                        onClick={() => handleOrderClick(order)}
                    >
                        <Flex justify="space-between" align="center" mb={3}>
                            <Box>
                                <Text fontWeight="bold" fontSize="md">
                                    Sipariş #{order.id}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    {order.orderDate
                                        ? new Date(order.orderDate).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </Text>
                            </Box>
                            <HStack spacing={2}>
                                <Badge
                                    colorScheme={order.orderStatus ? 'green' : 'yellow'}
                                    px={3} py={1}
                                    borderRadius="full"
                                    fontSize="sm"
                                >
                                    {order.orderStatus ? '✓ Tamamlandı' : '⏳ Beklemede'}
                                </Badge>
                                <Text fontWeight="bold" color="red.500" fontSize="lg">
                                    {order.priceTotal?.toLocaleString('tr-TR')} ₺
                                </Text>
                            </HStack>
                        </Flex>

                        <Divider mb={3} />

                        <Flex justify="space-between" align="center">
                            <HStack spacing={3}>
                                <Box
                                    w="40px" h="40px"
                                    bg="gray.100"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="20px"
                                >
                                    🛍️
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="medium">
                                        {order.product?.name || 'Ürün'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {order.quantity} adet × {order.product?.price?.toLocaleString('tr-TR')} ₺
                                    </Text>
                                </Box>
                            </HStack>
                            <Text fontSize="sm" color="blue.500">
                                Detayları Gör →
                            </Text>
                        </Flex>
                    </Box>
                ))}
            </VStack>

            {/* Sipariş Detay Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>
                        Sipariş #{selectedOrder?.id} Detayı
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedOrder && (
                            <VStack spacing={4} align="stretch">

                                {/* Durum */}
                                <Flex justify="space-between" align="center">
                                    <Text color="gray.500">Sipariş Durumu</Text>
                                    <Badge
                                        colorScheme={selectedOrder.orderStatus ? 'green' : 'yellow'}
                                        px={3} py={1}
                                        borderRadius="full"
                                    >
                                        {selectedOrder.orderStatus ? '✓ Tamamlandı' : '⏳ Beklemede'}
                                    </Badge>
                                </Flex>
                                <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => navigate(`/orders/${selectedOrder.id}/track`)}
                                >
                                    📍 Takip Et
                                </Button>

                                {/* Tarih */}
                                <Flex justify="space-between">
                                    <Text color="gray.500">Sipariş Tarihi</Text>
                                    <Text fontWeight="medium">
                                        {selectedOrder.orderDate
                                            ? new Date(selectedOrder.orderDate).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : '-'}
                                    </Text>
                                </Flex>

                                <Divider />

                                {/* Ürün bilgisi */}
                                <Box>
                                    <Text fontWeight="bold" mb={3}>Ürün Bilgisi</Text>
                                    <HStack spacing={3} bg="gray.50" p={3} borderRadius="lg">
                                        <Box
                                            w="50px" h="50px"
                                            bg="white"
                                            borderRadius="md"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize="24px"
                                            boxShadow="sm"
                                        >
                                            🛍️
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontWeight="medium">
                                                {selectedOrder.product?.name || 'Ürün'}
                                            </Text>
                                            <Text fontSize="sm" color="gray.500">
                                                {selectedOrder.quantity} adet
                                            </Text>
                                        </Box>
                                        <Text fontWeight="bold" color="red.500">
                                            {selectedOrder.priceTotal?.toLocaleString('tr-TR')} ₺
                                        </Text>
                                    </HStack>
                                </Box>

                                <Divider />

                                {/* Fiyat özeti */}
                                <Box>
                                    <Text fontWeight="bold" mb={3}>Fiyat Özeti</Text>
                                    <VStack spacing={2} align="stretch">
                                        <Flex justify="space-between">
                                            <Text color="gray.500">Ürün Fiyatı</Text>
                                            <Text>
                                                {selectedOrder.product?.price?.toLocaleString('tr-TR')} ₺
                                            </Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text color="gray.500">Adet</Text>
                                            <Text>{selectedOrder.quantity}</Text>
                                        </Flex>
                                        {selectedOrder.priceDiscount > 0 && (
                                            <Flex justify="space-between">
                                                <Text color="green.600">İndirim</Text>
                                                <Text color="green.600">
                                                    -%{selectedOrder.priceDiscount}
                                                </Text>
                                            </Flex>
                                        )}
                                        <Divider />
                                        <Flex justify="space-between">
                                            <Text fontWeight="bold">Toplam</Text>
                                            <Text fontWeight="bold" color="red.500" fontSize="lg">
                                                {selectedOrder.priceTotal?.toLocaleString('tr-TR')} ₺
                                            </Text>
                                        </Flex>
                                    </VStack>
                                </Box>

                                {/* İade butonu */}
                                {selectedOrder.orderStatus && (
                                    <Button
                                        variant="outline"
                                        colorScheme="red"
                                        size="sm"
                                        onClick={() => {
                                            onClose();
                                            window.location.href = `/returns?orderId=${selectedOrder.id}`;
                                        }}
                                    >
                                        ↩️ İade Talebi Oluştur
                                    </Button>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default OrderHistory;