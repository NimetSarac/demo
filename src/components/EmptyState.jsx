import { Box, Text, Button, VStack } from '@chakra-ui/react';

function EmptyState({ icon, title, description, buttonText, onButtonClick }) {
    return (
        <Box
            textAlign="center"
            py={16}
            px={8}
        >
            <VStack spacing={4}>
                <Text fontSize="64px">{icon || '🔍'}</Text>
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    {title || 'Sonuç bulunamadı'}
                </Text>
                <Text fontSize="md" color="gray.500" maxW="400px">
                    {description || 'Aradığınız kriterlere uygun içerik bulunamadı.'}
                </Text>
                {buttonText && onButtonClick && (
                    <Button
                        bg="#0d47a1"
                        color="white"
                        _hover={{ bg: '#1565c0' }}
                        onClick={onButtonClick}
                        mt={2}
                    >
                        {buttonText}
                    </Button>
                )}
            </VStack>
        </Box>
    );
}

export default EmptyState;