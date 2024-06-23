import { BrowserRouter, useLocation } from "react-router-dom";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import RoutesComponent from "./components/routes/Routes";
import "./css/App.css";
import Container from "react-bootstrap/Container";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const store = createStore({
    authName: "_auth",
    authType: "localstorage",
});

function App() {
    return (
        <AuthProvider store={store}>
            <BrowserRouter>

                <div className="app-container">

                    <header>
                        <Navbar />
                    </header>

                    {/* <Main /> */}
                    <RoutesComponent />

                    <Footer />
                   
                </div>


            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
