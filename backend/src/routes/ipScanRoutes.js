import express from 'express';
import { downloadIPReportAsPDF, getAllIPScanHistory, scanIPAddress } from '../controller/ipScanController.js';

const router = express.Router();

router.get('/report/:ip', scanIPAddress);
router.get('/report/:ip/pdf', downloadIPReportAsPDF);
router.get('/history', getAllIPScanHistory);

export default router;
