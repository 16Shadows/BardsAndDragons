import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "./CSS/App.css";
import Navbar from "./components/Navbar";
import React from 'react';
import AuthProvider from 'react-auth-kit'
import RoutesComponent from './Routes';
import createStore from 'react-auth-kit/createStore';
// pages
import Home from "./components/Home";
import ProfilePage from "./components/ProfilePage";
import GamesPage from "./components/GamesPage";
import MyGamesPage from "./components/MyGamesPage";
import MyFriendsPage from "./components/MyFriendsPage";
import PlayersPage from "./components/PlayersPage";
        
const store = createStore({
    authName: '_auth',
    authType: 'localstorage'
});

function App() {
  return (

    
    <BrowserRouter>
      <header>
        <Navbar />
          <AuthProvider store={store}>
                  <RoutesComponent/>
          </AuthProvider>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="myprofile" element={<ProfilePage />} />
          <Route path="mygames" element={<MyGamesPage />} />
          <Route path="myfriends" element={<MyFriendsPage />} />
          <Route path="sgames" element={<GamesPage />} />
          <Route path="splayers" element={<PlayersPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;