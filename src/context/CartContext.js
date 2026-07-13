import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

// localStorage sepet yardımcıları
const LOCAL_CART_KEY = 'local_cart';

const getLocalCart = () => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
    } catch {
        return [];
    }
};

const setLocalCart = (items) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
};

const clearLocalCart = () => {
    localStorage.removeItem(LOCAL_CART_KEY);
};

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Kullanıcı durumu değişince sepeti yükle
    useEffect(() => {
        if (user) {
            // Giriş yapıldı — önce backend sepetini çek, sonra localStorage'ı birleştir
            syncCartOnLogin();
        } else {
            // Çıkış yapıldı — localStorage'dan yükle
            setCartItems(getLocalCart());
        }
    }, [user]);

    // Giriş yapınca localStorage sepetini backend ile birleştir
    const syncCartOnLogin = async () => {
        setLoading(true);
        try {
            const localItems = getLocalCart();

            // Backend sepetini çek
            const res = await api.get(`/api/cart/${user.id}`);
            const backendItems = res.data.data?.items || [];

            // localStorage'da ürün varsa backend'e ekle
            if (localItems.length > 0) {
                for (const localItem of localItems) {
                    try {
                        await api.post(
                            `/api/cart/${user.id}/items?productId=${localItem.productId}&quantity=${localItem.quantity}`
                        );
                    } catch (err) {
                        // Stok yetersiz gibi hatalar olabilir, devam et
                        console.warn(`Ürün eklenemedi: ${localItem.productId}`, err);
                    }
                }
                // localStorage'ı temizle
                clearLocalCart();

                // Güncel sepeti tekrar çek
                const updatedRes = await api.get(`/api/cart/${user.id}`);
                setCartItems(updatedRes.data.data?.items || []);
            } else {
                setCartItems(backendItems);
            }
        } catch (err) {
            console.error('Sepet senkronizasyonu başarısız:', err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCart = async () => {
        if (!user) {
            setCartItems(getLocalCart());
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/api/cart/${user.id}`);
            setCartItems(res.data.data?.items || []);
        } catch (err) {
            console.error('Sepet yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sepete ürün ekle
    const addToCart = async (productId, quantity = 1) => {
        if (!user) {
            // Giriş yapılmamış — localStorage'a ekle
            const localCart = getLocalCart();
            const existing = localCart.find(i => i.productId === productId);

            if (existing) {
                existing.quantity += quantity;
            } else {
                localCart.push({ productId, quantity });
            }

            setLocalCart(localCart);
            setCartItems(localCart);
            return true;
        }

        // Giriş yapılmış — backend'e ekle
        try {
            await api.post(
                `/api/cart/${user.id}/items?productId=${productId}&quantity=${quantity}`
            );
            await fetchCart();
            return true;
        } catch (err) {
            throw err;
        }
    };

    // Adet güncelle
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) {
            // localStorage güncelle
            const localCart = getLocalCart();
            const item = localCart.find(i => i.productId === cartItemId);
            if (item) {
                if (newQuantity <= 0) {
                    const filtered = localCart.filter(i => i.productId !== cartItemId);
                    setLocalCart(filtered);
                    setCartItems(filtered);
                } else {
                    item.quantity = newQuantity;
                    setLocalCart(localCart);
                    setCartItems([...localCart]);
                }
            }
            return;
        }

        try {
            await api.put(`/api/cart/${user.id}/items/${cartItemId}?quantity=${newQuantity}`);
            await fetchCart();
        } catch (err) {
            throw err;
        }
    };

    // Ürün sil
    const removeItem = async (cartItemId) => {
        if (!user) {
            const filtered = getLocalCart().filter(i => i.productId !== cartItemId);
            setLocalCart(filtered);
            setCartItems(filtered);
            return;
        }

        try {
            await api.delete(`/api/cart/${user.id}/items/${cartItemId}`);
            await fetchCart();
        } catch (err) {
            throw err;
        }
    };

    // Sepeti temizle
    const clearCart = async () => {
        if (!user) {
            clearLocalCart();
            setCartItems([]);
            return;
        }

        try {
            await api.delete(`/api/cart/${user.id}/clear`);
            setCartItems([]);
        } catch (err) {
            throw err;
        }
    };

    // Hesaplamalar
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.productPrice || item.price || 0;
        return sum + (price * item.quantity);
    }, 0);

    const totalDiscount = 0;
    const total = subtotal - totalDiscount;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            cartCount,
            subtotal,
            totalDiscount,
            total,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart, CartProvider içinde kullanılmalıdır');
    }
    return context;
}