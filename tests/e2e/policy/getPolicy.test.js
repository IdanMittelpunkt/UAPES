import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import app from '../../../src/app.js';
import request from 'supertest';


describe('GET /policies/:id', () => {
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
        const policyObj = await Policy.findOne({});
        const policyId = policyObj.toObject().id;
        await request(app)
            .get(`/policies/${policyId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const policyId = policyObj.toObject().id;
        await request(app)
            .get(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should return a policy according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const policyId = policyObj.toObject().id;
        const response = await request(app)
            .get(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
        expect(response.body.id).toBe(policyId);
    });

    it('should return an object of type Policy', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const policyId = policyObj.toObject().id;
        const response = await request(app)
            .get(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
        const policy = new Policy(response.body);
        try {
            await policy.validateSync();
            expect(true).toBe(true);
        } catch (error) {
            expect(true).toBe(false);
        }
    });

    it('should not return a policy of a tenant that is not in the JWT', async () => {
        const policyObj = await Policy.findOne({tenantId: 25});
        const policyId = policyObj.toObject().id;
        const response = await request(app)
            .get(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
        expect(response.statusCode).toBe(403);
        expect(response.text).toEqual("");
    });
});