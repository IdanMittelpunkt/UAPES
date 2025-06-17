import dotenv from 'dotenv';

dotenv.config();

const config = {
    // node.js process TCP port
    port: process.env.PORT,
    // uri for mongodb
    mongodbUri: process.env.MONGODB_URI,
    // jwt secret to validate JWT tokens
    jwtSecret: process.env.JWT_SECRET
}

export default config;