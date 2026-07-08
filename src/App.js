import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Products from './pages/Products';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* Herkese açık rotalar */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />

                    {/* Giriş yapılmış kullanıcıya özel rotalar */}
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />

                    <Route path="/cart" element={
                        <PrivateRoute>
                            <Cart />
                        </PrivateRoute>
                    } />

                    {/* Sadece admin görebilir */}
                    <Route path="/admin" element={
                        <PrivateRoute adminOnly={true}>
                            <Admin />
                        </PrivateRoute>
                    } />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;