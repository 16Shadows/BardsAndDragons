import React from "react";
import {Route, Routes} from "react-router-dom";
import AuthOutlet from "@auth-kit/react-router/AuthOutlet";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import ProfilePage from "./pages/ProfilePage";
import MyGamesPage from "./pages/MyGamesPage";
import MyFriendsPage from "./pages/MyFriendsPage";
import GamesPage from "./pages/GamesPage";
import PlayersPage from "./pages/PlayersPage";
import SecureComponent from "./pages/SecureComponent";

const RoutesComponent = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path={"/"} element={<Home/>}/>
            <Route path={"/login"} element={<Login/>}/>
            <Route path={"/register"} element={<Registration/>}/>
            <Route path={"/games"} element={<GamesPage/>}/>

            {/* Protected routes */}
            <Route element={<AuthOutlet fallbackPath='/login'/>}>
                <Route path={"/my-profile"} element={<ProfilePage/>}/>
                <Route path={"/my-games"} element={<MyGamesPage/>}/>
                <Route path={"/my-friends"} element={<MyFriendsPage/>}/>

                <Route path={"/players"} element={<PlayersPage/>}/>

                <Route path={"/secure"} element={<SecureComponent/>}/>
            </Route>
        </Routes>)
}

export default RoutesComponent