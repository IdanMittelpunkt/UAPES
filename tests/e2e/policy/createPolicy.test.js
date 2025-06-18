import { __beforeAll, __beforeEach, __afterAll } from '../setup.js'
import app from '../../../src/app.js';
import request from 'supertest';
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import Constants from "../../../src/common/config/constants.js";


describe('POST /policies', () => {
    beforeAll(async () => {
        await __beforeAll();
    });

    beforeEach(async () => {
        await __beforeEach();
    });

    afterAll(async () => {
        await __afterAll();
    });

    it('should be disallowed to call without a valid authentication header', async () => {
        await request(app)
            .post('/policies')
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should accept a valid policy', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(JSON.parse(fileContent))
            .expect(201);
    });

    it('should not accept an invalid policy', async () => {
        function generateRandomString(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }


        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");

        let policy;

        // invalid version field
        policy = JSON.parse(fileContent);
        policy.version = 'some invalid version';
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

        // invalid name field
        policy = JSON.parse(fileContent);
        policy.name = generateRandomString(Constants.POLICY_RULE_NAME_MAX_LENGTH + 1);
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

        // invalid description field
        policy = JSON.parse(fileContent);
        policy.description = generateRandomString(Constants.POLICY_RULE_DESCRIPTION_MAX_LENGTH + 1);
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

        // invalid status field
        policy = JSON.parse(fileContent);
        policy.status = 'some invalid status';
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

        // invalid rules field - empty array
        policy = JSON.parse(fileContent);
        policy.rules = [];
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

        // invalid rules field - invalid rule
        policy = JSON.parse(fileContent);
        policy.rules[0].target.scope = 'some invalid scope';
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(500);

    });

    it('should ignore tenantId if specified but contradicts the JWT', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");

        let policy;

        // invalid tenantId field
        policy = JSON.parse(fileContent);
        policy.tenantId = 100;
        const response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(201);
        expect(response.body.tenantId).toEqual(15);
    });

    it('should ignore author if specified but contradicts the JWT', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");

        let policy;

        // invalid author field
        policy = JSON.parse(fileContent);
        policy.author = 'popeye.sailor@google.com';
        policy.rules[0].author = 'popeye.sailor@google.com';
        const response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
            .expect(201);
        expect(response.body.author).toEqual('idan.mittelpunkt@gmail.com');
        expect(response.body.rules[0].author).toEqual('idan.mittelpunkt@gmail.com');
    });

});