import { __beforeAll, __beforeEach, __afterAll } from '../setup.js'
import app from '../../../src/app.js';
import request from 'supertest';
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import Constants from "../../../src/common/config/constants.js";
import {Policy} from "../../../src/modules/policy/policy.model.js";


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
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");
        await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(JSON.parse(fileContent))
            .expect(201);
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
        let response;

        // invalid version field
        policy = JSON.parse(fileContent);
        policy.version = 'some invalid version';
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")

        // invalid name field
        policy = JSON.parse(fileContent);
        policy.name = generateRandomString(Constants.POLICY_RULE_NAME_MAX_LENGTH + 1);
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")

        // invalid description field
        policy = JSON.parse(fileContent);
        policy.description = generateRandomString(Constants.POLICY_RULE_DESCRIPTION_MAX_LENGTH + 1);
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")


        // invalid status field
        policy = JSON.parse(fileContent);
        policy.status = 'some invalid status';
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")

        // invalid rules field - empty array
        policy = JSON.parse(fileContent);
        policy.rules = [];
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")


        // invalid rules field - invalid rule
        policy = JSON.parse(fileContent);
        policy.rules[0].target.scope = 'some invalid scope';
        response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(policy)
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual("")
    });

    it('should return an object of type Policy', async () => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fileContent = readFileSync(join(__dirname, "../resources/valid_policy.json"), "utf8");
        const response = await request(app)
            .post('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(JSON.parse(fileContent))
            .expect(201)
        const policyObj = new Policy(response.body);
        try {
            await policyObj.validateSync();
            expect(true).toBe(true);
        } catch (error) {
            expect(true).toBe(false);
        }
    })

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
        expect(response.body.author).toEqual('idan.mittelpunkt@gmail.com'); // policy level
        expect(response.body.rules[0].author).toEqual('idan.mittelpunkt@gmail.com'); // rule level
    });

});