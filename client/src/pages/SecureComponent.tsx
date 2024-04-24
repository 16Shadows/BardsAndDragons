import React from 'react'
import {useNavigate} from 'react-router-dom';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'
import useSignOut from 'react-auth-kit/hooks/useSignOut'
import {UserData} from '../models/UserData'


const SecureComponent = () => {
    const navigate = useNavigate()
    const signOut = useSignOut()
    const authUser = useAuthUser<UserData>()

    const signOutAction = () => {
        signOut()
        navigate('/login')
    }

    return (
        <div>
            <h1>Secure Component</h1>
            <p>{`Hello ${authUser?.username}, your ID is: ${authUser?.id}`}</p>
            <button onClick={signOutAction}>Sign Out!</button>
        </div>
    )
}

export default SecureComponent