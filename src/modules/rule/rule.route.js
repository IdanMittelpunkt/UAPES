import express from 'express';
import jwtTokenMW from '../../common/middleware/jwtToken.js';
import ruleController from './rule.controller.js';

const router = express.Router();

/*
    We decided not to follow the pattern /policy/:id/rule/:id,
    but instead to have /policy and /rule separately.
    The reason was that the agent deals only with rules, without being aware of policies.
 */

// No JWT token - going to be called by a scheduled event AWS Lambda with no user context
router.get('/diff', ruleController.getRuleDiff);


router.get('/', jwtTokenMW, ruleController.getRules);
router.get('/:id', jwtTokenMW, ruleController.getRule);
router.put('/:id', jwtTokenMW, ruleController.updateRule);
router.delete('/:id', jwtTokenMW, ruleController.deleteRule);


export default router;