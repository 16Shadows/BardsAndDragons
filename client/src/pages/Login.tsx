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

    const validateForm = (name: string, value: string): boolean => {
        let isValid = false;

        if (name === 'login' && !value) {
            setFormErrors((prevState) => ({...prevState, login: 'Логин должен быть заполнен'}));
        } else if (name === 'login' && value) {
            setFormErrors((prevState) => ({...prevState, login: ''}));
            isValid = true;
        } else if (name === 'password' && !value) {
            setFormErrors((prevState) => ({...prevState, password: 'Пароль должен быть заполнен'}));
        } else if (name === 'password' && value) {
            setFormErrors(prevState => ({...prevState, password: ''}));
            isValid = true;
        }

        setError('');
        return isValid;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]: value}));
        validateForm(name, value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Валидация полей
        const isValidLogin = validateForm('login', formData.login)
        const isValidPassword = validateForm('password', formData.password);
        if (!isValidLogin || !isValidPassword) {
            return;
        }

        api.post('user/login', JSON.stringify(formData))
            .then((response) => {
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
            })
            .catch((error) => {
                const message = error.response?.data?.message;

                if (message === 'User not found') {
                    setError('Пользователь не найден');
                } else if (message === 'Wrong password') {
                    setError('Неверный пароль');
                } else if (message === 'Required fields are not filled') {
                    setError('Заполните все обязательные поля');
                } else if (message) {
                    setError(message);
                }
            });
    };

    if (isAuthenticated) {
        return (
            <Navigate to="/" replace={true}/>
        );
    } else {
        return (
            <Row className="justify-content-md-center">
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h1 className="text-center mb-4">Вход в аккаунт</h1>
                            <Form onSubmit={handleSubmit} noValidate>
                                <Form.Group className="mb-3" controlId="login">
                                    <Form.Label>Email / Ник</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="login"
                                        value={formData.login}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.login}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.login}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.password}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.password}
                                    </Form.Control.Feedback>
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