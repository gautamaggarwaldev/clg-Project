import express from 'express';
import {
  getDomainReport,
  downloadDomainReportPDF,
  getDomainHistory,
} from '../controller/domainController.js';
const router = express.Router();

router.get('/report/:domain', getDomainReport);
router.get('/report/:domain/download', downloadDomainReportPDF);
router.get('/history', getDomainHistory);
export default router;
 