import axios, {AxiosInstance} from "axios";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import {getLoginPageRoute} from "./components/routes/Navigation";

// Create axios instance
const api = axios.create({
    baseURL: '/api/v1/',
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Creates an instance of the API with specified baseURL and headers.
 *
 * Authorization header updates with useEffect hook which depends on useAuthHeader hook.
 *
 * @return {AxiosInstance} The configured axios instance for making API calls.
 * @see https://axios-http.com/docs/example
 */
const useApi = (): AxiosInstance => {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    const location = useLocation();
    const signOut = useSignOut();

    // Update authorization header on every authHeader change
    useEffect(() => {
        api.defaults.headers.Authorization = authHeader;
    }, [authHeader]);

    useEffect(() => {
        // Add an interceptor to handle unauthorized responses
        const interceptor = api.interceptors.response.use(
            response => response,
            error => {
                // If unauthorized, redirect to log in
                if (error.response?.status === 401) {
                    signOut();
                    navigate(getLoginPageRoute(), {state: {from: location}});
                }
                return Promise.reject(error);
            }
        );
        // Eject the interceptor when the component is unmounted to prevent memory leaks
        return () => api.interceptors.response.eject(interceptor);
    }, [navigate, location, signOut]);

    return api;
}

export default useApi;