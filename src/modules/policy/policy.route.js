import express from 'express';
import jwtTokenMW from '../../common/middleware/jwtToken.js';
import policyController from './policy.controller.js';

const router = express.Router();

router.post('/', jwtTokenMW, policyController.createPolicy);

export default router;