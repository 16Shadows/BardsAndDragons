import React from "react";
import {Route, Routes} from "react-router-dom";

// Pages
import Home from "../../pages/Home";
import Login from "../../pages/login/LoginForm";
import Registration from "../../pages/registration/RegistrationForm";
import ProfilePage from "../../pages/ProfilePage";
import MyGamesPage from "../../pages/MyGamesPage";
import MyFriendsPage from "../../pages/FriendsPage/FriendsPage";
import SearchGamesPage from "../../pages/SearchGamesPage/SearchGamesPage";
import PlayersPage from "../../pages/PlayersPage/PlayersPage";
import ProtectedRoutes from "./ProtectedRoutes";
import TestPage from "../../pages/TestPage";
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
    getRegistrationPageRoute
} from "./Navigation";

const RoutesComponent = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path={getHomeRoute()} element={<Home/>}/>
            <Route path={getLoginPageRoute()} element={<Login/>}/>
            <Route path={getRegistrationPageRoute()} element={<Registration/>}/>
            <Route path={getGamesPageRoute()} element={<SearchGamesPage/>}/>

            {/* Protected routes */}
            <Route element={<ProtectedRoutes fallbackPath={getLoginPageRoute()}/>}>
                <Route path={getMyProfilePageRoute()} element={<ProfilePage/>}/>
                <Route path={getMyGamesPageRoute()} element={<MyGamesPage/>}/>
                <Route path={getFriendsPageRoute()} element={<MyFriendsPage/>}/>

                <Route path={getPlayersPageRoute()} element={<PlayersPage/>}/>
            </Route>

            {/* 404 page */}
            <Route path={getNotFoundRoute()} element={<NotFoundPage/>}/>
        </Routes>
    );
};

export default RoutesComponent;
