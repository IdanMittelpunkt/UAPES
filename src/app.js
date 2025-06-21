import express from 'express';
import policyRoutes from './modules/policy/policy.route.js';
import ruleRoutes from './modules/rule/rule.route.js';
import {errorHandler} from "./common/middleware/errorHandler.js";


const app = express();

app.use(express.json());    // body parser for JSON requests

app.use('/policies', policyRoutes);
app.use('/rules', ruleRoutes);

app.use(errorHandler);  // central error handling logic

export default app;