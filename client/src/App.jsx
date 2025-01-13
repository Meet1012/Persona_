import "./App.css";
import MainLayout from "./components/MainLayout";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<MainLayout />} />
      </Routes>
    </div>
  );
}

export default App;
