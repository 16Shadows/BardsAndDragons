import React from "react";
import { Route, Routes } from "react-router-dom";

// Pages
import Home from "../../pages/Home";
import Login from "../../pages/login/LoginForm";
import Registration from "../../pages/registration/RegistrationForm";
import ProfilePage from "../../pages/ProfilePage";
import MyGamesPage from "../../pages/MyGamesPage";
import MyFriendsPage from "../../pages/MyFriendsPage";
import GamesPage from "../../pages/GamesPage";
import PlayersPage from "../../pages/PlayersPage";
import SecureComponent from "../../pages/SecureComponent";
import ProtectedRoutes from "./ProtectedRoutes";
import TestPage from "../../pages/TestPage";
import {
  getFriendsPageRoute,
  getGamesPageRoute,
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
      <Route path={getGamesPageRoute()} element={<SearchGamesPage />} />

      {/* TODO: delete test page in production */}
      <Route path={"test-page"} element={<TestPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoutes fallbackPath={getLoginPageRoute()} />}>
        <Route path={getMyProfilePageRoute()} element={<ProfilePage />} />
        <Route path={getMyGamesPageRoute()} element={<MyGamesPage />} />
        <Route path={getFriendsPageRoute()} element={<MyFriendsPage />} />

        <Route path={"/players"} element={<PlayersPage />} />

        <Route path={"/secure"} element={<SecureComponent />} />
      </Route>

      {/* TODO: 404 page */}
      <Route path={getNotFoundRoute()} element={<div>404 Not found </div>} />
    </Routes>
  );
};

export default RoutesComponent;
