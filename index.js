const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());    // needed for the req.body to be as a JavaScript object

// constants:
const POLICY_STATUS = ['active', 'inactive'];
const RULE_STATUS = ['active', 'inactive'];
const BOOLEAN_VALUES = ['true', 'false'];
const RULE_SCOPE = ['user', 'group', 'tenant', 'global'];
const RULE_SCOPE_WITH_ID = ['user', 'group'];
const APPCONTEXT_TENANT_KEY = 'tenant';
const APPCONETXT_USER_KEY = 'sub';
const DB_NAME = 'rules';
const COLLECTION_NAME = 'policies';


/**
 * A method that asynchronously returns a valid connection to mongo db
 * @returns {Promise<MongoClient|*>}
 */
async function getDbConn() {
    if (global.dbConnection) {
        return global.dbConnection;
    }

    const mongoClient = new MongoClient(process.env.MONGODB_URI);

    try {
        await mongoClient.connect();
        global.dbConnection = mongoClient;
        return global.dbConnection;
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
        'metadata.tenantId': req.app_context[APPCONTEXT_TENANT_KEY]
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

    if (qp_status) {
        if (POLICY_STATUS.includes(qp_status)) {
            match_obj['status'] = qp_status
        }
        else {
            res.status(400).json({message: "Invalid policy status."});
        }
    }

    if (qp_withRules) {
        if (BOOLEAN_VALUES.includes(qp_withRules)) {
            if ( qp_withRules === 'true' ) {   // show rules in resultset ?
                delete project_obj['rules'];
            }
        } else {
            res.status(400).json({message: "Invalid with_rules value. Must be " + BOOLEAN_VALUES.join(", ") + "."});
        }
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
            .db(DB_NAME)
            .collection(COLLECTION_NAME)
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

    const qp_id = req.query.id;

    let match_obj = {
        'metadata.tenantId': req.app_context[APPCONTEXT_TENANT_KEY]
    };

    // prepare a query
    if (qp_id) {
        try {
            match_obj['_id'] = new ObjectId(qp_id);
        } catch(error) {
            res.status(400).json({message: "Malformed policy id."})
        }
    } else {
        res.status(400).json({message: "No policy identifier was provided."})
    }

    // find the policy document by its identifier
    let policies = await dbConn
        .db(DB_NAME)
        .collection(COLLECTION_NAME)
        .deleteOne(match_obj)

    if (policies.deletedCount === 1) {
        res.status(200).json({message: "success"});
    } else {
        res.status(404).json({message: "failure"});
    }
});

/**
 * POST /policies
 *
 */
app.post('/policies', validateJWT, async (req, res) => {
    /*
        For some reason, ajv did not play well in validating policies against our schema (./policy_schema.json),
        even when we removed the "$schema" field.
        It is odd, as it works perfectly in https://www.jsonschemavalidator.net/ (that uses Json.NET library)

        After 6 hours working on that, I decided to skip validation, though it is crucial for production.
     */

    const dbConn = await getDbConn();


    let data = req.body;

    const current_timestamp = Date.now();

    // add metadata to the policy object
    data['metadata'] = {
            "author": req.app_context[APPCONETXT_USER_KEY],
            "tenantId": req.app_context[APPCONTEXT_TENANT_KEY],
            "createdAt": current_timestamp,
            "updatedAt": current_timestamp,
            "version": 1
    }

    // add metadata to each rule
    data['rules'].forEach(rule => {
        rule['id'] = uuidv4();
        rule['metadata'] = {
            "author": req.app_context[APPCONETXT_USER_KEY],
            "createdAt": current_timestamp,
            "updatedAt": current_timestamp,
            "version": 1
        }
    });

    const result = await dbConn
        .db(DB_NAME)
        .collection(COLLECTION_NAME)
        .insertOne(data)

    res.status(200).json({ id: result.insertedId });
});

/**
 *  GET /rules
 *
 *   Filters (as query parameters):
 *  ==============================
 *  policy_id=<policy id>
 *  id=<rule id>
 *  policy_status=<policy status>
 *  status=<rule status>
 *  target.scope=<rule target scope>
 *  target.id=<rule target id>
 */
app.get('/rules', validateJWT, async (req, res) => {
    const dbConn = await getDbConn();

    let match_obj = {
        'metadata.tenantId': req.app_context[APPCONTEXT_TENANT_KEY]
    };

    const qp_policy_id = req.query.policy_id;
    const qp_id = req.query.id;
    const qp_policy_status = req.query.policy_status;
    const qp_status = req.query.status;
    const qp_target_scope = req.query['target.scope'];
    const qp_target_id = req.query['target.id'];


    if (qp_policy_id) {
        try {
            match_obj['_id'] = new ObjectId(qp_policy_id);
        } catch (error) {
            res.status(400).json({message: "Malformed policy id."})
        }
    }

    if (qp_id) {
        match_obj['rules.id'] = qp_id;
    }

    if (qp_policy_status) {
        if (POLICY_STATUS.includes(qp_policy_status)) {
            match_obj['status'] = qp_policy_status;
        }
        else {
            res.status(400).json({message: "Invalid policy status. Must be " + POLICY_STATUS.join(", ") + "."});
        }
    }

    if (qp_status) {
        if (RULE_STATUS.includes(qp_status)) {
            match_obj['rules.status'] = qp_status;
        }
        else {
            res.status(400).json({message: "Invalid rule status. Must be " + RULE_STATUS.join(", ") + "."});
        }
    }

    if (qp_target_scope) {
        if (RULE_SCOPE.includes(qp_target_scope)) {
            if (RULE_SCOPE_WITH_ID.includes(qp_target_scope)) {
                if (qp_target_id) {
                    match_obj['rules.target.scope'] = qp_target_scope;
                    match_obj['rules.target.id'] = qp_target_id;
                } else {
                    res.status(400).json({message: "Missing rule target id."});
                }
            } else {
                match_obj['rules.target.scope'] = qp_target_scope;
            }
        } else {
            res.status(400).json({message: "Invalid rule target scope. Must be " + RULE_SCOPE.join(", ") + "."});
        }
    }

    const rules = await dbConn
        .db(DB_NAME)
        .collection(COLLECTION_NAME)
        .aggregate([
            {
                $unwind: "$rules"
            },
            {
                $match: match_obj
            },
            {
                $replaceWith: '$rules'
            }
        ]).toArray();

    res.status(200).json(rules);
});

app.listen(3000, () => {
   console.log('Service is running on port 3000');
});

