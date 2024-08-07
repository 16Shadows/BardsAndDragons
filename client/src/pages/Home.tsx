import { useNavigate } from "react-router-dom";
import "../css/Home.css";
import Button from "../components/Button";
import { getPlayersPageRoute } from "../components/routes/Navigation";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="left home-text d-grid align-items-center ms-5">
        <div>
          <h1 className="home-text">Лучшее приложение для поиска игроков в настолочки</h1>
          <Button
            onClick={() => {
              navigate(getPlayersPageRoute());
            }}
            color="primary"
            children={"Начать поиск игроков!"}
          />
        </div>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default Home;
