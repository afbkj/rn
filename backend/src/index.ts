import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";

import Location from "./models/Location";
import User from "./models/User";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();


// =======================
// 🔧 MIDDLEWARE
// =======================

// Enable CORS (allow frontend to talk to backend)
app.use(cors());

// Allow JSON body in requests
app.use(express.json());


// =======================
// 🔐 AUTH MIDDLEWARE
// =======================

// This checks if user is logged in
const auth = (req: any, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  // No token → reject
  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    // Expect format: "Bearer TOKEN"
    const token = header.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, "SECRET_KEY");

    // Attach user info to request
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// This checks if user is ADMIN
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not admin" });
  }
  next();
};


// =======================
// 🗄️ DATABASE CONNECTION
// =======================

mongoose.connect(process.env.MONGO_URI!)
  .then(async () => {
    console.log("MongoDB connected");

    const existing = await User.findOne({ email: "admin@test.com" });

    if (!existing) {
      await User.create({
        email: "admin@test.com",
        password: "123456"
      });
      console.log("Test user created");
    }
  })
  .catch((err) => console.log(err));


// =======================
// 🧪 TEST ROUTE
// =======================

app.get("/", (_req: Request, res: Response) => {
  res.send("API is running...");
});


// =======================
// 📍 LOCATION ROUTES
// =======================

// 🔓 PUBLIC → anyone can view locations
app.get("/locations", async (_req: Request, res: Response) => {
  const locations = await Location.find();
  res.json(locations);
});


// 🔒 ADMIN → add location
app.post(
  "/locations",
  auth,
  isAdmin,
  async (req: Request, res: Response) => {
    const location = new Location(req.body);
    await location.save();
    res.json(location);
  }
);


// 🔒 ADMIN → update location
app.put(
  "/locations/:id",
  auth,
  isAdmin,
  async (req: Request, res: Response) => {
    const updated = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  }
);


// 🔒 ADMIN → delete location
app.delete(
  "/locations/:id",
  auth,
  isAdmin,
  async (req: Request, res: Response) => {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  }
);


// =======================
// 👤 AUTH ROUTES
// =======================

// 📝 REGISTER (for now → creates ADMIN)
app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user
  const user = new User({
    email,
    password: hashed,
    role: "admin", // ⚠️ later change logic
  });

  await user.save();

  res.json(user);
});


// 🔐 LOGIN
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Wrong password" });
  }

  // Create token (contains id + role)
  const token = jwt.sign(
    { id: user._id, role: user.role },
    "SECRET_KEY"
  );

  // Send token to frontend
  res.json({ 
    token, 
    role: user.role,
  });
});


// =======================
// 🚀 START SERVER
// =======================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});