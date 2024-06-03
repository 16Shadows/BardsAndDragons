import React, {useState} from "react";
import useApi from "../http-common";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import {UserData} from "../models/UserData";

const TestPage = () => {
    const api = useApi();
    const [message, setMessage] = useState<string>('');
    const authUser = useAuthUser<UserData>()
    const testQuery = () => {
        // POST запрос к серверу
        api.post('user/test-query-with-auth', {})
            .then(
                (response) => {
                    setMessage(response?.data?.message)
                }
            )
            .catch((error) => {
                setMessage(error?.message)
            });
    }

    return (
        <div>
            <h2>Тестовая страница для проверки редиректов</h2>
            <p>{`Hello, ${authUser?.username}!`}</p>
            <p>{message}</p>
            <button onClick={testQuery}>Check Auth</button>
        </div>
    );
};

export default TestPage;
