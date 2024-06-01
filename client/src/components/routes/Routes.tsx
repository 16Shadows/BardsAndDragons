import { Route, Routes } from "react-router-dom";

// Pages
import Home from "../../pages/Home";
import Login from "../../pages/login/LoginForm";
import Registration from "../../pages/registration/RegistrationForm";
import ProfilePage from "../../pages/ProfilePage";
import MyGamesPage from "../../pages/MyGamesPage";
import MyFriendsPage from "../../pages/MyFriendsPage";
import PlayersPage from "../../pages/PlayersPage";
import ProtectedRoutes from "./ProtectedRoutes";
import {
  getFriendsPageRoute,
  getHomeRoute,
  getLoginPageRoute,
  getMyGamesPageRoute,
  getMyProfilePageRoute,
  getNotFoundRoute,
  getPlayersPageRoute,
  getRegistrationPageRoute,
} from "./Navigation";

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={getHomeRoute()} element={<Home />} />
      <Route path={getLoginPageRoute()} element={<Login />} />
      <Route path={getRegistrationPageRoute()} element={<Registration />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoutes fallbackPath={getLoginPageRoute()} />}>
        <Route path={getMyProfilePageRoute()} element={<ProfilePage />} />
        <Route path={getMyGamesPageRoute()} element={<MyGamesPage />} />
        <Route path={getFriendsPageRoute()} element={<MyFriendsPage />} />

        <Route path={getPlayersPageRoute()} element={<PlayersPage />} />
      </Route>

      {/* TODO: 404 page */}
      <Route path={getNotFoundRoute()} element={<div>404 Not found </div>} />
    </Routes>
  );
};

export default RoutesComponent;
