import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      
      {/* Tus rutas originales */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}