import { useState, useEffect, useRef } from 'react';
import {
    Box, Heading, Button, Table, Thead, Tbody,
    Tr, Th, Td, TableContainer, Badge, HStack,
    Input, Text, Spinner, Center, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    VStack, Select, useDisclosure
} from '@chakra-ui/react';
import api from '../../services/api';
import { showToast } from '../../services/toastHelper';

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ fullname: '', email: '', phoneNumber: '', role: 'CUSTOMER' });
    const [formLoading, setFormLoading] = useState(false);

    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const toast = useToast();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setForm({
            fullname: user.fullname || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            role: user.role || 'CUSTOMER'
        });
        onFormOpen();
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        try {
            await api.put(`/api/users/${selectedUser.id}`, form);
            showToast(toast, { title: 'Güncellendi', description: 'Kullanıcı güncellendi.', status: 'success' });
            await fetchUsers();
            onFormClose();
        } catch (err) {
            showToast(toast, { title: 'Hata', description: 'Güncelleme başarısız.', status: 'error' });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        onDeleteOpen();
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/users/${deleteId}`);
            showToast(toast, { title: 'Silindi', description: 'Kullanıcı silindi.', status: 'success' });
            await fetchUsers();
            onDeleteClose();
        } catch (err) {
            showToast(toast, { title: 'Hata', description: 'Silinemedi.', status: 'error' });
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchKeyword.toLowerCase())
    );

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <Heading size="lg" mb={6}>Kullanıcılar</Heading>

            <Input
                placeholder="Kullanıcı veya e-posta ara..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                mb={4} maxW="300px" bg="white"
            />

            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <TableContainer>
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>ID</Th>
                                <Th>Kullanıcı Adı</Th>
                                <Th>Ad Soyad</Th>
                                <Th>E-posta</Th>
                                <Th>Rol</Th>
                                <Th>Durum</Th>
                                <Th>İşlemler</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredUsers.map(user => (
                                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                                    <Td color="gray.500" fontSize="xs">#{user.id}</Td>
                                    <Td fontWeight="medium">{user.username}</Td>
                                    <Td>{user.fullname || '-'}</Td>
                                    <Td fontSize="sm">{user.email}</Td>
                                    <Td>
                                        <Badge colorScheme={user.role === 'ADMIN' ? 'purple' : 'blue'}>
                                            {user.role || 'CUSTOMER'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={user.status ? 'green' : 'red'}>
                                            {user.status ? 'Aktif' : 'Pasif'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <Button size="xs" colorScheme="blue" variant="outline"
                                                onClick={() => handleEdit(user)}>
                                                ✏️
                                            </Button>
                                            <Button size="xs" colorScheme="red" variant="outline"
                                                onClick={() => handleDeleteClick(user.id)}>
                                                🗑️
                                            </Button>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Düzenle Modal */}
            <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Kullanıcı Düzenle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Ad Soyad</Text>
                                <Input value={form.fullname}
                                    onChange={e => setForm({ ...form, fullname: e.target.value })}
                                    placeholder="Ad soyad" />
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">E-posta</Text>
                                <Input value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="E-posta" />
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Telefon</Text>
                                <Input value={form.phoneNumber}
                                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                    placeholder="Telefon" />
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Rol</Text>
                                <Select value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="CUSTOMER">CUSTOMER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </Select>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onFormClose}>İptal</Button>
                        <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }}
                            onClick={handleSubmit} isLoading={formLoading}>
                            Güncelle
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Silme Onay */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef}
                onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader>Kullanıcıyı Sil</AlertDialogHeader>
                        <AlertDialogBody>
                            Bu kullanıcıyı silmek istediğinize emin misiniz?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>İptal</Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>Sil</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}

export default AdminUsers;