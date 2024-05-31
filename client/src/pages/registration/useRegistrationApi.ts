import useApi from "../../http-common";
import {useLocation, useNavigate} from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import {UserData} from "../../models/UserData";
import {signInError, registerError} from "../../utils/errorMessages";
import {RegistrationFormState} from "./useRegistrationForm";

const useLoginApi = () => {
    const api = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const signIn = useSignIn<UserData>();

    const registerUser = (formData: RegistrationFormState): Promise<string | null> => {
        return new Promise((resolve, reject) =>
            api.post('/user/register', {
                nickname: formData.nickname,
                email: formData.email,
                password: formData.password,
            })
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
                        navigate(from, {replace: true});
                        resolve(null); // Возвращаем успех, если вход успешен
                    } else {
                        reject(signInError);
                    }
                })
                .catch((error) => {
                    const errorMessage = error.response?.data?.message || registerError; // Обработка ошибки
                    reject(errorMessage); // Возвращаем сообщение об ошибке
                }));
    }

    return {registerUser};
};

export default useLoginApi;