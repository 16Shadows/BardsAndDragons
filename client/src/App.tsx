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

function Main() {
    const location = useLocation();
  
    // Check if the current route is the homepage
    const isHomepage = location.pathname === "/";
  
    return (
      <main className={`${isHomepage ? "main-homepage-background" : "main"}`}>
        <Container> {/* Ensure fluid container to take full width */}
          <RoutesComponent />
        </Container>
      </main>
    );
  }

function App() {
    return (
        <AuthProvider store={store}>
            <BrowserRouter>

                <div className="app-container">

                    <header>
                        <Navbar />
                    </header>

                    <Main />

                    <Footer />
                   
                </div>


            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
