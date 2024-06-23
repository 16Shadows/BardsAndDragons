export const LoginFormFields = {
    login: "login",
    password: "password"
} as const;

export type LoginFormFields = typeof LoginFormFields[keyof typeof LoginFormFields];

export type LoginFormState = Record<LoginFormFields, string>;
