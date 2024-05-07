import {ChangeEvent, FormEvent, useState} from "react";
import useRegistrationApi from "./useRegistrationApi";
import useRegistrationValidation from "./useRegistrationValidation";

export interface RegistrationFormState {
    nickname: string
    email: string
    password: string
    confirmPassword: string
}

const useRegistrationForm = () => {
    const {registerUser} = useRegistrationApi();
    const [formData, setFormData] = useState<RegistrationFormState>({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const {formErrors, error, validateForm, setErrorFromServer} = useRegistrationValidation();

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
        const isValidNickname = validateForm('nickname', formData.nickname);
        const isValidEmail = validateForm('email', formData.email);
        const isValidPassword = validateForm('password', formData.password);
        const isValidConfirmPassword = validateForm('confirmPassword', formData.confirmPassword);
        if (isValidNickname && isValidEmail && isValidPassword && isValidConfirmPassword) {
            // Выполняем запрос регистрации
            registerUser(formData).catch(setErrorFromServer);
        }
    };

    return {formData, formErrors, error, handleChange, handleSubmit};
}

export default useRegistrationForm;