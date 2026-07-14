import { useState, useEffect, useRef } from 'react';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
    TableContainer, Badge, Button, HStack, Select,
    Text, Spinner, Center, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    VStack, Divider, Flex, Input, useDisclosure
} from '@chakra-ui/react';
import api from '../../services/api';
import { showToast } from '../../services/toastHelper';

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/users');
            const allUsers = res.data.data || [];

            // Tüm kullanıcıların siparişlerini çek
            const allOrders = [];
            for (const user of allUsers) {
                try {
                    const orderRes = await api.get(`/api/orders/user/${user.id}`);
                    const userOrders = (orderRes.data.data || []).map(o => ({
                        ...o,
                        userName: user.username
                    }));
                    allOrders.push(...userOrders);
                } catch (err) {}
            }
            setOrders(allOrders.sort((a, b) => b.id - a.id));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status?status=${newStatus}`);
            showToast(toast, { title: 'Güncellendi', description: 'Sipariş durumu güncellendi.', status: 'success' });
            await fetchOrders();
            onClose();
        } catch (err) {
            showToast(toast, { title: 'Hata', description: 'Güncelleme başarısız.', status: 'error' });
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        onOpen();
    };

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <Heading size="lg" mb={6}>Siparişler</Heading>

            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <TableContainer>
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Sipariş ID</Th>
                                <Th>Kullanıcı</Th>
                                <Th>Ürün</Th>
                                <Th isNumeric>Tutar</Th>
                                <Th>Tarih</Th>
                                <Th>Durum</Th>
                                <Th>İşlem</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orders.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                        Sipariş bulunamadı
                                    </Td>
                                </Tr>
                            ) : orders.map(order => (
                                <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                                    <Td color="gray.500" fontSize="xs">#{order.id}</Td>
                                    <Td fontWeight="medium">{order.userName}</Td>
                                    <Td fontSize="sm" maxW="150px">
                                        <Text noOfLines={1}>{order.product?.name || '-'}</Text>
                                    </Td>
                                    <Td isNumeric fontWeight="bold" color="red.500">
                                        {order.priceTotal?.toLocaleString('tr-TR')} ₺
                                    </Td>
                                    <Td fontSize="xs" color="gray.500">
                                        {order.orderDate
                                            ? new Date(order.orderDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={order.orderStatus ? 'green' : 'yellow'}>
                                            {order.orderStatus ? 'Tamamlandı' : 'Beklemede'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Button size="xs" colorScheme="blue" variant="outline"
                                            onClick={() => handleViewDetail(order)}>
                                            Detay
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Detay Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Sipariş #{selectedOrder?.id}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <VStack spacing={3} align="stretch">
                                <Flex justify="space-between">
                                    <Text color="gray.500">Kullanıcı</Text>
                                    <Text fontWeight="medium">{selectedOrder.userName}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Ürün</Text>
                                    <Text fontWeight="medium">{selectedOrder.product?.name}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Adet</Text>
                                    <Text fontWeight="medium">{selectedOrder.quantity}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Tutar</Text>
                                    <Text fontWeight="bold" color="red.500">
                                        {selectedOrder.priceTotal?.toLocaleString('tr-TR')} ₺
                                    </Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Tarih</Text>
                                    <Text>
                                        {selectedOrder.orderDate
                                            ? new Date(selectedOrder.orderDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Text>
                                </Flex>
                                <Divider />
                                <Box>
                                    <Text fontWeight="medium" mb={2}>Durum Güncelle</Text>
                                    <HStack>
                                        <Button
                                            size="sm"
                                            colorScheme="green"
                                            isDisabled={selectedOrder.orderStatus}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, true)}
                                        >
                                            ✓ Tamamlandı
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="yellow"
                                            isDisabled={!selectedOrder.orderStatus}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, false)}
                                        >
                                            ⏳ Beklemede
                                        </Button>
                                    </HStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Kapat</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default AdminOrders;