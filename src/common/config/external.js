const config = {
    // node.js process TCP port
    port: process.env.PORT || 3000,
    // uri for mongodb
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rules',
    // jwt secret to validate JWT tokens
    jwtSecret: process.env.JWT_SECRET || 'mysecret'
}

export default config;