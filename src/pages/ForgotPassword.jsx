import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box, Button, Input, Heading, Text,
    VStack, Link, useToast, PinInput,
    PinInputField, HStack, Alert, AlertIcon
} from '@chakra-ui/react';
import api from '../services/api';
import { showToast } from '../services/toastHelper';

function ForgotPassword() {

    const [step, setStep] = useState(1); // 1: email, 2: kod, 3: yeni şifre
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    // Adım 1 — E-posta gönder
    const handleSendCode = async () => {
        if (!email.trim()) {
            showToast(toast, { title: 'Hata', description: 'E-posta giriniz.', status: 'error' });
            return;
        }
        setLoading(true);
        try {
            await api.post(`/api/auth/forgot-password?email=${email}`);
            showToast(toast, {
                title: 'Kod Gönderildi',
                description: 'E-posta adresinize 6 haneli kod gönderildi.',
                status: 'success'
            });
            setStep(2);
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'E-posta gönderilemedi.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Adım 2 — Kodu doğrula
    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            showToast(toast, { title: 'Hata', description: '6 haneli kodu giriniz.', status: 'error' });
            return;
        }
        setLoading(true);
        try {
            await api.post(`/api/auth/verify-reset-code?email=${email}&token=${code}`);
            showToast(toast, { title: 'Kod Doğrulandı', status: 'success' });
            setStep(3);
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Geçersiz veya süresi dolmuş kod.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Adım 3 — Yeni şifre belirle
    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            showToast(toast, { title: 'Hata', description: 'Şifre en az 6 karakter olmalıdır.', status: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(toast, { title: 'Hata', description: 'Şifreler eşleşmiyor.', status: 'error' });
            return;
        }
        setLoading(true);
        try {
            await api.post(
                `/api/auth/reset-password?email=${email}&token=${code}&newPassword=${newPassword}`
            );
            showToast(toast, {
                title: 'Şifre Güncellendi',
                description: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.',
                status: 'success'
            });
            navigate('/login');
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Şifre güncellenemedi.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="60px" p={8} borderRadius="lg" boxShadow="lg" bg="white">

            {/* Adım göstergesi */}
            <HStack justify="center" mb={6} spacing={2}>
                {[1, 2, 3].map(s => (
                    <Box
                        key={s}
                        w="30px" h="30px"
                        borderRadius="full"
                        bg={step >= s ? '#0d47a1' : 'gray.200'}
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        fontWeight="bold"
                    >
                        {s}
                    </Box>
                ))}
            </HStack>

            {/* Adım 1 — E-posta */}
            {step === 1 && (
                <VStack spacing={4}>
                    <Heading size="lg" textAlign="center">Şifremi Unuttum</Heading>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        E-posta adresinize şifre sıfırlama kodu göndereceğiz.
                    </Text>
                    <Box width="100%">
                        <Text mb={1} fontWeight="medium" fontSize="sm">E-posta *</Text>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="E-posta adresinizi girin"
                            onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                        />
                    </Box>
                    <Button
                        bg="#0d47a1" color="white" width="100%"
                        _hover={{ bg: '#1565c0' }}
                        onClick={handleSendCode}
                        isLoading={loading}
                        loadingText="Gönderiliyor..."
                    >
                        Kod Gönder
                    </Button>
                </VStack>
            )}

            {/* Adım 2 — Kod doğrulama */}
            {step === 2 && (
                <VStack spacing={4}>
                    <Heading size="lg" textAlign="center">Kodu Girin</Heading>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin.
                    </Text>
                    <Alert status="info" borderRadius="md" fontSize="sm">
                        <AlertIcon />
                        Kod 15 dakika geçerlidir.
                    </Alert>
                    <Box>
                        <HStack justify="center">
                            <PinInput
                                value={code}
                                onChange={setCode}
                                size="lg"
                                otp
                            >
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                            </PinInput>
                        </HStack>
                    </Box>
                    <Button
                        bg="#0d47a1" color="white" width="100%"
                        _hover={{ bg: '#1565c0' }}
                        onClick={handleVerifyCode}
                        isLoading={loading}
                        loadingText="Doğrulanıyor..."
                    >
                        Kodu Doğrula
                    </Button>
                    <Button
                        variant="ghost" size="sm" width="100%"
                        onClick={() => { setStep(1); setCode(''); }}
                    >
                        ← Geri Dön
                    </Button>
                    <Button
                        variant="link" size="sm" color="blue.500"
                        onClick={handleSendCode}
                        isLoading={loading}
                    >
                        Kodu tekrar gönder
                    </Button>
                </VStack>
            )}

            {/* Adım 3 — Yeni şifre */}
            {step === 3 && (
                <VStack spacing={4}>
                    <Heading size="lg" textAlign="center">Yeni Şifre</Heading>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        Yeni şifrenizi belirleyin.
                    </Text>
                    <Box width="100%">
                        <Text mb={1} fontWeight="medium" fontSize="sm">Yeni Şifre *</Text>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                        />
                    </Box>
                    <Box width="100%">
                        <Text mb={1} fontWeight="medium" fontSize="sm">Şifre Tekrar *</Text>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                        />
                    </Box>
                    <Button
                        bg="#0d47a1" color="white" width="100%"
                        _hover={{ bg: '#1565c0' }}
                        onClick={handleResetPassword}
                        isLoading={loading}
                        loadingText="Güncelleniyor..."
                    >
                        Şifremi Güncelle
                    </Button>
                </VStack>
            )}

            <Text mt={4} textAlign="center" fontSize="sm">
                <Link as={RouterLink} to="/login" color="blue.600">
                    ← Giriş sayfasına dön
                </Link>
            </Text>
        </Box>
    );
}

export default ForgotPassword;