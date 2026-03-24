import { useState } from "react";
import axios from "axios";
import type { LocationType } from "../types/Location";

export default function AdminPanel({
    clickedPos,
    setLocations,
}: {
    clickedPos: { lat: number; lng: number } | null;
    setLocations: React.Dispatch<React.SetStateAction<LocationType[]>>;
}) {
    const token = localStorage.getItem("token");

    const [name, setName] = useState("");
    const [seats, setSeats] = useState(0);

    const handleAdd = async () => {
        if (!clickedPos) {
            alert("Click map first");
            return;
        }

        const res = await axios.post(
            "http://localhost:5000/locations",
            {
                name,
                lat: clickedPos.lat,
                lng: clickedPos.lng,
                availableSeats: seats,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        setLocations((prev) => [...prev, res.data]);

        setName("");
        setSeats(0);
    };

    return (
        <div className="absolute top-20 left-6 bg-white/80 backdrop-blur-md p-5 rounded-xl shadow-lg w-64">
            <h2>Admin Panel</h2>

            <input className="w-full mb-2 p-2 rounded border"
                placeholder="Place name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input className="w-full mb-2 p-2 rounded border"
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
            />

            <button className="w-full mb-2 p-2 rounded border" onClick={handleAdd}>Add</button>

            <button className="w-full bg-blue-500 text-white py-2 rounded mb-2"
                onClick={() => {
                    localStorage.clear();
                    location.reload();
                }}
            >
                Logout
            </button>
            
        </div>
    );
}