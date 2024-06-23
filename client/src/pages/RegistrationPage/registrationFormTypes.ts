export const RegistrationFormFields = {
    nickname: "nickname",
    email: "email",
    password: "password",
    confirmPassword: "confirmPassword"
} as const;

export type RegistrationFormFields = typeof RegistrationFormFields[keyof typeof RegistrationFormFields];

export type RegistrationFormState = Record<RegistrationFormFields, string>;
