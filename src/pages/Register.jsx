import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Input, Heading,
    Text, VStack, Link, useToast
} from '@chakra-ui/react';
import api from '../services/api';
import { showToast } from '../services/toastHelper';

function Register() {

    const [form, setForm] = useState({
        username: '',
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.username.trim()) {
            newErrors.username = 'Kullanıcı adı zorunludur';
        } else if (form.username.length < 3) {
            newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
        }
        if (!form.fullname.trim()) {
            newErrors.fullname = 'Ad soyad zorunludur';
        }
        if (!form.email.trim()) {
            newErrors.email = 'E-posta zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }
        if (!form.password) {
            newErrors.password = 'Şifre zorunludur';
        } else if (form.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }
        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
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
                description: 'Lütfen tüm alanları doğru doldurun.',
                status: 'warning'
            });
            return;
        }

        setLoading(true);

        try {
            await api.post(
                `/api/auth/register?username=${form.username}&email=${form.email}&password=${form.password}`
            );

            showToast(toast, {
                title: 'Kayıt Başarılı',
                description: 'Hesabınız oluşturuldu, giriş sayfasına yönlendiriliyorsunuz.',
                status: 'success'
            });

            // 2 saniye bekle sonra login'e yönlendir
             navigate('/login');

        } catch (err) {
            showToast(toast, {
                title: 'Kayıt Başarısız',
                description: err.response?.data?.message || 'Kayıt olunamadı, tekrar deneyin.',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="450px" mx="auto" mt="40px" p={8} borderRadius="lg" boxShadow="lg" bg="white">
            <Heading size="lg" mb={6} textAlign="center">Kayıt Ol</Heading>

            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>

                    <Box width="100%">
                        <Text mb={1} fontWeight="medium">Kullanıcı Adı *</Text>
                        <Input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Kullanıcı adınızı girin"
                            borderColor={errors.username ? 'red.400' : 'gray.200'}
                        />
                        {errors.username && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.username}</Text>
                        )}
                    </Box>

                    <Box width="100%">
                        <Text mb={1} fontWeight="medium">Ad Soyad *</Text>
                        <Input
                            name="fullname"
                            value={form.fullname}
                            onChange={handleChange}
                            placeholder="Adınızı ve soyadınızı girin"
                            borderColor={errors.fullname ? 'red.400' : 'gray.200'}
                        />
                        {errors.fullname && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.fullname}</Text>
                        )}
                    </Box>

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
                            placeholder="En az 6 karakter"
                            borderColor={errors.password ? 'red.400' : 'gray.200'}
                        />
                        {errors.password && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.password}</Text>
                        )}
                    </Box>

                    <Box width="100%">
                        <Text mb={1} fontWeight="medium">Şifre Tekrar *</Text>
                        <Input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Şifrenizi tekrar girin"
                            borderColor={errors.confirmPassword ? 'red.400' : 'gray.200'}
                        />
                        {errors.confirmPassword && (
                            <Text color="red.500" fontSize="sm" mt={1}>{errors.confirmPassword}</Text>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        bg="#0d47a1"
                        color="white"
                        width="100%"
                        isLoading={loading}
                        loadingText="Kayıt olunuyor..."
                        _hover={{ bg: '#1565c0' }}
                    >
                        Kayıt Ol
                    </Button>
                </VStack>
            </form>

            <Text mt={4} textAlign="center" fontSize="sm">
                Zaten hesabın var mı?{' '}
                <Link as={RouterLink} to="/login" color="blue.600">
                    Giriş Yap
                </Link>
            </Text>
        </Box>
    );
}

export default Register;