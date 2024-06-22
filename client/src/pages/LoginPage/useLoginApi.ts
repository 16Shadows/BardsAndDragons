import {useCallback} from "react";
import {signInError} from "../../utils/errorMessages";
import useApi from "../../http-common";
import {LoginFormState} from "./useLoginForm";
import useSignIn from "../../utils/useSignIn";

const useLoginApi = () => {
    const api = useApi();
    const signIn = useSignIn();

    const loginUser = useCallback(async (
        url: string,
        credentials: {
            email?: string;
            nickname?: string;
            password: string
        }
    ): Promise<string | null> => {
        try {
            const response = await api.post(url, credentials);
            return signIn(response?.data?.token, response?.data?.userState) ? null : signInError;
        } catch (error: any) {
            return error.response?.data?.message || signInError;
        }
    }, [api, signIn, location]);

    const loginByEmail = useCallback(async (formData: LoginFormState): Promise<string | null> => {
        return await loginUser("user/login-by-email", {email: formData.login, password: formData.password});
    }, [loginUser]);

    const loginByNickname = useCallback(async (formData: LoginFormState): Promise<string | null> => {
        return await loginUser("user/login-by-nickname", {nickname: formData.login, password: formData.password});
    }, [loginUser]);

    return {loginByEmail, loginByNickname};
};

export default useLoginApi;
