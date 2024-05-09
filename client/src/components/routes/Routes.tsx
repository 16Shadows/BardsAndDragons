import React from "react";
import {Route, Routes} from "react-router-dom";

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

const RoutesComponent = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path={"/"} element={<Home/>}/>
            <Route path={"/login"} element={<Login/>}/>
            <Route path={"/register"} element={<Registration/>}/>
            <Route path={"/games"} element={<GamesPage/>}/>

            <Route path={"test-page"} element={<TestPage/>}/>

            {/* Protected routes */}
            <Route element={<ProtectedRoutes fallbackPath='/login'/>}>
                <Route path={"/my-profile"} element={<ProfilePage/>}/>
                <Route path={"/my-games"} element={<MyGamesPage/>}/>
                <Route path={"/my-friends"} element={<MyFriendsPage/>}/>

                <Route path={"/players"} element={<PlayersPage/>}/>

                <Route path={"/secure"} element={<SecureComponent/>}/>
            </Route>

            {/* TODO: 404 page */}
            <Route path={"*"} element={<div>404 Not found </div>}/>
        </Routes>)
}

export default RoutesComponent