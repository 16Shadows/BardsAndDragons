import React from "react";
import {Form, Button, Alert, Col, Row, Card} from "react-bootstrap";
import useLoginForm from './useLoginForm';
import {Navigate, useNavigate} from "react-router-dom";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";

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
            <Row className="justify-content-md-center">
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h1 className="text-center mb-4">Вход в аккаунт</h1>
                            <Form onSubmit={handleSubmit} noValidate>
                                <Form.Group className="mb-3" controlId="login">
                                    <Form.Label>{loginLabel}</Form.Label>
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
                        <Button variant="link" onClick={() => navigate("/register")}>Зарегистрироваться</Button>
                    </div>
                </Col>
            </Row>
        );
    }
};

export default LoginForm;
