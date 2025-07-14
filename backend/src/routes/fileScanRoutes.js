import express from 'express';
import multer from 'multer';
import {
  uploadAndScanFile,
  getFileScanReport,
  downloadFileReportPDF,
} from '../controller/fileScanController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadAndScanFile);
router.get('/report/:scanId', getFileScanReport);
router.get('/report/:scanId/pdf', downloadFileReportPDF);

export default router;
