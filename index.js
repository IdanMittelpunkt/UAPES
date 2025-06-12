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
 *  Filters (as query parameters) (all optionals):
 *  ==============================
 *  id=<policy id>
 *  author=<email>
 *  status=<active/inactive>
 *  with_rules=<true/false> (defaults to false)
 */
app.get('/policies', validateJWT, async (req, res) => {
    const dbConn = await getDbConn();

    // prepare stages for mongodb collection's aggregate function's pipeline
    let match_obj = {
        'metadata.tenantId': req.app_context['tenant']
    };
    let project_obj = {
        'rules': 0
    };

    // accepted query parameters:
    const qp_id = req.query.id;
    const qp_author = req.query.author;
    const qp_status = req.query.status;
    const qp_withRules = req.query.with_rules;


    if (qp_id) {  // filter by policy id
        try {
            match_obj['_id'] = new ObjectId(qp_id);
        } catch(error) {
            res.status(400).json({message: "Malformed policy id."})
        }
    }

    if (qp_author) {    // filter by author
        match_obj['metadata.author'] = qp_author
    }

    if ( (qp_status) && (['active', 'inactive'].includes(qp_status)) ){ // filter by status
        match_obj['status'] = qp_status
    }

    if ( qp_withRules === 'true' ) {   // show rules in resultset ?
        delete project_obj['rules'];
    }

    // build aggregation pipeline for mongodb
    let aggregate_pipeline = [
        {$match: match_obj},
    ];
    if (Object.keys(project_obj).length > 0) {
        aggregate_pipeline.push({$project: project_obj});
    }

    const policies = await
        dbConn
            .db('rules')
            .collection('policies')
            .aggregate(aggregate_pipeline)
            .toArray();

    res.status(200).json(policies);
});

/**
 *  DELETE /policies
 *
 *  Filters (as query parameters):
 *  ==============================
 *  id=<policy id> (mandatory)
 */
app.delete('/policies', validateJWT, async (req, res) => {
    const dbConn = await getDbConn();

    const qp_policyId = req.query.id;

    let match_obj = {
        'metadata.tenantId': req.app_context['tenant']
    };

    // prepare a query
    if (qp_policyId) {
        try {
            match_obj['_id'] = new ObjectId(qp_policyId);
        } catch(error) {
            res.status(400).json({message: "Malformed policy id."})
        }
    } else {
        res.status(400).json({message: "No policy identifier was provided."})
    }

    // find the policy document by its identifier
    let policies = await dbConn
        .db('rules')
        .collection('policies')
        .deleteOne(match_obj)

    if (policies.deletedCount === 1) {
        res.status(200).json({message: "success"});
    } else {
        res.status(404).json({message: "failure"});
    }
});


app.listen(3000, () => {
   console.log('Service is running on port 3000');
});

