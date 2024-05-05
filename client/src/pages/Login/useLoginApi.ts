import useApi from "../../http-common";
import {LoginFormState} from "./useLoginForm";
import {useLocation, useNavigate} from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import {UserData} from "../../models/UserData";
import {signInError} from "../../utils/errorMessages";

const useLoginApi = () => {
    const api = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const signIn = useSignIn<UserData>();

    const loginUser = (formData: LoginFormState): Promise<string | null> => {
        return new Promise((resolve, reject) =>
            api.post('user/login', JSON.stringify(formData))
                .then((response) => {
                    // Устанавливаем токен
                    if (signIn({
                        auth: {
                            token: response?.data?.token,
                            type: 'Bearer'
                        },
                        userState: response?.data?.userState
                    })) {
                        const from = location?.state?.from || '/';
                        navigate(from);
                        resolve(null); // Возвращаем успех, если вход успешен
                    } else {
                        reject(signInError);
                    }
                })
                .catch((error) => {
                    const errorMessage = error.response?.data?.message || signInError; // Обработка ошибки
                    reject(errorMessage); // Возвращаем сообщение об ошибке
                }));
    };

    return {loginUser};
};

export default useLoginApi;