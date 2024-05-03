import axios from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import {useEffect} from "react";

export const api = axios.create({
    baseURL: '/api/v1/',
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
    }
});

const useApi = () => {
    const authHeader = useAuthHeader();

    useEffect(() => {
        api.defaults.headers.Authorization = authHeader;
    }, [authHeader]);

    return api;
}

export default useApi;