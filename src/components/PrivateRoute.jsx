import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, adminOnly = false }) {

    const { isLoggedIn, isAdmin } = useAuth();

    // Giriş yapılmamışsa login'e yönlendir
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    // Admin sayfasına normal kullanıcı girmeye çalışıyorsa ana sayfaya yönlendir
    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default PrivateRoute;