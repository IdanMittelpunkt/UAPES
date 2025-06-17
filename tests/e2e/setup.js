import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import {Policy} from "../../src/modules/policy/policy.model.js";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import Constants from "../../src/common/config/constants.js";

export const __beforeAll = async () => {
    // create a mongodb memory server
    try {
        const mongoServer = await MongoMemoryServer.create({
            instance: {
                dbName: Constants.DB_NAME
            }
        });
        const mongoUri = mongoServer.getUri(Constants.DB_NAME);
        console.log("MongoDB connection string: ", mongoUri);

        // connect to mongodb memory server
        await mongoose.connect(mongoUri);


        // setting environment variables
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        process.env.PORT = 40000;
        process.env.MONGODB_URI = mongoUri;
        process.env.JWT_SECRET = "mysecret";
        process.env.JWT_TOKEN = readFileSync(join(__dirname, "/resources/jwtToken_tenantId15.txt"), "utf8");
    } catch (error) {
        console.log("Error: ", error.message);
        process.exit(1);
    }
};

export const __beforeEach = async () => {
    await Policy.deleteMany({});

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const policies = JSON.parse(
        readFileSync(join(__dirname, "/resources/full_db.json"), "utf8")
    );
    await Policy.insertMany(policies);
}

export const __afterAll = async () => {
    await mongoose.connection.close();
};