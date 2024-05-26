import React from 'react';


const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="row">
        <ul>
          <li><a href="#">Контакты</a></li>
          <li><a href="#">О проекте</a></li>
          <li><a href="#">Политика конфиденциальности</a></li>
          <li><a href="#">Отзывы и предложения</a></li>
        </ul>
      </div>
      
      <div className="row">
        <ul>BardsAndDragons Copyright © 2024 BardsAndDragons - All rights reserved</ul>        
      </div>
    </footer>
  );
};

export default Footer;