import React, {useState} from 'react';
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import {Navigate, useLocation, useNavigate} from "react-router-dom";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import {UserData} from "../models/UserData";
import useApi from "../http-common";

interface RegistrationFormState {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Registration = () => {
    const isAuthenticated = useIsAuthenticated()
    const signIn = useSignIn<UserData>()
    const navigate = useNavigate()
    const api = useApi()
    const location = useLocation()

    const [formData, setFormData] = useState<RegistrationFormState>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        api.post('/user/register', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
        }).then((response) => {
            if (signIn({
                auth: {
                    token: response.data.token,
                    type: 'Bearer'
                },
                userState: response.data.userState
            })) {
                const from = location.state?.from || '/';
                navigate(from);
            }
        }).catch((error) => {
            console.error(error);
            setError(error.response?.data?.message);
        });
    };

    if (isAuthenticated) {
        return (
            <Navigate to="/" replace={true}/>
        )
    } else {
        return (
            <div>
                <h1>Registration</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <button type="submit">Register</button>
                </form>
            </div>
        );
    }
}

export default Registration
