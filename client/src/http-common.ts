import axios, {AxiosInstance} from "axios";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

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
 * Authorization header updates with useEffect and useAuthHeader hooks.
 *
 * @return {AxiosInstance} The configured axios instance for making API calls.
 * @see https://axios-http.com/docs/example
 */
const useApi = (): AxiosInstance => {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    const location = useLocation();

    // Update authorization header on every authHeader change
    useEffect(() => {
        api.defaults.headers.Authorization = authHeader;
    }, [authHeader]);

    api.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        if (error.response) {
            // If unauthorized, redirect to log in
            if (error.response.status === 401) {
                navigate("/login", {state: {from: location}});
            }
        }
        return Promise.reject(error);
    });

    return api;
}

export default useApi;