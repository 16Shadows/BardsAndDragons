import React from "react";
import "./NotFoundPage.css"; 

const NotFoundPage = () => {
    return ( 
        // TODO: придумать прикол для оформления 404
        <div className="not-found-container">
            <div className="not-found-text">
            <h1>О нет... Мы потеряли страницу...</h1>
            <p>Шаловливые гоблины опять все украли!</p>
            <p>Не беспокойтесь, исследователи уже отправились на ее поиски.</p>
            </div>
        </div>
    );
};

export default NotFoundPage;