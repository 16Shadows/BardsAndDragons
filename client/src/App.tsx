import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "./CSS/App.css";
import Navbar from "./components/Navbar";
import React from "react";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import RequireAuth from "@auth-kit/react-router/RequireAuth";

// pages
import Home from "./components/Home";
import ProfilePage from "./components/ProfilePage";
import GamesPage from "./components/GamesPage";
import MyGamesPage from "./components/MyGamesPage";
import MyFriendsPage from "./components/MyFriendsPage";
import PlayersPage from "./components/PlayersPage";
import Login from "./pages/Login";
import SecureComponent from "./pages/SecureComponent";
import Registration from "./pages/Registration";

const store = createStore({
  authName: "_auth",
  authType: "localstorage",
});

function App() {
  return (
    <AuthProvider store={store}>
      <BrowserRouter>
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path={"/"} element={<Home />} />
            <Route path={"/myprofile"} element={<ProfilePage />} />
            <Route path={"/mygames"} element={<MyGamesPage />} />
            <Route path={"/myfriends"} element={<MyFriendsPage />} />
            <Route path={"/sgames"} element={<GamesPage />} />
            <Route path={"/splayers"} element={<PlayersPage />} />
            <Route path={"/login"} element={<Login />} />
            <Route path={"/register"} element={<Registration />} />
            <Route
              path={"/secure"}
              element={
                <RequireAuth fallbackPath={"/login"}>
                  <SecureComponent />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
