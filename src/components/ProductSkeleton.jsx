import { Box, Skeleton, SkeletonText, VStack } from '@chakra-ui/react';

function ProductSkeleton() {
    return (
        <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            overflow="hidden"
        >
            {/* Resim skeleton */}
            <Skeleton height="180px" />

            <VStack p={4} align="start" spacing={3}>
                {/* Kategori badge skeleton */}
                <Skeleton height="20px" width="80px" borderRadius="full" />

                {/* Ürün adı skeleton */}
                <SkeletonText noOfLines={2} spacing={2} width="100%" />

                {/* Fiyat skeleton */}
                <Skeleton height="28px" width="120px" />

                {/* Stok skeleton */}
                <Skeleton height="16px" width="100px" />

                {/* Buton skeleton */}
                <Skeleton height="32px" width="100%" borderRadius="md" />
            </VStack>
        </Box>
    );
}

export default ProductSkeleton;