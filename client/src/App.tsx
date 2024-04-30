import React from "react";
import {BrowserRouter} from "react-router-dom";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import RoutesComponent from "./components/routes/Routes";
import "./css/App.css";

// Components
import Navbar from "./components/Navbar";

const store = createStore({
    authName: "_auth",
    authType: "localstorage",
});

function App() {
    return (
        <AuthProvider store={store}>
            <BrowserRouter>
                <header>
                    <Navbar/>
                </header>
                <main>
                    <RoutesComponent/>
                </main>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
