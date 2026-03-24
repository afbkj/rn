import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { useEffect, useState } from "react";
import axios from "axios";
import type { LocationType } from "../types/Location";

// TYPES
type Props = {
  setClickedPos: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  locations: LocationType[];
  setLocations: React.Dispatch<React.SetStateAction<LocationType[]>>;
};

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 47.9184,
  lng: 106.9177,
};

export default function MapComponent({
  setClickedPos,
  locations,
  setLocations,
}: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCceq13Gw_umMbjToVe4P0MASR_kONdz4w",
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [selected, setSelected] = useState<LocationType | null>(null);
  const [editSeats, setEditSeats] = useState(0);

  // FETCH
  useEffect(() => {
    axios
      .get<LocationType[]>("http://localhost:5000/locations")
      .then((res) => {
        const cleaned = res.data.map((loc) => ({
          ...loc,
          lat: Number(loc.lat),
          lng: Number(loc.lng),
        }));
        setLocations(cleaned);
      });
  }, []);

  // CLICK MAP
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    setClickedPos({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  // DELETE
  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/locations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setLocations((prev) => prev.filter((l) => l._id !== id));
    setSelected(null);
  };

  // UPDATE
  const handleUpdate = async (id: string) => {
    const res = await axios.put(
      `http://localhost:5000/locations/${id}`,
      { availableSeats: editSeats },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setLocations((prev) =>
      prev.map((l) => (l._id === id ? res.data : l))
    );

    setSelected(res.data);
  };

  // COLOR
  const getMarkerIcon = (seats: number) => {
    if (seats > 10)
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    if (seats > 3)
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onClick={handleMapClick}
    >
      {locations.map((loc) => (
        <Marker
          key={loc._id}
          position={{ lat: loc.lat, lng: loc.lng }}
          icon={getMarkerIcon(loc.availableSeats)}
          onClick={() => {
            setSelected(loc);
            setEditSeats(loc.availableSeats);
          }}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <h3>{selected.name}</h3>

            {role === "admin" && (
              <>
                <input
                  type="number"
                  value={editSeats}
                  onChange={(e) =>
                    setEditSeats(Number(e.target.value))
                  }
                />

                <button onClick={() => handleUpdate(selected._id)}>
                  Update
                </button>

                <button onClick={() => handleDelete(selected._id)}>
                  Delete
                </button>
              </>
            )}

            <p>Seats: {selected.availableSeats}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}