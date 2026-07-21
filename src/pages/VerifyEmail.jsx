import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Heading, Text, VStack,
    HStack, PinInput, PinInputField,
    Alert, AlertIcon, Link, useToast
} from '@chakra-ui/react';
import api from '../services/api';
import { showToast } from '../services/toastHelper';

function VerifyEmail() {

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    // Register sayfasından email gelir
    const email = location.state?.email || '';

    // Geri sayım
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleVerify = async () => {
        if (code.length !== 6) {
            showToast(toast, {
                title: 'Hata',
                description: '6 haneli kodu giriniz.',
                status: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            await api.post(`/api/auth/verify-email?email=${email}&code=${code}`);
            showToast(toast, {
                title: 'E-posta Doğrulandı!',
                description: 'Hesabınız aktifleştirildi. Giriş yapabilirsiniz.',
                status: 'success'
            });
            navigate('/login');
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: err.response?.data?.message || 'Geçersiz kod.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await api.post(`/api/auth/resend-verification?email=${email}`);
            showToast(toast, {
                title: 'Kod Gönderildi',
                description: 'Yeni doğrulama kodu e-posta adresinize gönderildi.',
                status: 'success'
            });
            setCountdown(60);
            setCanResend(false);
            setCode('');
        } catch (err) {
            showToast(toast, {
                title: 'Hata',
                description: 'Kod gönderilemedi.',
                status: 'error'
            });
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) {
        return (
            <Box maxW="400px" mx="auto" mt="60px" p={8} textAlign="center">
                <Text color="red.500">Geçersiz erişim. Lütfen kayıt sayfasından devam edin.</Text>
                <Button as={RouterLink} to="/register" mt={4} colorScheme="blue">
                    Kayıt Ol
                </Button>
            </Box>
        );
    }

    return (
        <Box maxW="400px" mx="auto" mt="60px" p={8} borderRadius="lg" boxShadow="lg" bg="white">
            <VStack spacing={4}>
                <Text fontSize="50px">📧</Text>
                <Heading size="lg" textAlign="center">E-postanı Doğrula</Heading>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                    <strong>{email}</strong> adresine 6 haneli doğrulama kodu gönderdik.
                </Text>

                <Alert status="info" borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    Spam klasörünü de kontrol etmeyi unutmayın.
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
                    bg="#0d47a1"
                    color="white"
                    width="100%"
                    _hover={{ bg: '#1565c0' }}
                    onClick={handleVerify}
                    isLoading={loading}
                    loadingText="Doğrulanıyor..."
                    isDisabled={code.length !== 6}
                >
                    Doğrula
                </Button>

                {/* Kodu tekrar gönder */}
                <Box textAlign="center">
                    {canResend ? (
                        <Button
                            variant="link"
                            color="blue.500"
                            onClick={handleResend}
                            isLoading={resendLoading}
                        >
                            Kodu tekrar gönder
                        </Button>
                    ) : (
                        <Text fontSize="sm" color="gray.500">
                            Kodu tekrar gönder ({countdown}s)
                        </Text>
                    )}
                </Box>

                <Link as={RouterLink} to="/login" fontSize="sm" color="blue.600">
                    ← Giriş sayfasına dön
                </Link>
            </VStack>
        </Box>
    );
}

export default VerifyEmail;