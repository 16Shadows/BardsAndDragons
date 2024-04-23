import jwt from 'jsonwebtoken';
import {UserPayload} from "./UserPayload";

export const signJwt = (payload: UserPayload) => {
    const secretKey = process.env.JWT_SECRET_KEY;
    return jwt.sign(payload.getPayload(), secretKey, {expiresIn: '7d'});
};

export const verifyJwt = (token: string): UserPayload | null => {
    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        return jwt.verify(token, secretKey) as UserPayload;
    } catch (error) {
        return null;
    }
};