import React, {useEffect, useState} from "react";
import {Form, Button, Alert} from "react-bootstrap";
import useLoginForm from './useLoginForm';
import {Navigate, useLocation, useNavigate} from "react-router-dom";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";
import {getHomeRoute, getRegistrationPageRoute} from "../../components/routes/Navigation";
import {LoginType} from "../../utils/accountValidation";
import {LoginFormFields} from "./loginFormTypes";

const LoginForm = () => {
    const location = useLocation();
    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const {formData, formErrors, error, loginType, handleChange, handleSubmit} = useLoginForm();
    const [loginLabel, setLoginLabel] = useState<string>("");

    // Set login label depending on login type
    useEffect(() => {
        switch (loginType) {
            case LoginType.Email:
                setLoginLabel("Email");
                break;
            case LoginType.Nickname:
                setLoginLabel("Ник");
                break;
            default:
                setLoginLabel("Email / Ник");
                break;
        }
    }, [loginType]);

    if (isAuthenticated) {
        // If user is already logged in, redirect to home
        return <Navigate to={getHomeRoute()} replace/>;
    }

    return (
        <CenteredCardWithItem
            title="Вход в аккаунт"
            cardBody={
                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3" controlId={LoginFormFields.login}>
                        <Form.Label>{loginLabel}</Form.Label>
                        <Form.Control
                            type="text"
                            name={LoginFormFields.login}
                            value={formData.login}
                            onChange={handleChange}
                            isInvalid={!!formErrors.login}
                            required
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.login}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId={LoginFormFields.password}>
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            name={LoginFormFields.password}
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!formErrors.password}
                            required
                        />
                        <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mb-3 w-100">
                        Войти
                    </Button>

                    {error && <Alert variant="danger">{error}</Alert>}
                </Form>
            }
            itemAfterCard={
                <div className="text-end">
                    <Button variant="link"
                            onClick={() => navigate(getRegistrationPageRoute(),
                                {
                                    state:
                                        {from: location?.state?.from || getHomeRoute()}
                                })}>
                        Зарегистрироваться
                    </Button>
                </div>
            }
        />
    );
};

export default LoginForm;
