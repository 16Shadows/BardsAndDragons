import React from 'react';

// TODO: Добавить ссылки!!!
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-links">
           {/* поменять ссылку! */}
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLetg744TF10BrdPjaEXf4EsJ1wz6fyf95&index=1">Политика конфиденциальности и условия</a>
          <br></br>
          <span>© 2024 — "Bards and Dragons"</span>
        </div>

        <div className="footer-support">
          <span className="highlight">Если вы хотите поддержать наш проект</span>
          {/* вставить номер карты и cvc))))) */}
          <span>"номер карты и cvc"</span>
        </div>

        <div className="footer-contact">
          <span className="highlight">Поддержка - напишите нам, если у вас проблема или предложение</span>
          <a href="mailto:info@bardsdragons.ru">info@bardsdragons.ru</a>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;