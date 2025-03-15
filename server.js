import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OpenAI Limit Tracker Backend is Running");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
