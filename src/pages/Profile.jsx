import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Heading, Text, Button, Input,
    VStack, HStack, Tabs, TabList, Tab,
    TabPanels, TabPanel, Badge, Divider,
    Flex, Spinner, Center,
    Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@chakra-ui/react';
import { showToast } from '../services/toastHelper';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { Link as RouterLink } from 'react-router-dom';

function Profile() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Bilgilerim
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        address: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    // Şifre değiştirme
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Siparişlerim
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
            console.error('Profil yüklenemedi:', err);
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
            console.error('Siparişler yüklenemedi:', err);
        } finally {
            setOrdersLoading(false);
        }
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
                description: 'Profil bilgileriniz başarıyla güncellendi.',
                status: 'success'
            });
        } catch (err) {
            showToast(toast, {
                title: 'Güncelleme Başarısız',
                description: err.response?.data?.message || 'Bir hata oluştu.',
                status: 'error'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const validatePassword = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Mevcut şifre zorunludur';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'Yeni şifre zorunludur';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
        }
        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Şifre tekrarı zorunludur';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Şifreler eşleşmiyor';
        }
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
        return (
            <Center py={20}>
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Box maxW="800px" mx="auto">

            {/* Profil başlık */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg">Hesabım</Heading>
                    <Text color="gray.500" mt={1}>
                        Hoşgeldiniz, {user?.username}
                    </Text>
                </Box>
                <Button
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                >
                    Çıkış Yap
                </Button>
            </Flex>

            {/* Sekmeli yapı */}
            <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                    <Tab>👤 Bilgilerim</Tab>
                    <Tab>📦 Siparişlerim</Tab>
                    <Tab>↩️ İadelerim</Tab>
                </TabList>

                <TabPanels>

                    {/* ===== BİLGİLERİM ===== */}
                    <TabPanel px={0} pt={6}>
                        <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
                            <Heading size="md" mb={6}>Kişisel Bilgiler</Heading>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={4} align="stretch">

                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Ad Soyad</Text>
                                        <Input
                                            name="fullname"
                                            value={form.fullname}
                                            onChange={handleChange}
                                            placeholder="Adınızı ve soyadınızı girin"
                                        />
                                    </Box>

                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">E-posta</Text>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="E-posta adresinizi girin"
                                        />
                                    </Box>

                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Telefon</Text>
                                        <Input
                                            name="phoneNumber"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="05XX XXX XX XX"
                                        />
                                    </Box>

                                    <Box>
                                        <Text mb={1} fontWeight="medium" fontSize="sm">Adres</Text>
                                        <Input
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="Teslimat adresinizi girin"
                                        />
                                    </Box>

                                    <Button
                                        type="submit"
                                        bg="#0d47a1"
                                        color="white"
                                        _hover={{ bg: '#1565c0' }}
                                        isLoading={formLoading}
                                        loadingText="Kaydediliyor..."
                                        alignSelf="flex-start"
                                        px={8}
                                    >
                                        Kaydet
                                    </Button>
                                </VStack>
                            </form>
                        </Box>

                        {/* Güvenlik */}
                        <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mt={4}>
                            <Heading size="md" mb={2}>Güvenlik</Heading>
                            <Text color="gray.500" fontSize="sm" mb={4}>
                                Şifrenizi değiştirmek istiyorsanız aşağıdaki butona tıklayın.
                            </Text>
                            <Button
                                variant="outline"
                                colorScheme="blue"
                                size="sm"
                                onClick={onOpen}
                            >
                                🔒 Şifre Değiştir
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* ===== SİPARİŞLERİM ===== */}
                    <TabPanel px={0} pt={6}>
                        {ordersLoading ? (
                            <Center py={10}>
                                <Spinner color="blue.500" />
                            </Center>
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
                                {orders.map(order => (
                                    <Box
                                        key={order.id}
                                        bg="white"
                                        borderRadius="xl"
                                        boxShadow="sm"
                                        p={5}
                                    >
                                        <Flex justify="space-between" align="center" mb={3}>
                                            <Box>
                                                <Text fontWeight="bold">Sipariş #{order.id}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {order.orderDate
                                                        ? new Date(order.orderDate).toLocaleDateString('tr-TR')
                                                        : '-'}
                                                </Text>
                                            </Box>
                                            <Badge
                                                colorScheme={order.orderStatus ? 'green' : 'yellow'}
                                                px={3} py={1}
                                                borderRadius="full"
                                            >
                                                {order.orderStatus ? '✓ Tamamlandı' : '⏳ Beklemede'}
                                            </Badge>
                                        </Flex>
                                        <Divider mb={3} />
                                        <Flex justify="space-between" align="center">
                                            <Box>
                                                <Text fontSize="sm" color="gray.600">
                                                    {order.product?.name || 'Ürün'}
                                                </Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {order.quantity} adet
                                                </Text>
                                            </Box>
                                            <Text fontWeight="bold" color="red.500">
                                                {order.priceTotal?.toLocaleString('tr-TR')} ₺
                                            </Text>
                                        </Flex>
                                        // Siparişlerim sekmesine "Tüm Siparişleri Gör" butonu ekle
                                        <Button
                                            as={RouterLink}
                                            to="/orders"
                                            variant="outline"
                                            colorScheme="blue"
                                            size="sm"
                                            mb={4}
                                        >
                                            📋 Tüm Siparişleri Gör
                                        </Button>
                                    </Box>

                                ))}
                            </VStack>
                        )}
                    </TabPanel>

                    {/* ===== İADELERİM ===== */}
                    <TabPanel px={0} pt={6}>
                        <EmptyState
                            icon="↩️"
                            title="İade talebiniz bulunmuyor"
                            description="İade talebi oluşturmak için siparişlerinizi inceleyin."
                            buttonText="Siparişlerimi Gör"
                            onButtonClick={() => { }}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Şifre Değiştirme Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>🔒 Şifre Değiştir</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>

                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    Mevcut Şifre *
                                </Text>
                                <Input
                                    name="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Mevcut şifrenizi girin"
                                    borderColor={passwordErrors.currentPassword ? 'red.400' : 'gray.200'}
                                />
                                {passwordErrors.currentPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.currentPassword}
                                    </Text>
                                )}
                            </Box>

                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    Yeni Şifre *
                                </Text>
                                <Input
                                    name="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="En az 6 karakter"
                                    borderColor={passwordErrors.newPassword ? 'red.400' : 'gray.200'}
                                />
                                {passwordErrors.newPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.newPassword}
                                    </Text>
                                )}
                            </Box>

                            <Box width="100%">
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    Yeni Şifre Tekrar *
                                </Text>
                                <Input
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Yeni şifrenizi tekrar girin"
                                    borderColor={passwordErrors.confirmPassword ? 'red.400' : 'gray.200'}
                                />
                                {passwordErrors.confirmPassword && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        {passwordErrors.confirmPassword}
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            İptal
                        </Button>
                        <Button
                            bg="#0d47a1"
                            color="white"
                            _hover={{ bg: '#1565c0' }}
                            onClick={handlePasswordSubmit}
                            isLoading={passwordLoading}
                            loadingText="Değiştiriliyor..."
                        >
                            Şifreyi Değiştir
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default Profile;