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
import {LoginFormState} from "./loginFormTypes";

const useLoginValidation = () => {
    const [formErrors, setFormErrors] = useState<LoginFormState>({login: "", password: ""});
    const [error, setError] = useState<string | null>(null);

    const setLoginFormErrors = useCallback((loginValidationResult: LoginValidationResult) => {
        const loginErrors: { [key in LoginValidationResult]: string } = {
            [LoginValidationResult.LoginRequiredError]: loginRequiredError,
            [LoginValidationResult.InvalidLoginError]: invalidLoginError,
            [LoginValidationResult.Valid]: ""
        };

        setFormErrors((prevState) => ({...prevState, login: loginErrors[loginValidationResult]}));
    }, []);

    const setPasswordFormErrors = useCallback((passwordValidationResult: PasswordValidationResult) => {
        const passwordErrors: { [key in PasswordValidationResult]: string } = {
            [PasswordValidationResult.PasswordRequiredError]: passwordRequiredError,
            [PasswordValidationResult.InvalidPasswordError]: invalidPasswordError,
            [PasswordValidationResult.Valid]: ""
        };

        setFormErrors((prevState) => ({...prevState, password: passwordErrors[passwordValidationResult]}));
    }, []);

    const setApiError = useCallback((message: string | null) => {
        const apiErrors: { [key: string]: string } = {
            "UserNotFound": userNotFoundError,
            "WrongPassword": wrongPasswordError,
            "NotFilled": notFilledError
        };

        setError((message && apiErrors[message]) || message);
    }, []);

    return {formErrors, error, setLoginFormErrors, setPasswordFormErrors, setApiError};
}

export default useLoginValidation;
