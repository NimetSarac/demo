import { useState, useEffect, useRef } from 'react';
import {
    Box, Heading, Button, Table, Thead, Tbody,
    Tr, Th, Td, TableContainer, Badge, HStack,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    Input, Text, VStack, useDisclosure,
    AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Spinner, Center, useToast
} from '@chakra-ui/react';
import api from '../../services/api';
import { showToast } from '../../services/toastHelper';

function Categories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const toast = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/categories');
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setForm({ name: '', description: '' });
        onFormOpen();
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setForm({ name: category.name || '', description: category.description || '' });
        onFormOpen();
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        onDeleteOpen();
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            showToast(toast, { title: 'Hata', description: 'Kategori adı zorunludur.', status: 'error' });
            return;
        }

        setFormLoading(true);
        try {
            if (selectedCategory) {
                await api.put(`/api/categories/${selectedCategory.id}`, form);
                showToast(toast, { title: 'Güncellendi', description: 'Kategori güncellendi.', status: 'success' });
            } else {
                await api.post('/api/categories', form);
                showToast(toast, { title: 'Eklendi', description: 'Kategori eklendi.', status: 'success' });
            }
            await fetchCategories();
            onFormClose();
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'İşlem başarısız.',
                status: 'error'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/categories/${deleteId}`);
            showToast(toast, { title: 'Silindi', description: 'Kategori silindi.', status: 'success' });
            await fetchCategories();
            onDeleteClose();
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Silinemedi.',
                status: 'error'
            });
        }
    };

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">Kategoriler</Heading>
                <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }} onClick={handleAdd}>
                    + Kategori Ekle
                </Button>
            </HStack>

            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <TableContainer>
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>ID</Th>
                                <Th>Kategori Adı</Th>
                                <Th>Açıklama</Th>
                                <Th>İşlemler</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {categories.length === 0 ? (
                                <Tr>
                                    <Td colSpan={4} textAlign="center" py={8} color="gray.500">
                                        Henüz kategori eklenmemiş
                                    </Td>
                                </Tr>
                            ) : (
                                categories.map(category => (
                                    <Tr key={category.id} _hover={{ bg: 'gray.50' }}>
                                        <Td color="gray.500" fontSize="sm">#{category.id}</Td>
                                        <Td fontWeight="medium">{category.name}</Td>
                                        <Td color="gray.500" fontSize="sm">
                                            {category.description || '-'}
                                        </Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <Button size="sm" colorScheme="blue" variant="outline"
                                                    onClick={() => handleEdit(category)}>
                                                    ✏️ Düzenle
                                                </Button>
                                                <Button size="sm" colorScheme="red" variant="outline"
                                                    onClick={() => handleDeleteClick(category.id)}>
                                                    🗑️ Sil
                                                </Button>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Ekle/Düzenle Modal */}
            <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>
                        {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Kategori Adı *</Text>
                                <Input value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Kategori adını girin" />
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Açıklama</Text>
                                <Input value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Açıklama girin (opsiyonel)" />
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onFormClose}>İptal</Button>
                        <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }}
                            onClick={handleSubmit} isLoading={formLoading}>
                            {selectedCategory ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Silme Onay Dialog */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef}
                onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Kategoriyi Sil
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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

export default Categories;