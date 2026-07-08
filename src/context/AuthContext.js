import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sayfa yenilenince localStorage'dan yükle
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (err) {
                // Bozuk veri varsa temizle
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, jwtToken) => {
        // Sadece güvenli bilgileri kaydet — şifre ASLA yazılmaz
        const safeUser = {
            id: userData.userId || userData.id,
            username: userData.username,
            role: userData.role || 'CUSTOMER'
        };

        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(safeUser));

        setUser(safeUser);
        setToken(jwtToken);
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout hatası:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        }
    };

    const isLoggedIn = () => user !== null;
    const isAdmin = () => user && user.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isLoggedIn,
            isAdmin
        }}>
            {/* loading true iken hiçbir şey render etme
                böylece sayfa yenilenince localStorage okunmadan
                PrivateRoute kullanıcıyı login'e atamaz */}
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
    }
    return context;
}