import React from 'react'
import http from '../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import useSignIn from 'react-auth-kit/hooks/useSignIn'
import {UserData} from '../models/UserData'

import {useNavigate, Navigate} from 'react-router-dom'

const Login = () => {
    const isAuthenticated = useIsAuthenticated()
    const signIn = useSignIn<UserData>()
    const [formData, setFormData] = React.useState({username: '', password: ''})
    const navigate = useNavigate()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        http.post('user/login', JSON.stringify(formData))
            .then((res) => {
                if (res.status === 200) {
                    if (signIn({
                        auth: {
                            token: res.data.token,
                            type: 'Bearer'
                        },
                        userState: res.data.userState
                    })) {
                        navigate('/secure')
                    } else {
                        alert("Error Occoured. Try Again")
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    if (isAuthenticated) {
        return (
            <Navigate to={'/secure'} replace/>
        )
    } else {
        return (
            <form onSubmit={onSubmit}>
                <input type={"username"} onChange={(e) => setFormData({...formData, username: e.target.value})}/>
                <input type={"password"} onChange={(e) => setFormData({...formData, password: e.target.value})}/>

                <button>Submit</button>
            </form>
        )
    }
}

export default Login