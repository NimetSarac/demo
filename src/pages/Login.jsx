import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();  // sayfanın yenilenmesini engelle
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(
                `/api/auth/login?username=${username}&password=${password}`
            );

            // Backend ApiResponse formatında dönüyor: response.data.data
            const user = response.data.data;
            console.log('Giriş başarılı:', user);

            // Kullanıcı bilgisini localStorage'a kaydet
            localStorage.setItem('user', JSON.stringify(user));

            // Ana sayfaya yönlendir
            navigate('/');

        } catch (err) {
            // 401 — yanlış şifre/kullanıcı adı
            if (err.response?.status === 401) {
                setError('Kullanıcı adı veya şifre hatalı.');
            } else {
                setError('Bir hata oluştu, tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Giriş Yap</h2>

            {error && (
                <p style={{ color: 'red', background: '#fff0f0', padding: '10px' }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Kullanıcı Adı:</label>
                    <br />
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Şifre:</label>
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
                >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>

            <p style={{ marginTop: '15px' }}>
                Hesabın yok mu? <a href="/register">Kayıt Ol</a>
            </p>
        </div>
    );
}

export default Login;