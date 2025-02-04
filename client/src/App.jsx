import MainLayout from "./components/MainLayout";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import { SocketProvider } from "./context/SocketProvider";

function App() {
  return (
    <SocketProvider>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<MainLayout />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
