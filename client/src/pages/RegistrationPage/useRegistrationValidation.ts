import {useCallback, useState} from "react";
import {
    PasswordValidationResult,
    validateEmail,
    validateNickname,
    validatePassword
} from "../../utils/accountValidation";
import {
    emailAlreadyUseError,
    invalidEmailError,
    invalidNicknameError,
    nicknameAlreadyUseError,
    notFilledError,
    passwordMustContainError,
    passwordRequiredError,
    passwordsNotMatchError
} from "../../utils/errorMessages";
import {RegistrationFormState} from "./useRegistrationForm";

const useRegistrationValidation = (formData: RegistrationFormState) => {
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<RegistrationFormState>>({});

    const setFieldError = useCallback((field: string, isValid: boolean, errorMessage: string) => {
        setFormErrors((prevState) => ({...prevState, [field]: isValid ? "" : errorMessage}));
    }, []);

    const setConfirmPasswordError = useCallback((password: string, confirmPassword: string) => {
        const errorMessage = password !== confirmPassword ? passwordsNotMatchError : "";
        setFormErrors((prevState) => ({...prevState, confirmPassword: errorMessage}));
    }, []);

    const setPasswordError = useCallback((password: string, passwordValidationResult: PasswordValidationResult) => {
        const errors = {
            [PasswordValidationResult.Valid]: "",
            [PasswordValidationResult.PasswordRequiredError]: passwordRequiredError,
            [PasswordValidationResult.InvalidPasswordError]: passwordMustContainError,
        };
        setFormErrors((prevState) => ({...prevState, password: errors[passwordValidationResult]}));
        setConfirmPasswordError(password, formData.confirmPassword);
    }, [setConfirmPasswordError, formData.confirmPassword]);

    const setApiError = useCallback((message: string | null) => {
        const errors: { [key: string]: string } = {
            'NotFilled': notFilledError,
            'nicknameAlreadyUse': nicknameAlreadyUseError,
            'emailAlreadyUse': emailAlreadyUseError,
        };
        setError((message && errors[message]) || message);
    }, []);

    const validateInputField = useCallback((name: string, value: string): boolean => {
        switch (name) {
            case "email":
                const isEmailValid = validateEmail(value);
                setFieldError(name, isEmailValid, invalidEmailError);
                return isEmailValid;
            case "nickname":
                const isNicknameValid = validateNickname(value);
                setFieldError(name, isNicknameValid, invalidNicknameError);
                return isNicknameValid;
            case "password":
                const passwordValidationResult = validatePassword(value);
                setPasswordError(value, passwordValidationResult);
                return passwordValidationResult === PasswordValidationResult.Valid;
            case "confirmPassword":
                setConfirmPasswordError(formData.password, value);
                return value === formData.password;
            default:
                return false;
        }
    }, [setFieldError, setPasswordError, setConfirmPasswordError, formData.password]);

    return {formErrors, error, validateInputField, setApiError};
};

export default useRegistrationValidation;
