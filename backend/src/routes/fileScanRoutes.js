import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadAndScanFile,
  getFileScanReport,
  downloadFileReportPDF,
  getReportByHash,
} from '../controller/fileScanController.js';

const router = express.Router();

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Define allowed extensions
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and CSV files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), uploadAndScanFile);
router.get('/report/:scanId', getFileScanReport);
router.get('/report/:scanId/pdf', downloadFileReportPDF);
router.get('/hash-report/:hash', getReportByHash);

export default router;
 