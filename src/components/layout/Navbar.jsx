import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';

function Navbar() {

    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // localStorage'dan kullanıcı bilgisini al
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        // Giriş yapılmışsa sepet ürün sayısını çek
        if (user) {
            api.get(`/api/cart/${user.id}`)
                .then(response => {
                    const items = response.data.data.items;
                    setCartCount(items ? items.length : 0);
                })
                .catch(() => setCartCount(0));
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (err) {
            console.error('Çıkış hatası:', err);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 30px',
            backgroundColor: '#1a1a2e',
            color: 'white'
        }}>
            {/* Logo */}
            <Link to="/" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '22px',
                fontWeight: 'bold'
            }}>
                🛒 E-Ticaret
            </Link>

            {/* Kategori Menüsü */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    Ana Sayfa
                </Link>
                <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>
                    Ürünler
                </Link>
                {user?.role === 'ADMIN' && (
                    <Link to="/admin" style={{ color: '#ffd700', textDecoration: 'none' }}>
                        Admin Panel
                    </Link>
                )}
            </div>

            {/* Sağ Taraf: Sepet + Giriş/Çıkış */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                {/* Sepet ikonu — sadece giriş yapılmışsa */}
                {user && (
                    <Link to="/cart" style={{
                        color: 'white',
                        textDecoration: 'none',
                        position: 'relative'
                    }}>
                        🛒
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* Giriş yapılmışsa kullanıcı adı + çıkış */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Link to="/profile" style={{ color: '#90caf9', textDecoration: 'none' }}>
                            👤 {user.username}
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#e53935',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Çıkış
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/login" style={{
                            color: 'white',
                            textDecoration: 'none',
                            padding: '6px 12px',
                            border: '1px solid white',
                            borderRadius: '4px'
                        }}>
                            Giriş
                        </Link>
                        <Link to="/register" style={{
                            background: '#1976d2',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px'
                        }}>
                            Kayıt Ol
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;