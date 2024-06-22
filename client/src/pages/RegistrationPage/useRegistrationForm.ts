import {ChangeEvent, FormEvent, useCallback, useState} from "react";
import useRegistrationApi from "./useRegistrationApi";
import useRegistrationValidation from "./useRegistrationValidation";

export interface RegistrationFormState {
    [key: string]: string;

    nickname: string
    email: string
    password: string
    confirmPassword: string
}

const useRegistrationForm = () => {
    const [formData, setFormData] = useState<RegistrationFormState>({
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const {formErrors, error, validateInputField, setApiError} = useRegistrationValidation(formData);
    const {registerUser} = useRegistrationApi();

    // Handles input changes
    const handleChange = useCallback(({target}: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = target;
        setFormData((prevState) => ({...prevState, [name]: value}));
        validateInputField(name, value);
        setApiError(null);
    }, [validateInputField, setApiError]);

    // Handles form submission
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValidForm = ["nickname", "email", "password", "confirmPassword"].every(field =>
            validateInputField(field, formData[field])
        );

        if (isValidForm) {
            const error = await registerUser(formData);
            setApiError(error);
        }
    }, [formData, registerUser, validateInputField, setApiError]);

    return {formData, formErrors, error, handleChange, handleSubmit};
}

export default useRegistrationForm;