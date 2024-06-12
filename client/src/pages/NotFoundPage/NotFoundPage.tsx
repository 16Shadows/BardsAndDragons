import React from "react";
import "./NotFoundPage.css";
import picture404 from "../../resources/page404.png"
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="not-found-container">
            <img
                src={picture404}
                alt="404"
                className="not-found-image"
                style={{ width: '500px', height: 'auto' }}
            />
            <div className="not-found-text">
                <h2>О нет... Мы потеряли страницу...</h2>
                <p>Шаловливые гоблины опять все украли! </p>
                <Link to="/">
                    <button className="home-button">
                        ВПЕРЕД ИСКАТЬ!
                    </button>
                </Link>

            </div>
        </div>
    );
};

export default NotFoundPage;