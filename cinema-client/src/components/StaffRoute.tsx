import {useAuth} from "../context/AuthContext.tsx";
import {Navigate, Outlet, useLocation} from "react-router-dom";


export const StaffRoute = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated || !user?.isStaff) {
        const location = useLocation();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}