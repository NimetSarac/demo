import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Heading, Text, Button, Input,
    VStack, HStack, Divider, Flex,
    Badge, useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../services/toastHelper';
import api from '../services/api';

function Checkout() {

    const { user } = useAuth();
    const { cartItems, subtotal, total, clearCart } = useCart();
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        fullname: user?.username || '',
        bankName: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [paymentId, setPaymentId] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullname.trim()) {
            newErrors.fullname = 'Ad soyad zorunludur';
        }
        if (!form.bankName.trim()) {
            newErrors.bankName = 'Banka adı zorunludur';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            // 1. Sipariş oluştur
            const orderRes = await api.post('/api/orders/checkout', {
                userId: user.id,
                fullname: form.fullname,
                bankName: form.bankName
            });

            const payment = orderRes.data.data;
            setPaymentId(payment.id);

            // 2. Sahte ödeme işlemi
            await api.post(`/api/orders/${payment.id}/pay`);

            // 3. Sepeti temizle
            await clearCart();

            setOrderCompleted(true);

            showToast(toast, {
                title: 'Sipariş Tamamlandı',
                description: 'Siparişiniz başarıyla oluşturuldu.',
                status: 'success'
            });

        } catch (err) {
            showToast(toast, {
                title: 'Sipariş Başarısız',
                description: err.response?.data?.message || 'Bir hata oluştu.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Sipariş tamamlandı ekranı
    if (orderCompleted) {
        return (
            <Box maxW="500px" mx="auto" mt="60px" textAlign="center">
                <Text fontSize="80px" mb={4}>✅</Text>
                <Heading size="lg" mb={3} color="green.600">
                    Siparişiniz Tamamlandı!
                </Heading>
                <Text color="gray.600" mb={6}>
                    Siparişiniz başarıyla alındı. Sipariş detaylarınızı
                    hesabım sayfasından takip edebilirsiniz.
                </Text>
                <HStack justify="center" spacing={4}>
                    <Button
                        bg="#0d47a1"
                        color="white"
                        _hover={{ bg: '#1565c0' }}
                        onClick={() => navigate('/orders')}
                    >
                        Siparişlerimi Gör
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/products')}
                    >
                        Alışverişe Devam Et
                    </Button>
                </HStack>
            </Box>
        );
    }

    // Sepet boşsa
    if (cartItems.length === 0) {
        return (
            <Box maxW="500px" mx="auto" mt="60px" textAlign="center">
                <Text fontSize="60px" mb={4}>🛒</Text>
                <Heading size="md" mb={3}>Sepetiniz Boş</Heading>
                <Button
                    bg="#0d47a1"
                    color="white"
                    onClick={() => navigate('/products')}
                >
                    Alışverişe Başla
                </Button>
            </Box>
        );
    }

    return (
        <Box maxW="900px" mx="auto">
            <Heading size="lg" mb={6}>Siparişi Tamamla</Heading>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>

                {/* Sol — Form */}
                <Box flex={1}>
                    <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
                        <Heading size="md" mb={4}>Ödeme Bilgileri</Heading>

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">

                                <Box>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">
                                        Ad Soyad *
                                    </Text>
                                    <Input
                                        name="fullname"
                                        value={form.fullname}
                                        onChange={handleChange}
                                        placeholder="Kart üzerindeki ad soyad"
                                        borderColor={errors.fullname ? 'red.400' : 'gray.200'}
                                    />
                                    {errors.fullname && (
                                        <Text color="red.500" fontSize="xs" mt={1}>
                                            {errors.fullname}
                                        </Text>
                                    )}
                                </Box>

                                <Box>
                                    <Text mb={1} fontWeight="medium" fontSize="sm">
                                        Banka / Kart Adı *
                                    </Text>
                                    <Input
                                        name="bankName"
                                        value={form.bankName}
                                        onChange={handleChange}
                                        placeholder="Örn: Ziraat, Garanti, İş Bankası"
                                        borderColor={errors.bankName ? 'red.400' : 'gray.200'}
                                    />
                                    {errors.bankName && (
                                        <Text color="red.500" fontSize="xs" mt={1}>
                                            {errors.bankName}
                                        </Text>
                                    )}
                                </Box>

                                <Box
                                    bg="blue.50"
                                    borderRadius="md"
                                    p={3}
                                    border="1px solid"
                                    borderColor="blue.200"
                                >
                                    <Text fontSize="sm" color="blue.700">
                                        🔒 Bu bir demo uygulamasıdır. Gerçek ödeme alınmamaktadır.
                                    </Text>
                                </Box>

                                <Button
                                    type="submit"
                                    bg="#144691"
                                    color="white"
                                    size="lg"
                                    width="100%"
                                    isLoading={loading}
                                    loadingText="Sipariş oluşturuluyor..."
                                    _hover={{ bg: '#1565c0' }}
                                    mt={2}
                                >
                                    Siparişi Onayla →
                                </Button>
                            </VStack>
                        </form>
                    </Box>
                </Box>

                {/* Sağ — Sipariş özeti */}
                <Box w={{ base: '100%', lg: '320px' }} flexShrink={0}>
                    <Box
                        bg="white"
                        borderRadius="xl"
                        boxShadow="sm"
                        p={6}
                        position="sticky"
                        top="80px"
                    >
                        <Heading size="md" mb={4}>Sipariş Özeti</Heading>

                        <VStack spacing={3} align="stretch" mb={4}>
                            {cartItems.map((item, index) => (
                                <Flex
                                    key={item.id || index}
                                    justify="space-between"
                                    align="center"
                                >
                                    <Box>
                                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                            {item.productName || `Ürün #${item.productId}`}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {item.quantity} adet
                                        </Text>
                                    </Box>
                                    <Text fontSize="sm" fontWeight="bold">
                                        {((item.productPrice || 0) * item.quantity).toLocaleString('tr-TR')} ₺
                                    </Text>
                                </Flex>
                            ))}
                        </VStack>

                        <Divider mb={4} />

                        <VStack spacing={2} align="stretch">
                            <Flex justify="space-between">
                                <Text color="gray.600">Ara Toplam</Text>
                                <Text>{subtotal?.toLocaleString('tr-TR')} ₺</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <Text color="gray.600">Kargo</Text>
                                <Text color="green.600">Ücretsiz</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between">
                                <Text fontWeight="bold" fontSize="lg">Toplam</Text>
                                <Text fontWeight="bold" fontSize="lg" color="red.500">
                                    {total?.toLocaleString('tr-TR')} ₺
                                </Text>
                            </Flex>
                        </VStack>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
}

export default Checkout;