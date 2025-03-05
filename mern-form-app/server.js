import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Schema & Model
const applicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  currentSchool: { type: String, required: true },
  grade: { type: String, required: true },
  course: { type: String, required: true },
  startDate: { type: Date, required: true },
  emergencyContactName: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  message: { type: String },
});

const Application = mongoose.model("Application", applicationSchema);

// API Routes
// POST Route to submit an application
app.post("/api/sage-training-application", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if an application with the same email already exists
    const existingApplication = await Application.findOne({ email });

    if (existingApplication) {
      return res.status(400).json({ message: `❌ Email ${email} already exists! Please use a different email.` });
    }

    // Create a new application if no duplicate email
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.status(201).json({ message: "✅ Application Submitted Successfully!" });

  } catch (error) {
    console.error("❌ Error Submitting Application:", error);

    // Handle MongoDB duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        message: `❌ Email ${req.body.email} already exists! Please use a different email.`,
      });
    }

    res.status(500).json({ message: "❌ Error Submitting Application", error });
  }
});

// GET Route to fetch all applications
app.get("/api/applications", async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (error) {
    console.error("❌ Error Fetching Applications:", error);
    res.status(500).json({ message: "❌ Error Fetching Applications", error });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
