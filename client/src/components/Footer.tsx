import React from 'react';


const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#">политика конфы и условия</a>
        </div>
        <div className="footer-support">
          <span className="highlight">Если вы хотите поддержать наш проект</span>
          <span>"номер карты и сvс"</span>
        </div>
        <div className="footer-contact">
          <span className="highlight">Проверка - напишите нам, если у вас проблема или предложение</span>
          <a href="#">почта администрации</a>
          <span></span>
          <a href="#">ссылка на офф. группу в ВК</a>
        </div>
      </div>
      <div className="footer-copyright">
        <span>BardsAndDragons Copyright © 2024 BardsAndDragons - All rights reserved</span>
      </div>
    </footer>
  );
};

export default Footer;