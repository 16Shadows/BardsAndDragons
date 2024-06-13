import React from 'react';

// TODO: Добавить ссылки!!!
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
           {/* поменять ссылку! */}
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLetg744TF10BrdPjaEXf4EsJ1wz6fyf95&index=1">политика конфиденциальности и условия</a>
        </div>

        <div className="footer-support">
          <span className="highlight">Если вы хотите поддержать наш проект</span>
          <span>"номер карты и cvc"</span>
        </div>

        <div className="footer-contact">
          <span className="highlight">Поддержка - напишите нам, если у вас проблема или предложение</span>
           {/* поменять ссылку! */}
          <a href="mailto:info@bardsdragons.ru">info@bardsdragons.ru</a>

          <span></span>
           {/* поменять ссылку! */}
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLetg744TF10BrdPjaEXf4EsJ1wz6fyf95&index=1">ссылка на офф. группу в BK</a>
        </div>

      </div>

      <div className="footer-copyright">
        <span>BardsAndDragons Copyright © 2024 BardsAndDragons - All rights reserved</span>
      </div>

    </footer>
  );
};

export default Footer;