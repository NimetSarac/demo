import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Heading, Text, Button, Textarea,
    Select, VStack, Badge, Divider,
    Flex, Spinner, Center, useToast
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../services/toastHelper';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

// İade sebepleri
const RETURN_REASONS = [
    'Ürün hasarlı/bozuk geldi',
    'Yanlış ürün gönderildi',
    'Ürün açıklamayla uyuşmuyor',
    'Ürünü beğenmedim',
    'Ürün çok geç geldi',
    'Diğer'
];

function Returns() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        orderId: orderId || '',
        reason: '',
        description: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
        // Gerçek projede iade listesi de backend'den gelir
        // Şimdilik localStorage'da tutuyoruz
        const savedReturns = JSON.parse(localStorage.getItem(`returns_${user.id}`) || '[]');
        setReturns(savedReturns);
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/api/orders/user/${user.id}`);
            // Sadece tamamlanmış siparişler iade edilebilir
            const completed = (res.data.data || []).filter(o => o.orderStatus);
            setOrders(completed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.orderId) {
            showToast(toast, { title: 'Hata', description: 'Sipariş seçiniz.', status: 'error' });
            return;
        }
        if (!form.reason) {
            showToast(toast, { title: 'Hata', description: 'İade sebebi seçiniz.', status: 'error' });
            return;
        }
        if (!form.description.trim()) {
            showToast(toast, { title: 'Hata', description: 'Açıklama giriniz.', status: 'error' });
            return;
        }

        setSubmitting(true);

        try {
            // Gerçek projede backend'e POST atılır
            // Şimdilik localStorage'da saklıyoruz
            const newReturn = {
                id: Date.now(),
                orderId: form.orderId,
                reason: form.reason,
                description: form.description,
                status: 'PENDING', // PENDING / APPROVED / REJECTED
                createdAt: new Date().toISOString()
            };

            const savedReturns = JSON.parse(localStorage.getItem(`returns_${user.id}`) || '[]');
            savedReturns.push(newReturn);
            localStorage.setItem(`returns_${user.id}`, JSON.stringify(savedReturns));
            setReturns(savedReturns);

            showToast(toast, {
                title: 'İade Talebi Oluşturuldu',
                description: 'İade talebiniz incelemeye alındı.',
                status: 'success'
            });

            setForm({ orderId: '', reason: '', description: '' });

        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: 'İade talebi oluşturulamadı.',
                status: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge colorScheme="yellow" px={2} py={1} borderRadius="full">⏳ Beklemede</Badge>;
            case 'APPROVED':
                return <Badge colorScheme="green" px={2} py={1} borderRadius="full">✓ Onaylandı</Badge>;
            case 'REJECTED':
                return <Badge colorScheme="red" px={2} py={1} borderRadius="full">✗ Reddedildi</Badge>;
            default:
                return null;
        }
    };

    if (loading) {
        return <Center py={20}><Spinner size="xl" color="blue.500" /></Center>;
    }

    return (
        <Box maxW="800px" mx="auto">
            <Heading size="lg" mb={6}>İade Taleplerim</Heading>

            {/* İade Talebi Formu */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} mb={6}>
                <Heading size="md" mb={4}>Yeni İade Talebi</Heading>

                {orders.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">
                        İade edebileceğiniz tamamlanmış siparişiniz bulunmuyor.
                    </Text>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4} align="stretch">

                            {/* Sipariş seç */}
                            <Box>
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    Sipariş Seçin *
                                </Text>
                                <Select
                                    placeholder="Sipariş seçiniz"
                                    value={form.orderId}
                                    onChange={e => setForm({ ...form, orderId: e.target.value })}
                                >
                                    {orders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            Sipariş #{order.id} — {order.product?.name} — {order.priceTotal?.toLocaleString('tr-TR')} ₺
                                        </option>
                                    ))}
                                </Select>
                            </Box>

                            {/* İade sebebi */}
                            <Box>
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    İade Sebebi *
                                </Text>
                                <Select
                                    placeholder="Sebep seçiniz"
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                >
                                    {RETURN_REASONS.map(reason => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </Select>
                            </Box>

                            {/* Açıklama */}
                            <Box>
                                <Text mb={1} fontWeight="medium" fontSize="sm">
                                    Açıklama *
                                </Text>
                                <Textarea
                                    placeholder="İade talebinizle ilgili detaylı açıklama yazınız..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={4}
                                    resize="vertical"
                                />
                            </Box>

                            <Button
                                type="submit"
                                bg="#0d47a1"
                                color="white"
                                _hover={{ bg: '#1565c0' }}
                                isLoading={submitting}
                                loadingText="Gönderiliyor..."
                                alignSelf="flex-start"
                                px={8}
                            >
                                İade Talebi Gönder
                            </Button>
                        </VStack>
                    </form>
                )}
            </Box>

            {/* Mevcut iade talepleri */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" p={6}>
                <Heading size="md" mb={4}>Taleplerim</Heading>

                {returns.length === 0 ? (
                    <EmptyState
                        icon="↩️"
                        title="İade talebiniz bulunmuyor"
                        description="Henüz bir iade talebi oluşturmadınız."
                    />
                ) : (
                    <VStack spacing={4} align="stretch">
                        {returns.map(ret => (
                            <Box
                                key={ret.id}
                                bg="gray.50"
                                borderRadius="lg"
                                p={4}
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontWeight="bold">
                                        Sipariş #{ret.orderId} İadesi
                                    </Text>
                                    {getStatusBadge(ret.status)}
                                </Flex>
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    <strong>Sebep:</strong> {ret.reason}
                                </Text>
                                <Text fontSize="sm" color="gray.600" mb={1}>
                                    <strong>Açıklama:</strong> {ret.description}
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                    {new Date(ret.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </Box>
                        ))}
                    </VStack>
                )}
            </Box>
        </Box>
    );
}

export default Returns;