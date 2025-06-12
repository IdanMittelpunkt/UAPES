const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

let dbConnection;   // will hold our db connection to mongo db

async function getDbConn() {
    if (dbConnection) {
        return dbConnection;
    }

    const mongoClient = new MongoClient('mongodb://localhost:27017/rules');

    try {
        await mongoClient.connect();
        dbConnection = mongoClient;
        return dbConnection;
    } catch (error) {
        await mongoClient.close();
        throw error;
    }
}


/**
 * A middleware to validate JWT token
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function validateJWT(req, res, next) {
    // get auth header value
    const authHeader = req.headers['authorization'];
    // get JWT secret of the platform, assumed to be an environment variable
    const JWT_SECRET = process.env.JWT_SECRET;

    if (typeof JWT_SECRET !== 'undefined') {    // if not found JWT secret to verify the signature...
        if (typeof authHeader !== 'undefined') {  // if not found HTTP authorization header...
            const headerValueSplits = authHeader.split(' ');
            if ( (headerValueSplits.length === 2) && (headerValueSplits[0] === 'Bearer') ) { // if invalid structure of authorization header...
                const jwtToken = headerValueSplits[1];
                // verify the signature and validity of the JWT token
                jwt.verify(jwtToken, JWT_SECRET, (err, authData) => {
                    if (err) {
                        console.error("JWT verification failed:", err.message);
                        return res.status(403).json({ message: 'Forbidden: Invalid or expired JWT token.' });
                    }
                    // store the JWT token claims in the request as the application context
                    req.app_context = authData;
                    next();
                });
            } else {
                return res.status(401).json({ message: 'Unauthorized: Malformatted authentication header.' });
            }
        } else {
            return res.status(401).json({ message: 'Unauthorized: No authentication header provided.' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized: Could not find a secret to validate JWT token.' });
    }
}


/**
 *  GET /policies
 *
 *  Automatically scopes the resultset to the tenant of the caller
 *
 *  Filters (as query parameters) (all optionals):
 *  ==============================
 *  policy_id=<policy id>
 *  author=<email>
 *  status=<active/inactive>
 *  contains_rule_id=<rule_id>
 *  with_rules=<true/false> (defaults to false)
 *  expand_rules=<true/false> (relevant only if with_rules==true)
 */
app.get('/policies', validateJWT, async (req, res) => {
    const dbConn = await getDbConn();

    // prepare stages for mongodb collection's aggregate function's pipeline
    let match_obj = {
        'metadata.tenantId': req.app_context['tenant']
    };
    let project_obj = {};
    let lookup_obj = {}

    // accepted query parameters:
    const qp_policyId = req.query.id;
    const qp_author = req.query.author;
    const qp_status = req.query.status;
    const qp_containsRuleId = req.query.contains_rule_id;
    const qp_withRules = req.query.with_rules;
    const qp_expandRules = req.query.expand_rules;

    if (qp_policyId) {  // filter by policy id
        match_obj['_id'] = new ObjectId(qp_policyId);
    }

    if (qp_author) {    // filter by author
        match_obj['metadata.author'] = qp_author
    }

    if ( (qp_status) && (['active', 'inactive'].includes(qp_status)) ){ // filter by status
        match_obj['status'] = qp_status
    }

    if (qp_containsRuleId) {    // filter by rule id
        match_obj['rule_ids'] = qp_containsRuleId
    }

    if ( qp_withRules === 'false' ) {   // show rules (ids or full documents) in resultset ?
        project_obj['rule_ids'] = 0
    } else if (qp_withRules === 'true' ) {
        if (qp_expandRules === 'true') {
            // need to do a join with the rules collection
            lookup_obj = {
                from: 'rules',
                localField: 'rule_ids',
                foreignField: '_id',
                as: 'rules'
            }
            // do not show the rule_ids array if we already present the full rule sub-documents
            project_obj['rule_ids'] = 0;
        }
    }

    // build aggregation pipeline for mongodb
    let aggregate_pipeline = [{$match: match_obj}];
    if (Object.keys(lookup_obj).length > 0) {
        aggregate_pipeline.push({$lookup: lookup_obj});
    }
    if (Object.keys(project_obj).length > 0) {
        aggregate_pipeline.push({$project: project_obj});
    }

    const policies = await
        dbConn
            .db('rules')
            .collection('policies')
            .aggregate(aggregate_pipeline)
            .toArray();

    res.json(policies);
});

app.listen(3000, () => {
   console.log('Service is running on port 3000');
});

