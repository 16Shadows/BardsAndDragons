import React from "react";
import {Route, Routes} from "react-router-dom";

// Pages
import Home from "../../pages/Home";
import Login from "../../pages/LoginPage/LoginForm";
import Registration from "../../pages/RegistrationPage/RegistrationForm";
import ProfilePage from "../../pages/ProfilePage";
import MyGamesPage from "../../pages/MyGamesPage/MyGamesPage";
import MyFriendsPage from "../../pages/FriendsPage/FriendsPage";
import SearchGamesPage from "../../pages/SearchGamesPage/SearchGamesPage";
import PlayersPage from "../../pages/PlayersPage/PlayersPage";
import ProtectedRoutes from "./ProtectedRoutes";
import GamePage from "../../pages/GamePage/GamePage";
import OtherPlayerPage from "../../pages/OtherPlayerPage/OtherPlayerPage";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";

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
    getUserProfileRoute,
    getGamePageRoute,
} from "./Navigation";

const RoutesComponent = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path={getHomeRoute()} element={<Home/>}/>
            <Route path={getLoginPageRoute()} element={<Login/>}/>
            <Route path={getRegistrationPageRoute()} element={<Registration/>}/>
            <Route path={getGamesPageRoute()} element={<SearchGamesPage/>}/>

            {/* Dynamic Game Page route */}
            <Route path={getGamePageRoute(":id")} element={<GamePage/>}/>

            {/* Protected routes */}
            <Route element={<ProtectedRoutes fallbackPath={getLoginPageRoute()}/>}>
                <Route path={getMyProfilePageRoute()} element={<ProfilePage/>}/>
                <Route path={getMyGamesPageRoute()} element={<MyGamesPage/>}/>
                <Route path={getFriendsPageRoute()} element={<MyFriendsPage/>}/>
                <Route path={getPlayersPageRoute()} element={<PlayersPage/>}/>

                {/* Dynamic User Profile route */}
                <Route path={getUserProfileRoute(":username")} element={<OtherPlayerPage/>}/>

            </Route>

            {/* 404 page */}
            <Route path={getNotFoundRoute()} element={<NotFoundPage/>}/>

        </Routes>
    );
};

export default RoutesComponent;
