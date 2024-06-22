import {ChangeEvent, FormEvent, useCallback, useState} from "react";
import {
    getLoginType,
    LoginType,
    LoginValidationResult,
    PasswordValidationResult,
    validateLogin,
    validatePassword
} from "../../utils/accountValidation";
import useLoginValidation from "./useLoginValidation";
import useLoginApi from "./useLoginApi";

export interface LoginFormState {
    login: string;
    password: string;
}

const useLoginForm = () => {
    const {loginByEmail, loginByNickname} = useLoginApi();
    const {formErrors, error, setLoginFormErrors, setPasswordFormErrors, setApiError} = useLoginValidation();

    const [formData, setFormData] = useState<LoginFormState>({login: "", password: ""});
    const [loginType, setLoginType] = useState<LoginType | null>(null);

    // Handles input changes
    const handleChange = useCallback(({target}: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = target;
        setFormData((prevState) => ({...prevState, [name]: value}));

        // If name is login, set login type
        if (name === "login") setLoginType(getLoginType(value));
    }, []);

    // Handles form submission
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let errorApi: string | null = null;
        const isValidLogin = validateLogin(formData.login);
        const isValidPassword = validatePassword(formData.password);

        // Set form errors
        setLoginFormErrors(isValidLogin);
        setPasswordFormErrors(isValidPassword);

        if (isValidLogin === LoginValidationResult.Valid && isValidPassword === PasswordValidationResult.Valid) {
            // Call login API depending on login type
            errorApi = loginType === LoginType.Email
                ? await loginByEmail(formData)
                : await loginByNickname(formData);
        }

        // Set API error
        setApiError(errorApi);
    }, [formData, setLoginFormErrors, setPasswordFormErrors, setApiError, loginType, loginByEmail, loginByNickname]);

    return {formData, formErrors, error, loginType, handleChange, handleSubmit};
};

export default useLoginForm;
