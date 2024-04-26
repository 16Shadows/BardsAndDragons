import axios from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

export const api = axios.create({
    baseURL: '/api/v1/',
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
    }
});

const useApi = () => {
    const authHeader = useAuthHeader();

    api.interceptors.request.use(
        (config) => {
            config.headers.Authorization = authHeader;
            return config;
        },
        (error) => Promise.reject(error),
    );

    return api;
}

export default useApi;