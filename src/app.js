import express from 'express';

const app = express();

import policyRoutes from './modules/policy/policy.route.js';

app.use(express.json());    // body parser for JSON requests

app.use('/policies', policyRoutes);

export default app;