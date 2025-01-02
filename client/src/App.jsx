import "./App.css";
import PhaserGame from "../src/components/PhaserConfig"
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/game" element={<PhaserGame/>} />
      </Routes>
    </div>
  );
}

export default App;
