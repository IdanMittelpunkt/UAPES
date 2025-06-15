import express from 'express';
import jwtTokenMW from '../../common/middleware/jwtToken.js';
import ruleController from './rule.controller.js';

const router = express.Router();

router.get('/', jwtTokenMW, ruleController.getRules);

export default router;