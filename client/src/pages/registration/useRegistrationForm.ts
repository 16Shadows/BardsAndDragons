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
    const [formData, setFormData] = useState<RegistrationFormState>({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const {formErrors, error, validateInputField, setErrorFromServer} = useRegistrationValidation(formData);
    const {registerUser} = useRegistrationApi();

    // Обработка изменений полей формы
    const handleChange = ({target}: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = target;
        setFormData((prevState) => ({...prevState, [name]: value}));
        validateInputField(name, value);
        setErrorFromServer(null);
    };

    // Обработка отправки формы
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Проверка полей формы
        const isValidNickname = validateInputField('nickname', formData.nickname);
        const isValidEmail = validateInputField('email', formData.email);
        const isValidPassword = validateInputField('password', formData.password);
        const isValidConfirmPassword = validateInputField('confirmPassword', formData.confirmPassword);
        if (isValidNickname && isValidEmail && isValidPassword && isValidConfirmPassword) {
            // Выполняем запрос регистрации
            registerUser(formData)
                .catch(setErrorFromServer);
        }
    };

    return {formData, formErrors, error, handleChange, handleSubmit};
}

export default useRegistrationForm;