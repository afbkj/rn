import { Routes, Route, Navigate } from "react-router-dom";
import MapPage from "./pages/MapPage";
import Login from "./Login";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* 🌍 PUBLIC MAP */}
      <Route path="/" element={<MapPage />} />

      {/* 🔐 LOGIN */}
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/" />}
      />
    </Routes>
  );
}