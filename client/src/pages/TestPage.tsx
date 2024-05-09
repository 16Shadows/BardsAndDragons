import React, {useState} from "react";
import useApi from "../http-common";

const TestPage = () => {
    const api = useApi();
    const [message, setMessage] = useState<string>('');
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
            <p>{message}</p>
            <button onClick={testQuery}>Check Auth</button>
        </div>
    );
};

export default TestPage;
