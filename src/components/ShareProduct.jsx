import {
    Box, Button, HStack, Text, Tooltip,
    Popover, PopoverTrigger, PopoverContent,
    PopoverBody, VStack, useToast
} from '@chakra-ui/react';
import { showToast } from '../services/toastHelper';

function ShareProduct({ product }) {

    const toast = useToast();
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const shareText = `${product.name} - ${product.price?.toLocaleString('tr-TR')} ₺`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(productUrl);
        showToast(toast, {
            title: 'Link kopyalandı!',
            description: 'Ürün linki panoya kopyalandı.',
            status: 'success'
        });
    };

    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + productUrl)}`;
        window.open(url, '_blank');
    };

    const handleTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank');
    };

    const handleFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank');
    };

    return (
        <Popover placement="top">
            <PopoverTrigger>
                <Button
                    size="sm"
                    variant="outline"
                    colorScheme="gray"
                >
                    📤 Paylaş
                </Button>
            </PopoverTrigger>
            <PopoverContent w="200px" borderRadius="xl" boxShadow="lg">
                <PopoverBody p={3}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={2}>
                        PAYLAŞ
                    </Text>
                    <VStack spacing={2} align="stretch">
                        <Button
                            size="sm"
                            bg="#25D366"
                            color="white"
                            _hover={{ bg: '#128C7E' }}
                            onClick={handleWhatsApp}
                            leftIcon={<Text>💬</Text>}
                        >
                            WhatsApp
                        </Button>
                        <Button
                            size="sm"
                            bg="#1DA1F2"
                            color="white"
                            _hover={{ bg: '#0d8fd9' }}
                            onClick={handleTwitter}
                            leftIcon={<Text>🐦</Text>}
                        >
                            Twitter
                        </Button>
                        <Button
                            size="sm"
                            bg="#1877F2"
                            color="white"
                            _hover={{ bg: '#0d6fd9' }}
                            onClick={handleFacebook}
                            leftIcon={<Text>📘</Text>}
                        >
                            Facebook
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyLink}
                            leftIcon={<Text>🔗</Text>}
                        >
                            Linki Kopyala
                        </Button>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
}

export default ShareProduct;