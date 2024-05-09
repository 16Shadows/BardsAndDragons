import {useState} from "react";
import {
    PasswordType,
    validateEmail,
    validateNickname,
    validatePassword
} from "../../utils/accountValidation";
import {
    emailAlreadyUseError,
    invalidEmailError,
    invalidNicknameError,
    nicknameAlreadyUseError,
    notFilledError, passwordMustContainError,
    passwordRequiredError, passwordsNotMatchError
} from "../../utils/errorMessages";
import {RegistrationFormState} from "./useRegistrationForm";

const useRegistrationValidation = (formData: RegistrationFormState) => {
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<RegistrationFormState>({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Установка ошибки email
    const setEmailError = (isValid: boolean) => {
        if (isValid) {
            setFormErrors((prevState) => ({...prevState, email: ''}));
        } else {
            setFormErrors((prevState) => ({...prevState, email: invalidEmailError}));
        }
    }

    // Установка ошибки никнейма
    const setNicknameError = (isValid: boolean) => {
        if (isValid) {
            setFormErrors((prevState) => ({...prevState, nickname: ''}));
        } else {
            setFormErrors((prevState) => ({...prevState, nickname: invalidNicknameError}));
        }
    }

    // Установка ошибки пароля
    const setPasswordError = (value: PasswordType) => {
        switch (value) {
            case PasswordType.Password:
                setFormErrors((prevState) => ({...prevState, password: ''}));
                break;
            case PasswordType.PasswordRequiredError:
                setFormErrors((prevState) => ({...prevState, password: passwordRequiredError}));
                break;
            case PasswordType.InvalidPasswordError:
                setFormErrors((prevState) => ({...prevState, password: passwordMustContainError}));
                break;
            default:
                setFormErrors((prevState) => ({...prevState, password: ''}));
                break;
        }
    }

    // Установка ошибки с сервера
    const setErrorFromServer = (message: string | null) => {
        switch (message) {
            case 'NotFilled':
                setError(notFilledError);
                break;
            case 'nicknameAlreadyUse':
                setError(nicknameAlreadyUseError);
                break;
            case 'emailAlreadyUse':
                setError(emailAlreadyUseError);
                break;
            default:
                setError(message);
                break;
        }
    }

    const setConfirmPasswordError = (name: string, value: string) => {
        let {password, confirmPassword} = formData;
        switch (name) {
            case 'password':
                password = value;
                break;
            case 'confirmPassword':
                confirmPassword = value;
                break;
        }

        if (password !== confirmPassword) {
            setFormErrors((prevState) => ({...prevState, confirmPassword: passwordsNotMatchError}));
        } else {
            setFormErrors((prevState) => ({...prevState, confirmPassword: ''}));
        }
    }

    // Валидация поля формы
    const validateInputField = (name: string, value: string): boolean => {
        switch (name) {
            case 'email':
                const isEmailValid = validateEmail(value);
                setEmailError(isEmailValid);
                return isEmailValid;
            case 'nickname':
                const isNicknameValid = validateNickname(value);
                setNicknameError(isNicknameValid);
                return isNicknameValid;
            case 'password':
                const passwordType = validatePassword(value);
                setPasswordError(passwordType);
                setConfirmPasswordError(name, value);
                return passwordType === PasswordType.Password;
            case 'confirmPassword':
                setConfirmPasswordError(name, value);
                return value === formData.password;
        }

        return false;
    };

    return {formErrors, error, validateInputField, setErrorFromServer};
}

export default useRegistrationValidation;