export enum LoginType {
    Email = 'email',
    Nickname = 'nickname',
    LoginRequiredError = 'loginRequiredError',
    InvalidLoginError = 'invalidLoginError'
}

export enum PasswordType {
    Password = 'password',
    PasswordRequiredError = 'passwordRequiredError',
    InvalidPasswordError = 'invalidPasswordError'
}

export const validateLogin = (value: string): LoginType => {
    if (!value) {
        return LoginType.LoginRequiredError;
    }

    if (validateEmail(value)) {
        return LoginType.Email;
    } else if (validateNickname(value)) {
        return LoginType.Nickname;
    }

    return LoginType.InvalidLoginError;
};

export const validateEmail = (value: string): boolean => {
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    return emailRegex.test(value);
};

export const validateNickname = (value: string): boolean => {
    const nicknameRegex = /^[a-zA-Z0-9_]{5,32}$/;
    return nicknameRegex.test(value);
};

export const validatePassword = (value: string): PasswordType => {
    const minLength = 6;

    if (!value) {
        return PasswordType.PasswordRequiredError;
    }

    if (value.length < minLength) {
        return PasswordType.InvalidPasswordError;
    }

    return PasswordType.Password;
};
