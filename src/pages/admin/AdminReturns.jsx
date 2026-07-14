import { useState, useEffect } from 'react';
import {
    Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
    TableContainer, Badge, Button, HStack, Text,
    Spinner, Center, useToast, Textarea,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    VStack, Divider, Flex, useDisclosure
} from '@chakra-ui/react';
import { showToast } from '../../services/toastHelper';

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
        // Tüm kullanıcıların iade taleplerini localStorage'dan çek
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

    const handleStatusUpdate = (returnId, userId, newStatus) => {
        const key = `returns_${userId}`; //userId doğru mu
        console.log('Güncellenen key:', key, 'returnId:', returnId);
        const userReturns = JSON.parse(localStorage.getItem(key) || '[]');
        console.log('Mevcut talepler:', userReturns);  
        const updated = userReturns.map(r =>
            r.id === returnId ? { ...r, status: newStatus } : r
        );
        console.log('Güncellenmiş talepler:', updated);
        localStorage.setItem(key, JSON.stringify(updated));

        showToast(toast, {
            title: newStatus === 'APPROVED' ? 'Onaylandı' : 'Reddedildi',
            description: `İade talebi ${newStatus === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`,
            status: newStatus === 'APPROVED' ? 'success' : 'error'
        });

        fetchAllReturns();
        onClose();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <Badge colorScheme="yellow">⏳ Beklemede</Badge>;
            case 'APPROVED': return <Badge colorScheme="green">✓ Onaylandı</Badge>;
            case 'REJECTED': return <Badge colorScheme="red">✗ Reddedildi</Badge>;
            default: return null;
        }
    };

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <Heading size="lg" mb={6}>İade Talepleri</Heading>

            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <TableContainer>
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>Talep ID</Th>
                                <Th>Kullanıcı ID</Th>
                                <Th>Sipariş ID</Th>
                                <Th>Sebep</Th>
                                <Th>Tarih</Th>
                                <Th>Durum</Th>
                                <Th>İşlem</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {returns.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                        İade talebi bulunamadı
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
                                            İncele
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
                    <ModalHeader>İade Talebi #{selectedReturn?.id}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedReturn && (
                            <VStack spacing={3} align="stretch">
                                <Flex justify="space-between">
                                    <Text color="gray.500">Kullanıcı ID</Text>
                                    <Text fontWeight="medium">#{selectedReturn.userId}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Sipariş ID</Text>
                                    <Text fontWeight="medium">#{selectedReturn.orderId}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color="gray.500">Sebep</Text>
                                    <Text fontWeight="medium">{selectedReturn.reason}</Text>
                                </Flex>
                                <Box>
                                    <Text color="gray.500" mb={1}>Açıklama</Text>
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
                                                    ✓ Onayla
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
                                                    ✗ Reddet
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