import { useState, useEffect, useRef } from 'react';
import {
    Box, Heading, Button, Table, Thead, Tbody,
    Tr, Th, Td, TableContainer, Badge, HStack,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    Input, Text, VStack, Select, useDisclosure,
    AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Spinner, Center, useToast, Switch, Flex
} from '@chakra-ui/react';
import api from '../../services/api';
import { showToast } from '../../services/toastHelper';

const emptyForm = {
    name: '',
    image: '',
    price: '',
    discount: '',
    stock: '',
    status: true,
    categoryId: ''
};

function AdminProducts() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');


    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);

            console.log('Products response:', productsRes.data);

            // ApiResponse formatı: data.data
            // Direkt array: data
            const productsData = productsRes.data.data || productsRes.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
            setCategories(categoriesRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleAdd = () => {
        setSelectedProduct(null);
        setForm(emptyForm);
        onFormOpen();
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setForm({
            name: product.name || '',
            image: product.image || '',
            price: product.price || '',
            discount: product.discount || 0,
            stock: product.stock || '',
            status: product.status ?? true,
            categoryId: product.category?.id || ''
        });
        onFormOpen();
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        onDeleteOpen();
    };

    const validate = () => {
        if (!form.name.trim()) {
            showToast(toast, { title: 'Hata', description: 'Ürün adı zorunludur.', status: 'error' });
            return false;
        }
        if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
            showToast(toast, { title: 'Hata', description: 'Geçerli bir fiyat girin.', status: 'error' });
            return false;
        }
        if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) {
            showToast(toast, { title: 'Hata', description: 'Geçerli bir stok girin.', status: 'error' });
            return false;
        }
        if (!form.categoryId) {
            showToast(toast, { title: 'Hata', description: 'Kategori seçiniz.', status: 'error' });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setFormLoading(true);
        try {
            const payload = {
                name: form.name,
                image: form.image,
                price: Number(form.price),
                discount: Number(form.discount) || 0,
                stock: Number(form.stock),
                status: form.status,
                categoryId: Number(form.categoryId)
            };

            if (selectedProduct) {
                await api.put(`/api/products/${selectedProduct.id}`, payload);
                showToast(toast, { title: 'Güncellendi', description: 'Ürün güncellendi.', status: 'success' });
            } else {
                await api.post('/api/products', payload);
                showToast(toast, { title: 'Eklendi', description: 'Ürün eklendi.', status: 'success' });
            }
            await fetchData();
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
            await api.delete(`/api/products/${deleteId}`);
            showToast(toast, { title: 'Silindi', description: 'Ürün silindi.', status: 'success' });
            await fetchData();
            onDeleteClose();
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Silinemedi.',
                status: 'error'
            });
        }
    };

    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchKeyword.toLowerCase())
    );
   

    if (loading) return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;

    return (
        <Box>
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">Ürünler</Heading>
                <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }} onClick={handleAdd}>
                    + Ürün Ekle
                </Button>
            </HStack>

            <Input
                placeholder="Ürün ara..."
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
                                <Th>Ürün Adı</Th>
                                <Th>Kategori</Th>
                                <Th isNumeric>Fiyat</Th>
                                <Th isNumeric>İndirim</Th>
                                <Th isNumeric>Stok</Th>
                                <Th>Durum</Th>
                                <Th>İşlemler</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredProducts.length === 0 ? (
                                <Tr>
                                    <Td colSpan={8} textAlign="center" py={8} color="gray.500">
                                        Ürün bulunamadı
                                    </Td>
                                </Tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <Tr key={product.id} _hover={{ bg: 'gray.50' }}>
                                        <Td color="gray.500" fontSize="xs">#{product.id}</Td>
                                        <Td fontWeight="medium" maxW="200px">
                                            <Text noOfLines={1}>{product.name}</Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme="blue" fontSize="xs">
                                                {product.category?.name || '-'}
                                            </Badge>
                                        </Td>
                                        <Td isNumeric fontWeight="bold" color="red.500">
                                            {product.price?.toLocaleString('tr-TR')} ₺
                                        </Td>
                                        <Td isNumeric>
                                            {product.discount > 0 ? (
                                                <Badge colorScheme="green">%{product.discount}</Badge>
                                            ) : '-'}
                                        </Td>
                                        <Td isNumeric>
                                            <Badge colorScheme={
                                                product.stock > 5 ? 'green'
                                                    : product.stock > 0 ? 'orange'
                                                        : 'red'
                                            }>
                                                {product.stock}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={product.status ? 'green' : 'gray'}>
                                                {product.status ? 'Aktif' : 'Pasif'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                <Button size="xs" colorScheme="blue" variant="outline"
                                                    onClick={() => handleEdit(product)}>
                                                    ✏️
                                                </Button>
                                                <Button size="xs" colorScheme="red" variant="outline"
                                                    onClick={() => handleDeleteClick(product.id)}>
                                                    🗑️
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
            <Modal isOpen={isFormOpen} onClose={onFormClose} isCentered size="lg">
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>
                        {selectedProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Ürün Adı *</Text>
                                <Input value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ürün adını girin" />
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Resim URL</Text>
                                <Input value={form.image}
                                    onChange={e => setForm({ ...form, image: e.target.value })}
                                    placeholder="https://example.com/image.jpg" />
                            </Box>
                            <HStack width="100%" spacing={4}>
                                <Box flex={1}>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">Fiyat (₺) *</Text>
                                    <Input type="number" value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        placeholder="0.00" min={0} />
                                </Box>
                                <Box flex={1}>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">İndirim (%)</Text>
                                    <Input type="number" value={form.discount}
                                        onChange={e => setForm({ ...form, discount: e.target.value })}
                                        placeholder="0" min={0} max={100} />
                                </Box>
                            </HStack>
                            <HStack width="100%" spacing={4}>
                                <Box flex={1}>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">Stok *</Text>
                                    <Input type="number" value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })}
                                        placeholder="0" min={0} />
                                </Box>
                                <Box flex={1}>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">Kategori *</Text>
                                    <Select placeholder="Kategori seçin" value={form.categoryId}
                                        onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </Box>
                                <Box width="100%">
                                    <Text mb={1} fontWeight="medium" fontSize="sm">Açıklama</Text>
                                    <Input
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Ürün açıklaması girin"
                                    />
                                </Box>
                            </HStack>
                            <Flex width="100%" align="center" justify="space-between">
                                <Text fontWeight="medium" fontSize="sm">Aktif</Text>
                                <Switch isChecked={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.checked })}
                                    colorScheme="blue" />
                            </Flex>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onFormClose}>İptal</Button>
                        <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }}
                            onClick={handleSubmit} isLoading={formLoading}>
                            {selectedProduct ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Silme Onay Dialog */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef}
                onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader>Ürünü Sil</AlertDialogHeader>
                        <AlertDialogBody>
                            Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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

export default AdminProducts;