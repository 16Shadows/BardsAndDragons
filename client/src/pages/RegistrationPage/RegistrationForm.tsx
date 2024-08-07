import React from "react";
import {Navigate} from "react-router-dom";
import {Alert, Button, Form} from "react-bootstrap";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import useRegistrationForm from "./useRegistrationForm";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";
import {getHomeRoute} from "../../components/routes/Navigation";
import {RegistrationFormFields} from "./registrationFormTypes";

const RegistrationForm = () => {
    const isAuthenticated = useIsAuthenticated();
    const {formData, formErrors, error, handleChange, handleSubmit} = useRegistrationForm();

    if (isAuthenticated) {
        return <Navigate to={getHomeRoute()} replace/>;
    }

    return (
        <CenteredCardWithItem
            title="Регистрация"
            cardBody={
                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3" controlId={RegistrationFormFields.nickname}>
                        <Form.Label>Ник</Form.Label>
                        <Form.Control
                            type="text"
                            name={RegistrationFormFields.nickname}
                            value={formData.nickname}
                            onChange={handleChange}
                            isInvalid={!!formErrors.nickname}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.nickname}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId={RegistrationFormFields.email}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name={RegistrationFormFields.email}
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!formErrors.email}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.email}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-4" controlId={RegistrationFormFields.password}>
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            name={RegistrationFormFields.password}
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!formErrors.password}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.password}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-4" controlId={RegistrationFormFields.confirmPassword}>
                        <Form.Label>Подтвердите пароль</Form.Label>
                        <Form.Control
                            type="password"
                            name={RegistrationFormFields.confirmPassword}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!formErrors.confirmPassword}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {formErrors.confirmPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mb-3 w-100">
                        Зарегистрироваться
                    </Button>

                    {error && <Alert variant="danger">{error}</Alert>}
                </Form>
            }
        />
    );
};

export default RegistrationForm;
