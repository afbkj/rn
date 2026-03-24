import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapComponent from "../components/MapComponent";
import AdminPanel from "../components/AdminPanel";
import type { LocationType } from "../types/Location";

export default function MapPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [locations, setLocations] = useState<LocationType[]>([]);
  const [clickedPos, setClickedPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div className="relative">
      {/* LOGIN / LOGOUT */}
      <div className="absolute top-4 right-4 z-50">
        {!token ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>

      {/* MAP */}
      <MapComponent
        setClickedPos={setClickedPos}
        locations={locations}
        setLocations={setLocations}
      />

      {/* ADMIN */}
      {role === "admin" && (
        <AdminPanel
          clickedPos={clickedPos}
          setLocations={setLocations}
        />
      )}
    </div>
  );
}