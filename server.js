import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // ✅ Ensure latest version is installed

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/models", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ error: "Failed to fetch models from OpenAI" });
  }
});

const PORT = process.env.PORT || 5001; // Change default port to 5001
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

