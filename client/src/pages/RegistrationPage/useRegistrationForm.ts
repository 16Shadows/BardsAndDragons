import {ChangeEvent, FormEvent, useCallback, useState} from "react";
import useRegistrationApi from "./useRegistrationApi";
import useRegistrationValidation from "./useRegistrationValidation";
import {RegistrationFormFields, RegistrationFormState} from "./registrationFormTypes";

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
    const handleChange = useCallback(({currentTarget}: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = currentTarget;
        setFormData((prevState) => ({...prevState, [name]: value}));
        validateInputField(name, value);
        setApiError(null);
    }, [validateInputField, setApiError]);

    // Handles form submission
    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValidForm = (Object.keys(RegistrationFormFields) as RegistrationFormFields[]).every(field =>
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
