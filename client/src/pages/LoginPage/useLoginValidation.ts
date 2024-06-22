import {useCallback, useState} from "react";
import {
    LoginValidationResult,
    PasswordValidationResult,
} from "../../utils/accountValidation";
import {
    invalidLoginError,
    invalidPasswordError,
    loginRequiredError,
    notFilledError,
    passwordRequiredError,
    userNotFoundError,
    wrongPasswordError
} from "../../utils/errorMessages";
import {LoginFormState} from "./useLoginForm";

const useLoginValidation = () => {
    const [formErrors, setFormErrors] = useState<LoginFormState>({login: "", password: ""});
    const [error, setError] = useState<string | null>(null);

    const setLoginFormErrors = useCallback((loginValidationResult: LoginValidationResult) => {
        switch (loginValidationResult) {
            case LoginValidationResult.LoginRequiredError:
                setFormErrors((prevState) => ({...prevState, login: loginRequiredError}));
                break;
            case LoginValidationResult.InvalidLoginError:
                setFormErrors((prevState) => ({...prevState, login: invalidLoginError}));
                break;
            case LoginValidationResult.Valid:
                setFormErrors((prevState) => ({...prevState, login: ''}));
                break;
        }
    }, []);

    const setPasswordFormErrors = useCallback((passwordValidationResult: PasswordValidationResult) => {
        switch (passwordValidationResult) {
            case PasswordValidationResult.PasswordRequiredError:
                setFormErrors((prevState) => ({...prevState, password: passwordRequiredError}));
                break;
            case PasswordValidationResult.InvalidPasswordError:
                setFormErrors((prevState) => ({...prevState, password: invalidPasswordError}));
                break;
            case PasswordValidationResult.Valid:
                setFormErrors((prevState) => ({...prevState, password: ''}));
                break;
        }
    }, []);

    const setApiError = useCallback((message: string | null) => {
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
    }, []);

    return {formErrors, error, setLoginFormErrors, setPasswordFormErrors, setApiError};
}

export default useLoginValidation;