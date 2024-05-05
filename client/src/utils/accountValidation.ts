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
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    const nicknameRegex = /^[a-zA-Z0-9_]{5,}$/;

    if (emailRegex.test(value)) {
        return LoginType.Email;
    } else if (nicknameRegex.test(value)) {
        return LoginType.Nickname;
    }

    return LoginType.InvalidLoginError;
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
