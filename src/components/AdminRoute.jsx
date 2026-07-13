import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
    const { user, isLoggedIn } = useAuth();

    // Giriş yapılmamışsa login'e yönlendir
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    // Admin değilse ana sayfaya yönlendir
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;