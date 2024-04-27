import React from 'react'
import {useNavigate} from 'react-router-dom'
import useApi from "../http-common";

const Home = () => {
    const navigate = useNavigate()
    const api = useApi()

    const testQuery = () => {
        // POST запрос к серверу
        api.post('user/test-query-with-auth', {})
            .then(
                (response) => {
                    // Показать текст сообшения
                    alert(response.data.message)
                }
            )
            .catch((error) => {
                console.error(error)
                // Вывести текст ошибки
                alert(error.message)
            });
    }

    return (
        <div>
            <h1>Home</h1>
            <button onClick={testQuery}>Check Auth</button>
            <button onClick={() => navigate('/login')}>Go to Login</button>
            <button onClick={() => navigate('/register')}>Go to Register</button>
            <button onClick={() => navigate('/secure')}>GO to Secure Dashboard</button>
        </div>
    )
}

export default Home