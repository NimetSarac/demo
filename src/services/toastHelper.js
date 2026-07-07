// Toast'ı her component'te ayrı ayrı ayarlamak yerine
// merkezi bir helper oluşturuyoruz

export const showToast = (toast, { title, description, status }) => {
    toast({
        title,
        description,
        status, // 'success' | 'error' | 'warning' | 'info'
        duration: 3000,
        isClosable: true,
        position: 'top-right'
    });
};