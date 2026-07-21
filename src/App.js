import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/admin/Orders';
import Returns from './pages/Returns';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReturns from './pages/admin/AdminReturns';
import AdminProducts from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import ProductDetail from "./pages/ProductDetail";
import Favorites from './pages/Favorites';
import ForgotPassword from './pages/ForgotPassword';
 import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Normal sayfalar */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
        {/* Giriş gerektiren sayfalar */}
        <Route path="/profile" element={
          <Layout><PrivateRoute><Profile /></PrivateRoute></Layout>
        } />
        <Route path="/cart" element={
          <Layout><Cart /></Layout>
        } />
        <Route path="/checkout" element={
          <Layout><PrivateRoute><Checkout /></PrivateRoute></Layout>
        } />
        <Route path="/orders" element={
          <Layout><PrivateRoute><OrderHistory /></PrivateRoute></Layout>
        } />
        <Route path="/returns" element={
          <Layout><PrivateRoute><Returns /></PrivateRoute></Layout>
        } />
        <Route path="/favorites" element={
          <Layout><PrivateRoute><Favorites /></PrivateRoute></Layout>
        } />

        <Route path="/verify-email" element={
          <Layout><VerifyEmail /></Layout>} />

        {/* Admin sayfalar */}
        <Route path="/admin" element={
          <AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute><AdminLayout><Categories /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/returns" element={
          <AdminRoute><AdminLayout><AdminReturns /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><AdminLayout><div>Kullanıcılar</div></AdminLayout></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminLayout><div>Siparişler</div></AdminLayout></AdminRoute>
        } />
        import ProductDetail from './pages/ProductDetail';

        <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;