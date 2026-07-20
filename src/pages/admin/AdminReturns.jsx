import { useState, useEffect } from 'react';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
    TableContainer, Badge, Button, HStack, Text,
    Spinner, Center, useToast,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    VStack, Divider, Flex, useDisclosure
} from '@chakra-ui/react';
import { showToast } from '../../services/toastHelper';
import api from '../../services/api';

function AdminReturns() {

    const [returns, setReturns] = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchAllReturns();
    }, []);

    const fetchAllReturns = () => {
        const allReturns = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('returns_')) {
                try {
                    const userReturns = JSON.parse(localStorage.getItem(key) || '[]');
                    const userId = key.replace('returns_', '');
                    userReturns.forEach(r => allReturns.push({ ...r, userId }));
                } catch (err) {}
            }
        }
        setReturns(allReturns.sort((a, b) => b.id - a.id));
        setLoading(false);
    };

    const handleViewDetail = (ret) => {
        setSelectedReturn(ret);
        onOpen();
    };

    const handleStatusUpdate = async (returnId, userId, newStatus) => {
        const key = `returns_${userId}`;
        const userReturns = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedReturn = userReturns.find(r => r.id === returnId);
        const updated = userReturns.map(r =>
            r.id === returnId ? { ...r, status: newStatus } : r
        );
        localStorage.setItem(key, JSON.stringify(updated));

        if (newStatus === 'APPROVED' && updatedReturn) {
            try {
                const orderRes = await api.get(`/api/orders/user/${userId}`);
                const orders = orderRes.data.data || [];
                const order = orders.find(o => o.id === Number(updatedReturn.orderId));

                if (order && order.product) {
                    const productRes = await api.get(`/api/products/${order.product.id}`);
                    const product = productRes.data.data || productRes.data;
                    const currentStock = product.stock || 0;
                    const returnQty = order.quantity || 1;

                    await api.put(`/api/products/${order.product.id}`, {
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        discount: product.discount,
                        stock: currentStock + returnQty,
                        status: product.status,
                        categoryId: product.category?.id
                    });
                }
            } catch (err) {
                console.error('Stok guncellenemedi:', err);
            }
        }

        showToast(toast, {
            title: newStatus === 'APPROVED' ? 'Onaylandi' : 'Reddedildi',
            description: `Iade talebi ${newStatus === 'APPROVED' ? 'onaylandi ve stok guncellendi' : 'reddedildi'}.`,
            status: newStatus === 'APPROVED' ? 'success' : 'error'
        });

        fetchAllReturns();
        onClose();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <Badge colorScheme="yellow">Beklemede</Badge>;
            case 'APPROVED': return <Badge colorScheme="green">Onaylandi</Badge>;
            case 'REJECTED': return <Badge colorScheme="red">Reddedildi</Badge>;
            default: return null;
        }
    };

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <Heading size="lg" mb={6}>Iade Talepleri</Heading>

            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <TableContainer>
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Talep ID</Th>
                                <Th>Kullanici ID</Th>
                                <Th>Siparis ID</Th>
                                <Th>Sebep</Th>
                                <Th>Tarih</Th>
                                <Th>Durum</Th>
                                <Th>Islem</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {returns.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                        Iade talebi bulunamadi
                                    </Td>
                                </Tr>
                            ) : returns.map(ret => (
                                <Tr key={ret.id} _hover={{ bg: 'gray.50' }}>
                                    <Td color="gray.500" fontSize="xs">#{ret.id}</Td>
                                    <Td fontSize="sm">#{ret.userId}</Td>
                                    <Td fontSize="sm">#{ret.orderId}</Td>
                                    <Td fontSize="sm" maxW="150px">
                                        <Text noOfLines={1}>{ret.reason}</Text>
                                    </Td>
                                    <Td fontSize="xs" color="gray.500">
                                        {new Date(ret.createdAt).toLocaleDateString('tr-TR')}
                                    </Td>
                                    <Td>{getStatusBadge(ret.status)}</Td>
                                    <Td>
                                        <Button size="xs" colorScheme="blue" variant="outline"
                                            onClick={() => handleViewDetail(ret)}>
                                            Incele
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Iade Talebi #{selectedReturn?.id}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedReturn && (
                            <VStack spacing={3} align="stretch">
                                <Flex justify="space-between">
                                    <Text color="gray.500">Kullanici ID</Text>
                                    <Text fontWeight="medium">#{selectedReturn.userId}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Siparis ID</Text>
                                    <Text fontWeight="medium">#{selectedReturn.orderId}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Sebep</Text>
                                    <Text fontWeight="medium">{selectedReturn.reason}</Text>
                                </Flex>
                                <Box>
                                    <Text color="gray.500" mb={1}>Aciklama</Text>
                                    <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm">
                                        {selectedReturn.description}
                                    </Box>
                                </Box>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Mevcut Durum</Text>
                                    {getStatusBadge(selectedReturn.status)}
                                </Flex>

                                {selectedReturn.status === 'PENDING' && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Text fontWeight="medium" mb={2}>Karar Ver</Text>
                                            <HStack>
                                                <Button
                                                    colorScheme="green"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(
                                                        selectedReturn.id,
                                                        selectedReturn.userId,
                                                        'APPROVED'
                                                    )}
                                                >
                                                    Onayla
                                                </Button>
                                                <Button
                                                    colorScheme="red"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(
                                                        selectedReturn.id,
                                                        selectedReturn.userId,
                                                        'REJECTED'
                                                    )}
                                                >
                                                    Reddet
                                                </Button>
                                            </HStack>
                                        </Box>
                                    </>
                                )}
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

export default AdminReturns;