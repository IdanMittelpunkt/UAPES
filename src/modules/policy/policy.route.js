import express from 'express';
import jwtTokenMW from '../../common/middleware/jwtToken.js';
import policyController from './policy.controller.js';

const router = express.Router();

router.get('/', jwtTokenMW, policyController.getPolicies);
router.get('/:id', jwtTokenMW, policyController.getPolicy);
router.post('/', jwtTokenMW, policyController.createPolicy);

export default router;