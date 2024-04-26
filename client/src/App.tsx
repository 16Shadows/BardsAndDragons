import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "./CSS/App.css";
import Navbar from "./components/Navbar";
// pages
import Home from "./components/Home";
import ProfilePage from "./components/ProfilePage";
import GamesPage from "./components/GamesPage";
import MyGamesPage from "./components/MyGamesPage";
import MyFriendsPage from "./components/MyFriendsPage";
import PlayersPage from "./components/PlayersPage";

function App() {
  return (
    <BrowserRouter>
      <header>
        <Navbar />
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
