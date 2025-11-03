import express from "express";
const router = express.Router();

// Simple Health Check Route
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
