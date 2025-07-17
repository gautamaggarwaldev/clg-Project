import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/check-breach", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const options = {
    method: "GET",
    url: `https://breachdirectory.p.rapidapi.com/?func=auto&term=${email}`,
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "breachdirectory.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    res.status(200).json({
      email,
      found: response.data.success,
      results: response.data.result || [],
      message: response.data.message || "Scan complete.",
    });
  } catch (error) {
    console.error("API error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error fetching breach data." });
  }
});

export default router;
