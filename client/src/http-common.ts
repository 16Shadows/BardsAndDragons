import axios, {AxiosInstance} from 'axios';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import {useEffect} from "react";

/**
 * Creates an instance of the API with specified baseURL and headers.
 *
 * Authorization header updates with useEffect and useAuthHeader hooks.
 *
 * @return {AxiosInstance} The configured axios instance for making API calls.
 * @see https://axios-http.com/docs/example
 */
const useApi = (): AxiosInstance => {
    const api = axios.create({
        baseURL: '/api/v1/',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }
    });

    const authHeader = useAuthHeader();

    useEffect(() => {
        api.defaults.headers.Authorization = authHeader;
    }, [authHeader]);

    return api;
}

export default useApi;