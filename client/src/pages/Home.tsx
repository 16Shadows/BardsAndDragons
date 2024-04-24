import React from 'react'
import {useNavigate} from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    return (
        <div>
            <h1>Home</h1>
            <button onClick={() => navigate('/login')}>Go to Login</button>
            <button onClick={() => navigate('/register')}>Go to Register</button>
            <button onClick={() => navigate('/secure')}>GO to Secure Dashboard</button>
        </div>
    )
}

export default Home