import { useState } from "react";
import "./CSS/App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Home />
    </div>
  );
  // let items = ["f", "s", "g"];

  // const handleSelectItem = (item: string) => {
  //   console.log(item);
  // };

  // return (
  //   <div>
  //     <ListGroup
  //       items={items}
  //       heading="dat List"
  //       onSelectItem={handleSelectItem}
  //     />
  //   </div>
  // );

  // let ch = "dam dis shit";
  // const [alertVisible, setAlertVisibility] = useState(false);

  // return (
  //   <div>
  //     <img src={bdlogo} className="BD-logo" alt="bdlogo" />
  //     {alertVisible && (
  //       <Alert onClose={() => setAlertVisibility(false)}> aboba</Alert>
  //     )}

  //     <Button onClick={() => setAlertVisibility(true)}>ffFff</Button>
  //   </div>
  // );
}

export default App;
