import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Input, Heading, Text, VStack, Link, useToast } from '@chakra-ui/react';
import api from '../services/api';
import { showToast } from '../services/toastHelper';
import { useAuth } from '../context/AuthContext';

function Login() {

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) {
            newErrors.email = 'E-posta zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }
        if (!form.password) {
            newErrors.password = 'Şifre zorunludur';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast(toast, {
                title: 'Form Hatası',
                description: 'Lütfen tüm alanları doldurun.',
                status: 'warning'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                `/api/auth/login?email=${form.email}&password=${form.password}`
            );

            const data = response.data.data;
            console.log('Login response:', data);

            login(data, data.token);

            showToast(toast, {
                title: 'Giriş Başarılı',
                description: 'Hoşgeldiniz!',
                status: 'success'
            });

            navigate('/');

        } catch (err) {
            showToast(toast, {
                title: 'Giriş Başarısız',
                description: err.response?.status === 401
                    ? 'E-posta veya şifre hatalı.'
                    : 'Bir hata oluştu, tekrar deneyin.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="60px" p={8} borderRadius="lg" boxShadow="lg" bg="white">
            <Heading size="lg" mb={6} textAlign="center">Giriş Yap</Heading>

            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <Box width="100%">
                        <Text mb={1} fontWeight="medium">E-posta *</Text>
                        <Input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="E-posta adresinizi girin"
                            borderColor={errors.email ? 'red.400' : 'gray.200'}
                        />
                        {errors.email && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.email}</Text>
                        )}
                    </Box>

                    <Box width="100%">
                        <Text mb={1} fontWeight="medium">Şifre *</Text>
                        <Input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Şifrenizi girin"
                            borderColor={errors.password ? 'red.400' : 'gray.200'}
                        />
                        {errors.password && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.password}</Text>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        bg="#0d47a1"
                        color="white"
                        width="100%"
                        isLoading={loading}
                        loadingText="Giriş yapılıyor..."
                        _hover={{ bg: '#1565c0' }}
                    >
                        Giriş Yap
                    </Button>
                </VStack>
            </form>

            <Text mt={4} textAlign="center" fontSize="sm">
                Hesabın yok mu?{' '}
                <Link as={RouterLink} to="/register" color="blue.600">
                    Kayıt Ol
                </Link>
            </Text>
        </Box>
    );
}

export default Login;