import {Navigate, Outlet, useLocation} from "react-router-dom";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";

const ProtectedRoutes = ({fallbackPath}: { fallbackPath: string }) => {
    const location = useLocation();
    const isAuthenticated = useIsAuthenticated()
    return isAuthenticated ? (
        <Outlet/>
    ) : (
        <Navigate to={fallbackPath} state={{from: location}}/>
    );
};

export default ProtectedRoutes;