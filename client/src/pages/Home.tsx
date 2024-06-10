import { useNavigate } from "react-router-dom";
import homepage from "../resources/homepage.jpg";
import "../css/Home.css";
import Button from "../components/Button";
import { getPlayersPageRoute } from "../components/routes/Navigation";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="split left home-text d-grid align-items-center ms-5">
        <div>
          <h1>Лучшее приложение для поиска игроков в настолочки</h1>
          <Button
            onClick={() => {
              navigate(getPlayersPageRoute());
            }}
            color="primary"
            children={"Начать поиск игроков!"}
          />
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
