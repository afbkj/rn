import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  role: "admin" | "public";
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "public" },
});

export default mongoose.model<IUser>("User", UserSchema);