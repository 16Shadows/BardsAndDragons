import React, {useState} from 'react'
import useApi from '../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import useSignIn from 'react-auth-kit/hooks/useSignIn'
import {UserData} from '../models/UserData'
import {useNavigate, Navigate} from 'react-router-dom'

interface LoginFormState {
    login: string;
    password: string;
}

const Login = () => {
    const isAuthenticated = useIsAuthenticated()
    const signIn = useSignIn<UserData>()
    const navigate = useNavigate()
    const api = useApi()

    const [formData, setFormData] = React.useState<LoginFormState>({login: '', password: ''})
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        api.post('user/login', JSON.stringify(formData))
            .then((response) => {
                if (signIn({
                    auth: {
                        token: response.data.token,
                        type: 'Bearer'
                    },
                    userState: response.data.userState
                })) {
                    navigate('/secure')
                }
            })
            .catch((error) => {
                console.error(error);
                setError(error.response?.data?.message);
            });
    }

    if (isAuthenticated) {
        return (
            <Navigate to={'/secure'} replace/>
        )
    } else {
        return (
            <div>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="login">Email / Nickname</label>
                        <input type="login"
                               name="login"
                               value={formData.login}
                               onChange={handleChange}
                               required
                        />
                    </div>
                    <div>
                        <label htmlFor={"password"}>Password</label>
                        <input type="password"
                               name="password"
                               value={formData.password}
                               onChange={handleChange}
                               required
                        />
                    </div>
                    <button type="submit">Login</button>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <p>
                        Don't have an account? <button onClick={() => navigate('/register')}>Register</button>
                    </p>
                </form>
            </div>
        )
    }
}

export default Login