import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Heading, Text, Button, Input,
    VStack, HStack, Tabs, TabList, Tab,
    TabPanels, TabPanel, Badge, Divider,
    Flex, Spinner, Center,
    Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../services/toastHelper';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import {
    AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';

function Profile() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure(); // şifre modal
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure(); // hesap silme
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        address: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
        fetchOrders();
    }, [user]);
    const cancelRef = useRef();
    const handleDeleteAccount = async () => {
        try {
            await api.delete(`/api/users/${user.id}`);

            // localStorage'ı temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem(`returns_${user.id}`);

            showToast(toast, {
                title: 'Hesap Silindi',
                description: 'Hesabınız başarıyla silindi.',
                status: 'success'
            });

            await logout();
            navigate('/');

        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: 'Hesap silinemedi.',
                status: 'error'
            });
        } finally {
            onDeleteClose();
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/api/users/${user.id}`);
            const data = res.data.data;
            setForm({
                fullname: data.fullname || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await api.get(`/api/orders/user/${user.id}`);
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const getReturnStatus = (orderId) => {
        const key = `returns_${user.id}`;
        const userReturns = JSON.parse(localStorage.getItem(key) || '[]');
        const ret = userReturns.find(r =>
            String(r.orderId) === String(orderId)
        );
        return ret ? ret.status : null;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
        setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.put(`/api/users/${user.id}`, form);
            showToast(toast, {
                title: 'Bilgiler Güncellendi',
                description: 'Profil bilgileriniz güncellendi.',
                status: 'success'
            });
        } catch (err) {
            showToast(toast, {
                title: 'Güncelleme Başarısız',
                description: 'Bir hata oluştu.',
                status: 'error'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const validatePassword = () => {
        const errors = {};
        if (!passwordForm.currentPassword) errors.currentPassword = 'Mevcut şifre zorunludur';
        if (!passwordForm.newPassword) errors.newPassword = 'Yeni şifre zorunludur';
        else if (passwordForm.newPassword.length < 6) errors.newPassword = 'En az 6 karakter';
        if (!passwordForm.confirmPassword) errors.confirmPassword = 'Şifre tekrarı zorunludur';
        else if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Şifreler eşleşmiyor';
        return errors;
    };

    const handlePasswordSubmit = async () => {
        const errors = validatePassword();
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }
        setPasswordLoading(true);
        try {
            await api.put(
                `/api/users/${user.id}/change-password?currentPassword=${passwordForm.currentPassword}&newPassword=${passwordForm.newPassword}`
            );
            showToast(toast, {
                title: 'Şifre Değiştirildi',
                description: 'Şifreniz başarıyla güncellendi.',
                status: 'success'
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            onClose();
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Şifre değiştirilemedi.',
                status: 'error'
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (profileLoading) {
        return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;
    }

    return (
        <Box maxW="800px" mx="auto">

            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg">Hesabım</Heading>
                    <Text color="gray.500" mt={1}>Hoşgeldiniz, {user?.username}</Text>
                </Box>
                <Button colorScheme="red" variant="outline" size="sm" onClick={handleLogout}>
                    Çıkış Yap
                </Button>
            </Flex>

            <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                    <Tab>👤 Bilgilerim</Tab>
                    <Tab>📦 Siparişlerim</Tab>
                    <Tab>↩️ İadelerim</Tab>
                </TabList>

                <TabPanels>

                    {/* BİLGİLERİM */}
                    <TabPanel px={0} pt={6}>
                        <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
                            <Heading size="md" mb={6}>Kişisel Bilgiler</Heading>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={4} align="stretch">
                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Ad Soyad</Text>
                                        <Input name="fullname" value={form.fullname}
                                            onChange={handleChange} placeholder="Ad soyad" />
                                    </Box>
                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">E-posta</Text>
                                        <Input name="email" type="email" value={form.email}
                                            onChange={handleChange} placeholder="E-posta" />
                                    </Box>
                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Telefon</Text>
                                        <Input name="phoneNumber" value={form.phoneNumber}
                                            onChange={handleChange} placeholder="05XX XXX XX XX" />
                                    </Box>
                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Adres</Text>
                                        <Input name="address" value={form.address}
                                            onChange={handleChange} placeholder="Teslimat adresi" />
                                    </Box>
                                    <Button type="submit" bg="#1b1b6b" color="white"
                                        _hover={{ bg: '#1565c0' }} isLoading={formLoading}
                                        alignSelf="flex-start" px={8}>
                                        Kaydet
                                    </Button>
                                </VStack>
                            </form>
                        </Box>

                        <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mt={4}>
                            <Heading size="md" mb={2}>Güvenlik</Heading>
                            <Text color="gray.500" fontSize="sm" mb={4}>
                                Şifrenizi değiştirmek için tıklayın.
                            </Text>
                            <Button variant="outline" colorScheme="blue" size="sm" onClick={onOpen}>
                                🔒 Şifre Değiştir
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* SİPARİŞLERİM */}
                    <TabPanel px={0} pt={6}>
                        <Button
                            as={RouterLink}
                            to="/orders"
                            bg="#0d47a1"
                            color="white"
                            _hover={{ bg: '#1565c0' }}
                            size="sm"
                            mb={4}
                        >
                            📋 Tüm Siparişleri Gör
                        </Button>

                        {ordersLoading ? (
                            <Center py={10}><Spinner color="blue.500" /></Center>
                        ) : orders.length === 0 ? (
                            <EmptyState
                                icon="📦"
                                title="Henüz siparişiniz yok"
                                description="İlk siparişinizi vermek için ürünleri inceleyin."
                                buttonText="Alışverişe Başla"
                                onButtonClick={() => navigate('/products')}
                            />
                        ) : (
                            <VStack spacing={4} align="stretch">
                                {orders.slice(0, 3).map(order => (
                                    <Box key={order.id} bg="white" borderRadius="xl" boxShadow="sm" p={5}>
                                        <Flex justify="space-between" align="center" mb={3}>
                                            <Box>
                                                <Text fontWeight="bold">Sipariş #{order.id}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {order.orderDate
                                                        ? new Date(order.orderDate).toLocaleDateString('tr-TR')
                                                        : '-'}
                                                </Text>
                                            </Box>
                                            {(() => {
                                                const returnStatus = getReturnStatus(order.id);
                                                if (returnStatus === 'APPROVED') {
                                                    return <Badge colorScheme="purple" px={3} py={1} borderRadius="full">↩️ İade Edildi</Badge>;
                                                } else if (returnStatus === 'PENDING') {
                                                    return <Badge colorScheme="orange" px={3} py={1} borderRadius="full">⏳ İade Beklemede</Badge>;
                                                } else if (returnStatus === 'REJECTED') {
                                                    return <Badge colorScheme="red" px={3} py={1} borderRadius="full">✗ İade Reddedildi</Badge>;
                                                } else {
                                                    return (
                                                        <Badge
                                                            colorScheme={order.orderStatus ? 'green' : 'yellow'}
                                                            px={3} py={1}
                                                            borderRadius="full"
                                                        >
                                                            {order.orderStatus ? '✓ Tamamlandı' : '⏳ Beklemede'}
                                                        </Badge>
                                                    );
                                                }
                                            })()}
                                        </Flex>
                                        <Divider mb={3} />
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="sm" color="gray.600">
                                                {order.product?.name || 'Ürün'} — {order.quantity} adet
                                            </Text>
                                            <Text fontWeight="bold" color="red.500">
                                                {order.priceTotal?.toLocaleString('tr-TR')} ₺
                                            </Text>
                                        </Flex>
                                    </Box>
                                ))}
                                {orders.length > 3 && (
                                    <Button as={RouterLink} to="/orders" variant="outline" size="sm">
                                        Tümünü Gör ({orders.length} sipariş)
                                    </Button>
                                )}
                            </VStack>
                        )}
                    </TabPanel>

                    {/* İADELERİM */}
                    <TabPanel px={0} pt={6}>
                        <Box mb={4}>
                            <Button
                                as={RouterLink}
                                to="/returns"
                                bg="#0d47a1"
                                color="white"
                                _hover={{ bg: '#1565c0' }}
                                size="sm"
                            >
                                ↩️ İade Talebi Oluştur / Taleplerim
                            </Button>
                        </Box>
                        <EmptyState
                            icon="↩️"
                            title="İade taleplerinizi görüntüleyin"
                            description="İade talebi oluşturmak veya mevcut taleplerinizi görmek için tıklayın."
                            buttonText="İade Taleplerim"
                            onButtonClick={() => navigate('/returns')}
                        />
                    </TabPanel>

                </TabPanels>
            </Tabs>
            {/* Hesap Silme */}
            <Box bg="red.50" borderRadius="xl" boxShadow="sm" p={6} mt={4}
                border="1px solid" borderColor="red.200">
                <Heading size="md" mb={2} color="red.600">Tehlikeli Bölge</Heading>
                <Text color="gray.600" fontSize="sm" mb={4}>
                    Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir.
                    Bu işlem geri alınamaz.
                </Text>
                <Button
                    colorScheme="red"
                    size="sm"
                    onClick={onDeleteOpen}
                >
                    🗑️ Hesabımı Sil
                </Button>
            </Box>

            {/* Şifre Değiştirme Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>🔒 Şifre Değiştir</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Mevcut Şifre *</Text>
                                <Input name="currentPassword" type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Mevcut şifrenizi girin"
                                    borderColor={passwordErrors.currentPassword ? 'red.400' : 'gray.200'} />
                                {passwordErrors.currentPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.currentPassword}
                                    </Text>
                                )}
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Yeni Şifre *</Text>
                                <Input name="newPassword" type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="En az 6 karakter"
                                    borderColor={passwordErrors.newPassword ? 'red.400' : 'gray.200'} />
                                {passwordErrors.newPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.newPassword}
                                    </Text>
                                )}
                            </Box>
                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">Yeni Şifre Tekrar *</Text>
                                <Input name="confirmPassword" type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Yeni şifrenizi tekrar girin"
                                    borderColor={passwordErrors.confirmPassword ? 'red.400' : 'gray.200'} />
                                {passwordErrors.confirmPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.confirmPassword}
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>İptal</Button>
                        <Button bg="#0d47a1" color="white" _hover={{ bg: '#1565c0' }}
                            onClick={handlePasswordSubmit} isLoading={passwordLoading}>
                            Şifreyi Değiştir
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* Hesap Silme Onay Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
                            ⚠️ Hesabı Sil
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Text mb={3}>
                                Hesabınızı silmek istediğinize emin misiniz?
                            </Text>
                            <Text fontWeight="bold" color="red.600">
                                Bu işlem geri alınamaz. Tüm siparişleriniz,
                                sepetiniz ve kişisel bilgileriniz kalıcı olarak silinecektir.
                            </Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Vazgeç
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                                Evet, Hesabımı Sil
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </Box>
    );
}

export default Profile;