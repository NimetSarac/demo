import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {

    const [favorites, setFavorites] = useState([]);
    const { user } = useAuth();
useEffect(() => {
    if (user?.id) {
        fetchFavorites();
    } else {
        setFavorites([]);
    }
}, [user?.id]); 
    const fetchFavorites = async () => {
        try {
            const res = await api.get(`/api/favorites/${user.id}`);
            setFavorites(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const addFavorite = async (productId) => {
        try {
            await api.post(`/api/favorites/${user.id}/${productId}`);
            await fetchFavorites();
        } catch (err) {
            throw err;
        }
    };

    const removeFavorite = async (productId) => {
        try {
            await api.delete(`/api/favorites/${user.id}/${productId}`);
            await fetchFavorites();
        } catch (err) {
            throw err;
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(p => p.id === productId);
    };

    return (
        <FavoriteContext.Provider value={{
            favorites,
            addFavorite,
            removeFavorite,
            isFavorite,
            fetchFavorites
        }}>
            {children}
        </FavoriteContext.Provider>
    );
}

export function useFavorite() {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorite, FavoriteProvider içinde kullanılmalıdır');
    }
    return context;
}