import useApi from "../../http-common";
import useSignIn from "../../utils/useSignIn";
import {signInError, registerError} from "../../utils/errorMessages";
import {RegistrationFormState} from "./useRegistrationForm";
import {useCallback} from "react";

const useLoginApi = () => {
    const api = useApi();
    const signIn = useSignIn();

    const registerUser = useCallback(async (formData: RegistrationFormState): Promise<string | null> => {
        try {
            const response = await api.post('/user/register', {
                nickname: formData.nickname,
                email: formData.email,
                password: formData.password,
            });
            return signIn(response.data.token, response.data.userState) ? null : signInError;
        } catch (error: any) {
            return error.response?.data?.message || registerError;
        }
    }, [api, signIn]);

    return {registerUser};
};

export default useLoginApi;