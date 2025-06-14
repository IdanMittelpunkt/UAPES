import config from '../config/external.js';
import jwt  from 'jsonwebtoken';

/**
 * A middleware to validate JWT token, and set its content as an app context in the request
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const validateJWT = (req, res, next)  => {
    // get auth header value
    const authHeader = req.headers['authorization'];
    // get JWT secret of the platform, assumed to be an environment variable
    const JWT_SECRET = config.jwtSecret;

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

}

export default validateJWT;