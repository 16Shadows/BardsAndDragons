import React from "react";
import {Form, Button, Alert} from "react-bootstrap";
import useLoginForm from './useLoginForm';
import {Navigate, useNavigate} from "react-router-dom";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";

const LoginForm = () => {
    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const {formData, formErrors, error, loginLabel, handleChange, handleSubmit} = useLoginForm();

    if (isAuthenticated) {
        // Если пользователь уже авторизован, перенаправляем на главную страницу
        return (
            <Navigate to="/" replace={true}/>
        );
    } else {
        return (
            <CenteredCardWithItem
                title={"Вход в аккаунт"}
                cardBody={
                    (
                        <Form onSubmit={handleSubmit} noValidate>
                            <Form.Group className="mb-3" controlId="login">
                                <Form.Label>{loginLabel}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleChange}
                                    isInvalid={!!formErrors.login}
                                    required/>
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
                                    required/>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.password}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="mb-3 w-100">
                                Войти
                            </Button>

                            {error && <Alert variant="danger">{error}</Alert>}
                        </Form>
                    )
                }
                itemAfterCard={
                    (
                        <div className="text-end">
                            <Button variant="link" onClick={() => navigate("/register")}>Зарегистрироваться</Button>
                        </div>
                    )
                }
            />
        );
    }
};

export default LoginForm;