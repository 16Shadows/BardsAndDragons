export const validateEmail = (value: string): boolean => {
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    return emailRegex.test(value);
};

export const validateNickname = (value: string): boolean => {
    const nicknameRegex = /^[a-zA-Z0-9_]{5,}$/;
    return nicknameRegex.test(value);
};

export const validatePassword = (value: string): boolean => {
    const minLength = 6;
    return value.length >= minLength;
};