import { useState } from "react";
import axios from "axios";
import type { LocationType } from "../types/Location";

type Props = {
    clickedPos: { lat: number; lng: number } | null;
    setLocations: React.Dispatch<React.SetStateAction<LocationType[]>>;
};

export default function AdminPanel({
    clickedPos,
    setLocations,
}: Props) {
    const [name, setName] = useState("");
    const [seats, setSeats] = useState(0);

    const token = localStorage.getItem("token");

    const handleAdd = async () => {
        if (!clickedPos) return alert("Click map first");

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
    };

    return (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow z-50">
            <h3>Admin Panel</h3>

            <input
                placeholder="Place name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
            />

            <button onClick={handleAdd}>Add</button>
        </div>
    );
}