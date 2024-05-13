import {ChangeEvent, FormEvent, useState} from "react";
import useLoginApi from "./useLoginApi";
import useLoginValidation from "./useLoginValidation";
import {LoginType} from "../../utils/accountValidation";

export interface LoginFormState {
    login: string;
    password: string;
}

const useLoginForm = () => {
    const {loginByEmail, loginByNickname} = useLoginApi();
    const [formData, setFormData] = useState<LoginFormState>({login: '', password: ''});
    const {formErrors, error, loginLabel, loginType, validateForm, setErrorFromServer} = useLoginValidation();

    // Обработка изменений полей формы
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]: value}));
        validateForm(name, value);
        setErrorFromServer(null);
    };

    // Обработка отправки формы
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Проверка полей формы
        const isValidLogin = validateForm('login', formData.login);
        const isValidPassword = validateForm('password', formData.password);
        if (isValidLogin && isValidPassword) {
            // Выполняем запрос в зависимости от типа логина
            switch (loginType) {
                case LoginType.Email:
                    loginByEmail(formData).catch(setErrorFromServer);
                    break;
                case LoginType.Nickname:
                    loginByNickname(formData).catch(setErrorFromServer);
            }
        }
    };

    return {formData, formErrors, error, loginLabel, handleChange, handleSubmit};
};

export default useLoginForm;
