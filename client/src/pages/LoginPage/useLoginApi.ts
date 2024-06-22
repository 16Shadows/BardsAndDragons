import {useCallback} from "react";
import {getHomeRoute} from "../../components/routes/Navigation";
import {signInError} from "../../utils/errorMessages";
import useApi from "../../http-common";
import {useLocation, useNavigate} from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import {LoginFormState} from "./useLoginForm";

const useLoginApi = () => {
    const api = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const signIn = useSignIn();

    const loginUser = useCallback(async (
        url: string,
        credentials: { email?: string; nickname?: string; password: string }
    ): Promise<string | null> => {
        try {
            const response = await api.post(url, credentials);
            if (signIn({auth: {token: response?.data?.token, type: "Bearer"}, userState: response?.data?.userState})) {
                const from = location?.state?.from || getHomeRoute();
                navigate(from, {replace: true});
                return null;
            } else {
                return signInError;
            }
        } catch (error: any) {
            return error.response?.data?.message || signInError;
        }
    }, [api, signIn, location, navigate]);

    const loginByEmail = useCallback(async (formData: LoginFormState): Promise<string | null> => {
        return await loginUser("user/login-by-email", {email: formData.login, password: formData.password});
    }, [loginUser]);

    const loginByNickname = useCallback(async (formData: LoginFormState): Promise<string | null> => {
        return await loginUser("user/login-by-nickname", {nickname: formData.login, password: formData.password});
    }, [loginUser]);

    return {loginByEmail, loginByNickname};
};

export default useLoginApi;
