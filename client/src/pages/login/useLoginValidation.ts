import {useEffect, useState} from "react";
import {LoginType, PasswordType, validateLogin, validatePassword} from "../../utils/accountValidation";
import {
    invalidLoginError,
    invalidPasswordError,
    loginRequiredError, notFilledError,
    passwordRequiredError, userNotFoundError, wrongPasswordError
} from "../../utils/errorMessages";
import {LoginFormState} from "./useLoginForm";

const useLoginValidation = () => {
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<LoginFormState>({login: '', password: ''});
    const [loginLabel, setLoginLabel] = useState<string>('');
    const [loginType, setLoginType] = useState<LoginType | null>(null);
    const [passwordType, setPasswordType] = useState<PasswordType | null>(null);

    // Константы для лейбла логина
    const nicknameLabel = 'Ник';
    const emailLabel = 'Email';
    const emailOrNicknameLabel = 'Email / Ник';

    // Изменение лейбла логина и установка ошибки
    useEffect(() => {
        switch (loginType) {
            case LoginType.Email:
                setLoginLabel(emailLabel);
                setFormErrors((prevState) => ({...prevState, login: ''}));
                break;
            case LoginType.Nickname:
                setLoginLabel(nicknameLabel);
                setFormErrors((prevState) => ({...prevState, login: ''}));
                break;
            case LoginType.LoginRequiredError:
                setLoginLabel(emailOrNicknameLabel);
                setFormErrors((prevState) => ({...prevState, login: loginRequiredError}));
                break;
            case LoginType.InvalidLoginError:
                setLoginLabel(emailOrNicknameLabel);
                setFormErrors((prevState) => ({...prevState, login: invalidLoginError}));
                break;
            default:
                setLoginLabel(emailOrNicknameLabel);
                setFormErrors((prevState) => ({...prevState, login: ''}));
                break;
        }
    }, [loginType]);

    // Изменение ошибки пароля
    useEffect(() => {
        switch (passwordType) {
            case PasswordType.Password:
                setFormErrors((prevState) => ({...prevState, password: ''}));
                break;
            case PasswordType.PasswordRequiredError:
                setFormErrors((prevState) => ({...prevState, password: passwordRequiredError}));
                break;
            case PasswordType.InvalidPasswordError:
                setFormErrors((prevState) => ({...prevState, password: invalidPasswordError}));
                break;
            default:
                setFormErrors((prevState) => ({...prevState, password: ''}));
                break;
        }
    }, [passwordType]);

    // Установка ошибки с сервера
    const setErrorFromServer = (message: string | null) => {
        switch (message) {
            case 'UserNotFound':
                setError(userNotFoundError);
                break;
            case 'WrongPassword':
                setError(wrongPasswordError);
                break;
            case 'NotFilled':
                setError(notFilledError);
                break;
            default:
                setError(message);
                break;
        }
    }

    // Валидация формы
    const validateForm = (name: string, value: string): boolean => {
        switch (name) {
            case 'login':
                setLoginType(validateLogin(value));
                return loginType === LoginType.Email || loginType === LoginType.Nickname;
            case 'password':
                setPasswordType(validatePassword(value));
                return passwordType === PasswordType.Password;
        }

        return false;
    };

    return {formErrors, error, loginLabel, loginType, validateForm, setErrorFromServer};
}

export default useLoginValidation;