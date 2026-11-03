import {Navigate, Outlet, useLocation} from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        const location = useLocation();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};