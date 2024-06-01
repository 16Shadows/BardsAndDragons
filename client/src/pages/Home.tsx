import React from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../http-common";
import homepage from "../resources/homepage.jpg";
import "../css/Home.css";
import Button from "../components/Button";

const Home = () => {
  return (
    <div>
      <div className="split left home-text d-grid align-items-center ms-5">
        <div>
          <h1>Лучшее приложение для поиска игроков в настолочки</h1>
          <Button color="primary" children={"Начать поиск игроков!"} />
        </div>
      </div>

      <div className="split right">
        <div className="image_preview_container">
          <img className="image" src={homepage} alt="Home boardgame"></img>
        </div>
      </div>
    </div>
  );
};

export default Home;
