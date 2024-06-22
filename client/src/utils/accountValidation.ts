export enum LoginType {
    Nickname,
    Email
}

export enum LoginValidationResult {
    Valid,
    LoginRequiredError,
    InvalidLoginError
}

export enum PasswordValidationResult {
    Valid,
    PasswordRequiredError,
    InvalidPasswordError
}

export const getLoginType = (value: string): LoginType | null => {
    if (validateEmail(value)) {
        return LoginType.Email;
    } else if (validateNickname(value)) {
        return LoginType.Nickname;
    }

    return null;
}

export const validateLogin = (value: string): LoginValidationResult => {
    if (!value) {
        return LoginValidationResult.LoginRequiredError;
    }

    if (validateEmail(value)) {
        return LoginValidationResult.Valid;
    } else if (validateNickname(value)) {
        return LoginValidationResult.Valid;
    }

    return LoginValidationResult.InvalidLoginError;
};

export const validateEmail = (value: string): boolean => {
    const emailRegex =
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    return emailRegex.test(value);
};

export const validateNickname = (value: string): boolean => {
    const nicknameRegex = /^[a-zA-Z0-9_]{5,32}$/;
    return nicknameRegex.test(value);
};

export const validatePassword = (value: string): PasswordValidationResult => {
    const minLength = 6;

    if (!value) {
        return PasswordValidationResult.PasswordRequiredError;
    }

    if (value.length < minLength) {
        return PasswordValidationResult.InvalidPasswordError;
    }

    return PasswordValidationResult.Valid;
};
