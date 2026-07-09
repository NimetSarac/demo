import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Kullanıcı giriş yapınca sepeti yükle
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartId(null);
        }
    }, [user]);

    const fetchCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get(`/api/cart/${user.id}`);
            const cart = res.data.data;
            setCartId(cart.id);
            setCartItems(cart.items || []);
        } catch (err) {
            console.error('Sepet yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sepete ürün ekle
    const addToCart = async (productId, quantity = 1) => {
        if (!user) return false;
        try {
            await api.post(`/api/cart/${user.id}/items?productId=${productId}&quantity=${quantity}`);
            await fetchCart();
            return true;
        } catch (err) {
            throw err;
        }
    };

    // Adet güncelle
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) return;
        try {
            await api.put(`/api/cart/${user.id}/items/${cartItemId}?quantity=${newQuantity}`);
            await fetchCart();
        } catch (err) {
            throw err;
        }
    };

    // Ürün sil
    const removeItem = async (cartItemId) => {
        if (!user) return;
        try {
            await api.delete(`/api/cart/${user.id}/items/${cartItemId}`);
            await fetchCart();
        } catch (err) {
            throw err;
        }
    };

    // Sepeti temizle
    const clearCart = async () => {
        if (!user) return;
        try {
            await api.delete(`/api/cart/${user.id}/clear`);
            setCartItems([]);
        } catch (err) {
            throw err;
        }
    };

    // Hesaplamalar
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.productPrice * item.quantity), 0
    );

    const totalDiscount = 0; // İleride kupon kodu eklenebilir

    const total = subtotal - totalDiscount;

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartId,
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