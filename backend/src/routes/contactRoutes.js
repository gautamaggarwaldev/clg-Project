import express from 'express';
import { submitContactForm } from '../controller/contactController.js';
import { contactValidationRules } from '../validation/contactValidation.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/team', contactValidationRules, validate, submitContactForm);

export default router;
