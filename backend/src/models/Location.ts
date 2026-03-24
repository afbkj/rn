import mongoose from "mongoose";

export interface ILocation {
  name: string;
  lat: number;
  lng: number;
  availableSeats: number;
}

const LocationSchema = new mongoose.Schema<ILocation>({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  availableSeats: { type: Number, default: 0 },
});

export default mongoose.model<ILocation>("Location", LocationSchema);
