import express from "express";
import { getDetailedUrlReport, getMyScannedUrls, scanUrl } from "../controller/urlScanController.js";
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

router.post("/scan", protectUser, scanUrl);
router.get("/scan-my-all", protectUser, getMyScannedUrls);
router.get("/report/:id", getDetailedUrlReport);

export default router;
