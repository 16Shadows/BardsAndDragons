import React, {useState} from 'react';
import useApi from '../http-common';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import {UserData} from '../models/UserData';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {Form, Button, Alert, Col, Row, Card} from 'react-bootstrap';

interface LoginFormState {
    login: string;
    password: string;
}

const Login = () => {
    const isAuthenticated = useIsAuthenticated();
    const signIn = useSignIn<UserData>();
    const navigate = useNavigate();
    const api = useApi();
    const location = useLocation();

    const [formData, setFormData] = useState<LoginFormState>({login: '', password: ''});
    const [formErrors, setFormErrors] = useState<LoginFormState>({login: '', password: ''});
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        api.post('user/login', JSON.stringify(formData))
            .then((response) => {
                if (signIn({
                    auth: {
                        token: response.data.token,
                        type: 'Bearer'
                    },
                    userState: response.data.userState
                })) {
                    navigate(location.state.from);
                }
            })
            .catch((error) => {
                setError(error.response?.data?.message);
            });
    };

    if (isAuthenticated) {
        return (
            <Navigate to="/" replace={true}/>
        );
    } else {
        return (
            <Row className="justify-content-sm-center">
                <Col sm={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h1 className="text-center mb-4">Вход в аккаунт</h1>
                            <Form onSubmit={handleSubmit} noValidate={true}>
                                <Form.Group className="mb-3" controlId="login">
                                    <Form.Label>Email / Ник</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="login"
                                        value={formData.login}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="mb-3 w-100">
                                    Войти
                                </Button>

                                {error && <Alert variant="danger">{error}</Alert>}
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="text-end">
                        <Button variant="link"
                                onClick={() => navigate('/register')}>Зарегистрироваться</Button>
                    </div>
                </Col>
            </Row>
        );
    }
};

export default Login;